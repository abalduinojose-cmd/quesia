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
  area: string;
  assunto: string | null;
  modalidade: string;
  resumo: string | null;
  situacao?: 'pendente' | 'confirmado' | 'cancelado';
  criado_em?: string;
}

export async function criarAgendamento(
  a: Agendamento
): Promise<{ ok: boolean; erro?: string }> {
  const sb = supabase();
  if (!sb) return { ok: false, erro: 'Supabase não configurado' };
  const { error } = await sb.from('agendamentos').insert({ ...a, situacao: 'pendente' });
  if (error) {
    /* violação de unicidade: alguém pegou o horário primeiro */
    if (error.code === '23505') return { ok: false, erro: 'ocupado' };
    return { ok: false, erro: error.message };
  }
  return { ok: true };
}

/** Horários já tomados, para sumirem da agenda do site. */
export async function lerHorariosTomados(): Promise<string[]> {
  const sb = supabase();
  if (!sb) return [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const { data, error } = await sb
    .from('agendamentos')
    .select('data, hora')
    .neq('situacao', 'cancelado')
    .gte('data', hoje.toISOString().slice(0, 10));
  if (error || !data) return [];
  return data.map((a: { data: string; hora: string }) => `${a.data}T${a.hora.slice(0, 5)}`);
}

export async function listarAgendamentos(): Promise<Agendamento[]> {
  const sb = supabase();
  if (!sb) return [];
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
  if (!sb) return 'Supabase não configurado';
  const { error } = await sb.from('agendamentos').update({ situacao }).eq('id', id);
  return error ? error.message : null;
}
