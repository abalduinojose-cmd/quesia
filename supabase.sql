-- =============================================================================
-- Quesia Constâncio Advocacia · estrutura e segurança do banco (Supabase)
--
-- Cole TUDO isto no SQL Editor do Supabase e clique em RUN. Pode rodar quantas
-- vezes quiser: é idempotente, não duplica nada e não apaga agendamento.
--
-- Há UMA linha para editar, marcada com >>> EDITE AQUI <<<, com o e-mail de
-- quem vai entrar no painel.
-- =============================================================================


-- =============================================================================
-- 0. QUEM É A EQUIPE
--
-- Por que isto existe: no Supabase, "authenticated" quer dizer apenas "tem um
-- login válido neste projeto". Se o cadastro público estiver ligado (é o padrão
-- em projeto novo), qualquer pessoa na internet cria uma conta pelo endpoint de
-- signup e vira authenticated. Como as políticas antigas liberavam tudo para
-- authenticated, essa pessoa passaria a ler nome, telefone e resumo do caso de
-- todos os clientes, e a mexer na agenda.
--
-- Dado de cliente de escritório de advocacia é sigiloso, então aqui a permissão
-- não vem de "estar logado", vem de estar nesta lista.
-- =============================================================================

create table if not exists public.equipe (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  email     text,
  criado_em timestamptz not null default now()
);

alter table public.equipe enable row level security;

-- Cada pessoa só enxerga a própria linha. Ninguém lista a equipe inteira.
drop policy if exists "equipe ve a si mesma" on public.equipe;
create policy "equipe ve a si mesma"
  on public.equipe for select
  to authenticated
  using (user_id = auth.uid());

-- Ninguém entra na equipe pelo site: só por este arquivo, com acesso ao banco.

create or replace function public.eh_equipe()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (select 1 from public.equipe e where e.user_id = auth.uid());
$fn$;

revoke all on function public.eh_equipe() from public;
grant execute on function public.eh_equipe() to authenticated;


-- =============================================================================
-- 1. AGENDA (uma linha só, id = 1, com a grade inteira em JSON)
-- =============================================================================

create table if not exists public.agenda (
  id            int primary key,
  grade         jsonb not null,
  atualizado_em timestamptz not null default now()
);

insert into public.agenda (id, grade)
values (
  1,
  '{
    "atualizadoEm": "",
    "duracaoMin": 60,
    "antecedenciaHoras": 12,
    "diasFuturos": 30,
    "semana": {
      "0": [], "1": [],
      "2": ["14:00","15:00","16:00","17:00"],
      "3": [],
      "4": ["14:00","15:00","16:00","17:00"],
      "5": [], "6": []
    },
    "bloqueios": [],
    "ocupados": []
  }'::jsonb
)
on conflict (id) do nothing;

alter table public.agenda enable row level security;

-- Ler a agenda é público: o site precisa mostrar os horários livres.
drop policy if exists "agenda leitura publica" on public.agenda;
create policy "agenda leitura publica"
  on public.agenda for select
  to anon, authenticated
  using (true);

-- Escrever, só a equipe. Antes bastava estar logado.
drop policy if exists "agenda escrita logada" on public.agenda;
drop policy if exists "agenda escrita equipe" on public.agenda;
create policy "agenda escrita equipe"
  on public.agenda for all
  to authenticated
  using (public.eh_equipe())
  with check (public.eh_equipe());


-- =============================================================================
-- 2. AGENDAMENTOS
-- =============================================================================

create table if not exists public.agendamentos (
  id         bigserial primary key,
  data       date not null,
  hora       time not null,
  nome       text not null,
  contato    text not null,
  area       text not null,
  assunto    text,
  modalidade text not null,
  resumo     text,
  situacao   text not null default 'pendente'
             check (situacao in ('pendente','confirmado','cancelado')),
  criado_em  timestamptz not null default now()
);

alter table public.agendamentos
  add column if not exists contato text not null default '';

-- Teto de tamanho em cada campo. Sem isto, um `resumo` de vários megabytes por
-- requisição enche os 500 MB do plano gratuito em pouco tempo.
alter table public.agendamentos drop constraint if exists agendamentos_tamanhos;
alter table public.agendamentos add constraint agendamentos_tamanhos check (
  char_length(nome)       between 2 and 80   and
  char_length(contato)    between 8 and 120  and
  char_length(area)       <= 60              and
  char_length(modalidade) <= 40              and
  (assunto is null or char_length(assunto) <= 120) and
  (resumo  is null or char_length(resumo)  <= 1000)
);

-- Dois agendamentos no mesmo horário, não. O cancelado devolve a vaga.
drop index if exists agendamentos_horario_unico;
create unique index agendamentos_horario_unico
  on public.agendamentos (data, hora)
  where situacao <> 'cancelado';

-- Usado pela trava de vazão logo abaixo.
create index if not exists agendamentos_criado_em on public.agendamentos (criado_em);

alter table public.agendamentos enable row level security;


