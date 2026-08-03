-- =============================================================================
-- Quesia Constâncio Advocacia · estrutura do banco (Supabase)
-- Cole tudo isto no SQL Editor do Supabase e clique em RUN.
-- =============================================================================

-- 1. AGENDA -------------------------------------------------------------------
-- Uma linha só (id = 1) guardando a grade inteira em JSON.
create table if not exists public.agenda (
  id            int primary key,
  grade         jsonb not null,
  atualizado_em timestamptz not null default now()
);

-- Grade inicial: terça e quinta, das 14h às 17h.
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

-- Qualquer visitante do site pode LER a agenda.
drop policy if exists "agenda leitura publica" on public.agenda;
create policy "agenda leitura publica"
  on public.agenda for select
  to anon, authenticated
  using (true);

-- Só quem está logado (a advogada e a equipe) pode ALTERAR.
drop policy if exists "agenda escrita logada" on public.agenda;
create policy "agenda escrita logada"
  on public.agenda for all
  to authenticated
  using (true) with check (true);


-- 2. AGENDAMENTOS -------------------------------------------------------------
create table if not exists public.agendamentos (
  id         bigserial primary key,
  data       date not null,
  hora       time not null,
  nome       text not null,
  area       text not null,
  assunto    text,
  modalidade text not null,
  resumo     text,
  situacao   text not null default 'pendente'
             check (situacao in ('pendente','confirmado','cancelado')),
  criado_em  timestamptz not null default now()
);

-- Impede dois agendamentos no mesmo horário (o cancelado libera a vaga).
drop index if exists agendamentos_horario_unico;
create unique index agendamentos_horario_unico
  on public.agendamentos (data, hora)
  where situacao <> 'cancelado';

alter table public.agendamentos enable row level security;

-- O visitante pode CRIAR o próprio agendamento.
drop policy if exists "agendamento criar" on public.agendamentos;
create policy "agendamento criar"
  on public.agendamentos for insert
  to anon, authenticated
  with check (true);

-- O site precisa saber quais horários já foram tomados (só data e hora).
drop policy if exists "agendamento ver ocupados" on public.agendamentos;
create policy "agendamento ver ocupados"
  on public.agendamentos for select
  to anon
  using (data >= current_date);

-- A equipe logada vê e administra tudo.
drop policy if exists "agendamento equipe" on public.agendamentos;
create policy "agendamento equipe"
  on public.agendamentos for all
  to authenticated
  using (true) with check (true);

-- =============================================================================
-- DEPOIS DE RODAR ISTO:
-- 1. Authentication > Users > Add user: crie o e-mail e a senha da advogada.
--    (deixe "Auto Confirm User" marcado)
-- 2. Project Settings > Data API: copie a Project URL e a chave anon public.
-- 3. Cole as duas no arquivo .env do projeto e rode: npm run build:pages
-- =============================================================================
