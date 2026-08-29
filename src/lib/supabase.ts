import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Grade } from './grade';

/**
 * Supabase é opcional: sem as chaves, o site cai no grade.json de sempre e o
 * painel volta ao modo "publicar arquivo". Com as chaves, a agenda passa a ser
 * salva no banco e o site atualiza sozinho.
 *
 * Preencha em .env (na raiz do projeto):
 *   PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
 */
const URL_SUPABASE = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const CHAVE_SUPABASE = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

export const temSupabase = Boolean(URL_SUPABASE && CHAVE_SUPABASE);

let cliente: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!temSupabase) return null;
  if (!cliente) {
    cliente = createClient(URL_SUPABASE, CHAVE_SUPABASE, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return cliente;
}

/* ---------------------------------------------------------------------------
   Por que a falha precisa ter nome

   Todo erro virava a mesma frase na tela: "não consegui salvar agora, tente de
   novo em instantes". Quando o projeto do Supabase ficou pausado, quem tentava
   agendar recebia isso e ia embora, e quem tentava entrar no painel recebia
   "e-mail ou senha incorretos" e queimava as cinco tentativas achando que tinha
   esquecido a senha. Nos dois casos o problema não era nem o horário nem a
   senha: era o banco estar fora do ar.
--------------------------------------------------------------------------- */

export type MotivoFalha =
  | 'rede'       // o banco não respondeu (pausado, sem internet, fora do ar)
  | 'ocupado'    // alguém pegou o horário primeiro
  | 'vazao'      // trava de 30 pedidos por hora do banco
  | 'invalido'   // dado recusado pelas restrições da tabela
  | 'credencial' // e-mail ou senha errados
  | 'outro';

interface ErroBruto {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
}

/** Distingue "o banco respondeu não" de "o banco não respondeu". */
function classificar(erro: ErroBruto | null): MotivoFalha {
  if (!erro) return 'outro';

  /* Códigos do Postgres, que só chegam aqui se o banco respondeu. */
  if (erro.code === '23505') return 'ocupado';
  if (erro.code === 'P0001') return 'vazao';
  if (erro.code === '23514') return 'invalido';

  /* Servidor fora do ar responde 5xx (o Supabase pausado devolve 521/502). */
  if (typeof erro.status === 'number' && erro.status >= 500) return 'rede';

  /* Falha de rede não tem status: o fetch nem chegou a completar. */
  const m = `${erro.name ?? ''} ${erro.message ?? ''}`.toLowerCase();
  if (
    erro.status === 0 ||
    m.includes('failed to fetch') ||
    m.includes('fetch failed') ||
    m.includes('networkerror') ||
    m.includes('network request failed') ||
    m.includes('load failed') ||
    m.includes('retryable')
  ) {
    return 'rede';
  }

  return 'outro';
}

/** Login do painel, separando senha errada de banco fora do ar. */
export async function entrarNoPainel(
  email: string,
  senha: string
): Promise<{ ok: boolean; motivo?: MotivoFalha }> {
  const sb = supabase();
  if (!sb) return { ok: false, motivo: 'outro' };
  try {
    const { error } = await sb.auth.signInWithPassword({ email, password: senha });
    if (!error) return { ok: true };
    const motivo = classificar(error as ErroBruto);
    /* O que sobrou é o próprio Supabase dizendo que a credencial não bate. */
    return { ok: false, motivo: motivo === 'outro' ? 'credencial' : motivo };
  } catch (e) {
    return { ok: false, motivo: classificar(e as ErroBruto) };
  }
}

/* ---------------------------------------------------------------------------
   Agenda (uma linha só, id = 1)
--------------------------------------------------------------------------- */

export async function lerGradeRemota(): Promise<Grade | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('agenda')
    .select('grade')
    .eq('id', 1)
    .maybeSingle();
  if (error || !data) return null;
  return data.grade as Grade;
}

export async function salvarGradeRemota(grade: Grade): Promise<string | null> {
  const sb = supabase();
  if (!sb) return 'Supabase não configurado';
  const { error } = await sb
    .from('agenda')
    .upsert({ id: 1, grade, atualizado_em: new Date().toISOString() });
  return error ? error.message : null;
}

/* ---------------------------------------------------------------------------
   Agendamentos recebidos
--------------------------------------------------------------------------- */

export interface Agendamento {
  id?: number;
  data: string; // AAAA-MM-DD
  hora: string; // HH:MM
  nome: string;
  contato: string; // telefone ou e-mail, para a advogada retornar
  area: string;
  assunto: string | null;
  modalidade: string;
  resumo: string | null;
  situacao?: 'pendente' | 'confirmado' | 'cancelado';
  criado_em?: string;
}