-- --- o que o visitante pode fazer -------------------------------------------
--
-- Antes era `with check (true)`: dava para inserir qualquer coisa, inclusive um
-- pedido já marcado como "confirmado" ou com data em 2090. Agora o banco confere.

drop policy if exists "agendamento criar" on public.agendamentos;
create policy "agendamento criar"
  on public.agendamentos for insert
  to anon, authenticated
  with check (
    situacao = 'pendente'
    and data >= current_date
    and data <= current_date + interval '180 days'
  );

-- O visitante NÃO pode ler a tabela. RLS trabalha por linha, não por coluna:
-- liberar SELECT aqui entregaria nome, telefone e resumo do caso de todo mundo.
drop policy if exists "agendamento ver ocupados" on public.agendamentos;

-- A equipe vê e administra tudo. Antes bastava estar logado.
drop policy if exists "agendamento equipe" on public.agendamentos;
create policy "agendamento equipe"
  on public.agendamentos for all
  to authenticated
  using (public.eh_equipe())
  with check (public.eh_equipe());


-- --- carimbo do servidor -----------------------------------------------------
-- `situacao` e `criado_em` são decididos aqui, não pelo navegador de quem envia.

create or replace function public.agendamento_carimbo()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not public.eh_equipe() then
    new.situacao  := 'pendente';
    new.criado_em := now();
  end if;
  return new;
end;
$fn$;

drop trigger if exists agendamento_carimbo_ins on public.agendamentos;
create trigger agendamento_carimbo_ins
  before insert on public.agendamentos
  for each row execute function public.agendamento_carimbo();


-- --- trava de vazão ----------------------------------------------------------
-- Um script pode disparar milhares de pedidos por minuto: enche o banco e, pior,
-- ocupa todos os horários livres, deixando a agenda do site sem nenhuma vaga.
--
-- 30 por hora é folgado para um escritório e corta o abuso automatizado. É um
-- teto global, então em tese alguém pode queimar a cota de propósito e travar a
-- agenda por uma hora. Entre isso e deixar o banco aberto, este é o lado certo
-- para errar. Se aparecer abuso de verdade, o passo seguinte é um CAPTCHA
-- (Cloudflare Turnstile) antes do envio.

create or replace function public.agendamento_vazao()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  recentes int;
begin
  if public.eh_equipe() then
    return new;
  end if;
  select count(*) into recentes
    from public.agendamentos
   where criado_em > now() - interval '1 hour';
  if recentes >= 30 then
    raise exception 'Muitos pedidos em pouco tempo. Tente de novo em alguns minutos.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$fn$;

drop trigger if exists agendamento_vazao_ins on public.agendamentos;
create trigger agendamento_vazao_ins
  before insert on public.agendamentos
  for each row execute function public.agendamento_vazao();


-- --- o que o site lê ---------------------------------------------------------
-- Só quais horários estão tomados. Nunca quem os tomou.

create or replace function public.horarios_ocupados()
returns table (data date, hora time)
language sql
stable
security definer
set search_path = public
as $fn$
  select a.data, a.hora
  from public.agendamentos a
  where a.situacao <> 'cancelado'
    and a.data >= current_date;
$fn$;

revoke all on function public.horarios_ocupados() from public;
grant execute on function public.horarios_ocupados() to anon, authenticated;


-- =============================================================================
-- 3. QUEM ENTRA NO PAINEL
--
-- Antes de rodar esta parte, crie a pessoa em Authentication > Users >
-- Add user > Create new user, com "Auto Confirm User" marcado. A senha você
-- digita ali, e ela não fica gravada em lugar nenhum deste projeto.
--
-- Depois troque o e-mail abaixo pelo mesmo que você cadastrou e rode de novo.
-- =============================================================================

insert into public.equipe (user_id, email)
select u.id, u.email
  from auth.users u
 where u.email = 'quesia@exemplo.com.br'   -- >>> EDITE AQUI <<<
on conflict (user_id) do nothing;


-- =============================================================================
-- 4. CONFERÊNCIA
-- Roda sozinho e mostra se ficou tudo certo.
-- =============================================================================

select
  (select count(*) from public.equipe)       as pessoas_na_equipe,
  (select count(*) from public.agendamentos) as agendamentos,
  (select count(*) from pg_policies
     where schemaname = 'public'
       and tablename = 'agendamentos')       as politicas_agendamentos;

-- Se "pessoas_na_equipe" vier 0, o e-mail do passo 3 não bate com nenhum
-- usuário cadastrado. Confira em Authentication > Users e rode de novo.


-- =============================================================================
-- FALTA UMA COISA QUE NÃO DÁ PARA FAZER POR SQL
--
-- Authentication > Sign In / Providers > Email:
-- desligue "Allow new users to sign up".
--
-- Sem isso, qualquer pessoa cria conta no projeto. Ela não consegue mais ler os
-- clientes, porque agora a permissão vem da tabela equipe, mas continua sendo
-- lixo entrando no seu banco de usuários.
-- =============================================================================
