-- =============================================================================
-- Limpeza dos agendamentos de teste
--
-- A chave pública do site só consegue CRIAR agendamento, nunca apagar. É de
-- propósito: se ela pudesse apagar, qualquer visitante apagaria a agenda
-- inteira. Por isso esta limpeza precisa passar pelo SQL Editor do Supabase.
--
-- Rode os blocos na ordem. O primeiro só mostra, não altera nada.
-- =============================================================================


-- 1. VEJA O QUE EXISTE ---------------------------------------------------------
-- Rode sozinho primeiro e confira a lista antes de apagar qualquer coisa.

select id, data, hora, nome, contato, area, situacao, criado_em
  from public.agendamentos
 order by data, hora;


-- 2. APAGUE OS TESTES ----------------------------------------------------------
-- Confira os ids na lista acima e escreva-os aqui dentro dos parênteses.
-- Assim você apaga exatamente o que viu, e não o que eu supus.
--
-- Exemplo: where id in (1, 2)

-- delete from public.agendamentos
--  where id in ( COLOQUE_OS_IDS_AQUI );


-- 3. ATALHO, SE PREFERIR -------------------------------------------------------
-- Apaga tudo que tem cara de teste pelo nome. Confira antes trocando o
-- `delete from` por `select * from` e rodando.

-- delete from public.agendamentos
--  where nome ilike '%teste%';


-- =============================================================================
-- DEPOIS DE APAGAR
--
-- O site lê os horários ocupados direto da tabela, então a vaga volta a
-- aparecer sozinha, sem precisar mexer no painel nem gerar o site de novo.
--
-- Se preferir não usar SQL: entrando no painel, cada pedido tem o botão
-- Cancelar. Cancelar não apaga a linha, mas devolve o horário para a agenda,
-- que é o efeito que interessa.
-- =============================================================================