/* ---------------------------------------------------------------------------
   Modo demonstração
   Enquanto o banco não estiver ligado, o agendamento fica guardado só neste
   navegador. Serve para a advogada testar o fluxo inteiro; NÃO é armazenamento
   de verdade e a tela diz isso ao cliente com todas as letras.
--------------------------------------------------------------------------- */
export const CHAVE_DEMO = 'qc-agendamentos-demo';

function lerDemo(): Agendamento[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const cru = JSON.parse(localStorage.getItem(CHAVE_DEMO) ?? '[]');
    return Array.isArray(cru) ? (cru as Agendamento[]) : [];
  } catch {
    return [];
  }
}

function gravarDemo(lista: Agendamento[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(CHAVE_DEMO, JSON.stringify(lista));
}

export async function criarAgendamento(
  a: Agendamento
): Promise<{ ok: boolean; erro?: MotivoFalha; demo?: boolean }> {
  const sb = supabase();

  if (!sb) {
    const lista = lerDemo();
    if (lista.some((x) => x.data === a.data && x.hora === a.hora && x.situacao !== 'cancelado')) {
      return { ok: false, erro: 'ocupado' };
    }
    gravarDemo([
      ...lista,
      { ...a, id: Date.now(), situacao: 'pendente', criado_em: new Date().toISOString() },
    ]);
    return { ok: true, demo: true };
  }

  try {
    /* situacao vai daqui por clareza, mas quem decide é o gatilho do banco:
       o navegador não manda em que estado o pedido nasce. */
    const { error } = await sb.from('agendamentos').insert({ ...a, situacao: 'pendente' });
    if (error) return { ok: false, erro: classificar(error as ErroBruto) };
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: classificar(e as ErroBruto) };
  }
}

/**
 * Guarda o pedido no navegador quando o banco não respondeu, para a pessoa não
 * ter que digitar tudo de novo e para o site poder reenviar sozinho depois.
 * Não substitui o banco: é rede de segurança para não perder o cliente.
 */
const CHAVE_PENDENTE = 'qc-agendamento-pendente';

export function guardarPendente(a: Agendamento): void {
  try {
    localStorage.setItem(CHAVE_PENDENTE, JSON.stringify({ ...a, guardadoEm: Date.now() }));
  } catch {
    /* navegador sem localStorage: sem rede de segurança, mas sem quebrar nada */
  }
}

export function lerPendente(): Agendamento | null {
  try {
    const cru = localStorage.getItem(CHAVE_PENDENTE);
    if (!cru) return null;
    const p = JSON.parse(cru) as Agendamento & { guardadoEm?: number };
    /* Depois de 3 dias o horário provavelmente já passou; não insiste. */
    if (p.guardadoEm && Date.now() - p.guardadoEm > 3 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(CHAVE_PENDENTE);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function esquecerPendente(): void {
  try {
    localStorage.removeItem(CHAVE_PENDENTE);
  } catch {
    /* idem */
  }
}

/**
 * Horários já tomados, para sumirem da agenda do site.
 * Vem da função horarios_ocupados, que devolve só data e hora: o visitante
 * nunca enxerga nome, contato ou resumo de quem agendou.
 */
export async function lerHorariosTomados(): Promise<string[]> {
  const sb = supabase();
  if (!sb) {
    return lerDemo()
      .filter((a) => a.situacao !== 'cancelado')
      .map((a) => `${a.data}T${a.hora.slice(0, 5)}`);
  }
  const { data, error } = await sb.rpc('horarios_ocupados');
  if (error || !data) return [];
  return (data as { data: string; hora: string }[]).map(
    (a) => `${a.data}T${a.hora.slice(0, 5)}`
  );
}

export async function listarAgendamentos(): Promise<Agendamento[]> {
  const sb = supabase();
  if (!sb) {
    const hojeIso = new Date().toISOString().slice(0, 10);
    return lerDemo()
      .filter((a) => a.data >= hojeIso)
      .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`));
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const { data, error } = await sb
    .from('agendamentos')
    .select('*')
    .gte('data', hoje.toISOString().slice(0, 10))
    .order('data', { ascending: true })
    .order('hora', { ascending: true });
  if (error || !data) return [];
  return data as Agendamento[];
}

export async function mudarSituacao(
  id: number,
  situacao: Agendamento['situacao']
): Promise<string | null> {
  const sb = supabase();
  if (!sb) {
    gravarDemo(lerDemo().map((a) => (a.id === id ? { ...a, situacao } : a)));
    return null;
  }
  const { error } = await sb.from('agendamentos').update({ situacao }).eq('id', id);
  return error ? error.message : null;
}
