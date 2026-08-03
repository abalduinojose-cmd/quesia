import { useEffect, useState } from 'react';
import {
  listarAgendamentos,
  lerGradeRemota,
  mudarSituacao,
  salvarGradeRemota,
  supabase,
  temSupabase,
  type Agendamento,
} from '@/lib/supabase';
import { gradePadrao, iso, nomesDia, nomesMes, type Grade } from '@/lib/grade';

/**
 * Painel da agenda com Supabase: a advogada entra com e-mail e senha, mexe na
 * grade e tudo cai no site na hora, sem publicar arquivo.
 */

const HORAS: string[] = [];
for (let h = 7; h <= 20; h++) HORAS.push(`${String(h).padStart(2, '0')}:00`);

type Aba = 'agendamentos' | 'dias' | 'semana' | 'ajustes';

export default function Painel({ urlGrade }: { urlGrade: string }) {
  const [logado, setLogado] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  const [grade, setGrade] = useState<Grade>(gradePadrao);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [aba, setAba] = useState<Aba>('agendamentos');
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const notificar = (t: string) => {
    setAviso(t);
    window.setTimeout(() => setAviso(null), 2600);
  };

  /* Sessão */
  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setLogado(Boolean(data.session)));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setLogado(Boolean(s)));
    return () => sub.subscription.unsubscribe();
  }, []);

  /* Dados */
  const recarregar = async () => {
    const g = (await lerGradeRemota()) ?? (await buscarGradeArquivo());
    if (g) setGrade(g);
    setAgendamentos(await listarAgendamentos());
  };

  const buscarGradeArquivo = async (): Promise<Grade | null> => {
    try {
      const r = await fetch(urlGrade, { cache: 'no-store' });
      return r.ok ? ((await r.json()) as Grade) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (logado) void recarregar();
  }, [logado]);

  /* Toda alteração salva na hora, sem botão de publicar */
  const aplicar = async (novo: Grade) => {
    setGrade(novo);
    setSalvando(true);
    const erro = await salvarGradeRemota(novo);
    setSalvando(false);
    notificar(erro ? `Não salvou: ${erro}` : 'Salvo, já está no site');
  };

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = supabase();
    if (!sb) return;
    setEntrando(true);
    setErroLogin(null);
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: senha });
    setEntrando(false);
    if (error) setErroLogin('E-mail ou senha incorretos.');
  };

  const sair = async () => {
    await supabase()?.auth.signOut();
    setLogado(false);
  };

  /* ----------------------------------------------------------------- LOGIN */
  if (!temSupabase) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <p className="font-display text-[1.6rem] text-ink">Supabase não configurado</p>
        <p className="mt-3 text-ink-muted">
          Preencha <code className="rounded bg-ink/5 px-1.5">PUBLIC_SUPABASE_URL</code> e{' '}
          <code className="rounded bg-ink/5 px-1.5">PUBLIC_SUPABASE_ANON_KEY</code> no
          arquivo <code className="rounded bg-ink/5 px-1.5">.env</code> e gere o site de
          novo.
        </p>
      </div>
    );
  }

  if (!logado) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-ink px-5">
        <div
          className="absolute inset-0 bg-[radial-gradient(110%_75%_at_50%_0%,rgb(201_168_81/0.16),transparent_62%)]"
          aria-hidden="true"
        />
        <div className="relative w-full max-w-[23rem]">
          <div className="rounded-3xl border border-bone/10 bg-white/[0.04] p-8 backdrop-blur-sm sm:p-9">
            <h1 className="font-display text-[2rem] leading-none text-bone">Agenda</h1>
            <p className="mt-2 text-[0.88rem] text-bone-muted">
              Entre com o seu e-mail e senha.
            </p>
            <form onSubmit={entrar} className="mt-8 flex flex-col gap-3.5">
              <div className="campo">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="campo">
                <label htmlFor="senha">Senha</label>
                <input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              {erroLogin && <p className="text-sm text-[#F2B8A2]">{erroLogin}</p>}
              <button type="submit" disabled={entrando} className="btn-clean mt-2 w-full justify-center">
                {entrando ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- PAINEL */
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const proximosDias: { chave: string; data: Date; horarios: string[] }[] = [];
  for (let i = 0; i < (grade.diasFuturos ?? 30); i++) {
    const d = new Date(hoje);
    d.setDate(d.getDate() + i);
    const horarios = (grade.semana[String(d.getDay())] ?? []).slice().sort();
    if (horarios.length) proximosDias.push({ chave: iso(d), data: d, horarios });
  }

  const tomados = new Set(
    agendamentos.filter((a) => a.situacao !== 'cancelado').map((a) => `${a.data}T${a.hora.slice(0, 5)}`)
  );
  const pendentes = agendamentos.filter((a) => a.situacao === 'pendente').length;

  const abas: { id: Aba; nome: string }[] = [
    { id: 'agendamentos', nome: `Agendamentos${pendentes ? ` (${pendentes})` : ''}` },
    { id: 'dias', nome: 'Próximos dias' },
    { id: 'semana', nome: 'Grade fixa' },
    { id: 'ajustes', nome: 'Ajustes' },
  ];

  return (
    <div className="pb-16">
      <header className="sticky top-0 z-30 border-b border-gold-soft bg-bone/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div>
            <p className="font-display text-[1.15rem] leading-tight">Agenda</p>
            <p className="flex items-center gap-1.5 text-[0.72rem] text-ink-muted">
              <span
                className={`h-1.5 w-1.5 rounded-full ${salvando ? 'bg-[#C9A851]' : 'bg-[#3E9A5F]'}`}
                aria-hidden="true"
              />
              {salvando ? 'salvando…' : 'sincronizado com o site'}
            </p>
          </div>
          <button
            type="button"
            onClick={sair}
            className="rotulo-caps rounded-full px-3 py-2 text-ink-muted transition-colors hover:text-ink"
          >
            Sair
          </button>
        </div>
        <div className="mx-auto w-full max-w-5xl overflow-x-auto px-5 sm:px-8">
          <div className="flex gap-1" role="tablist">
            {abas.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={aba === a.id}
                onClick={() => setAba(a.id)}
                className={`rotulo-caps whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
                  aba === a.id
                    ? 'border-gold-deep text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                {a.nome}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
        {/* AGENDAMENTOS */}
        {aba === 'agendamentos' && (
          <section>
            <h2 className="font-display text-[1.4rem]">Agendamentos recebidos</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Chegam sozinhos quando o cliente conclui pelo site.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {agendamentos.length === 0 && (
                <div className="cartao rounded-2xl p-6 text-ink-muted">
                  Nenhum agendamento por enquanto.
                </div>
              )}
              {agendamentos.map((a) => (
                <div key={a.id} className="cartao rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[1.2rem] leading-tight">{a.nome}</p>
                      <p className="mt-1 text-[0.85rem] text-ink-muted">
                        {nomesDia[new Date(a.data + 'T12:00').getDay()]},{' '}
                        {new Date(a.data + 'T12:00').getDate()} de{' '}
                        {nomesMes[new Date(a.data + 'T12:00').getMonth()]} às{' '}
                        {a.hora.slice(0, 5)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[0.7rem] font-medium ${
                        a.situacao === 'confirmado'
                          ? 'bg-[#3E9A5F]/12 text-[#2F7A49]'
                          : a.situacao === 'cancelado'
                            ? 'bg-ink/8 text-ink-muted line-through'
                            : 'bg-[#C9A851]/15 text-gold-deep'
                      }`}
                    >
                      {a.situacao}
                    </span>
                  </div>

                  <p className="mt-3 text-[0.9rem] text-ink">
                    {a.area}
                    {a.assunto ? ` · ${a.assunto}` : ''} · {a.modalidade}
                  </p>
                  {a.resumo && (
                    <p className="mt-2 text-[0.88rem] text-ink-muted">{a.resumo}</p>
                  )}

                  {a.situacao !== 'cancelado' && (
                    <div className="mt-4 flex gap-2">
                      {a.situacao !== 'confirmado' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await mudarSituacao(a.id!, 'confirmado');
                            void recarregar();
                            notificar('Confirmado');
                          }}
                          className="rotulo-caps rounded-full border border-[#3E9A5F]/40 px-4 py-2 text-[#2F7A49] transition-colors hover:bg-[#3E9A5F] hover:text-bone"
                        >
                          Confirmar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          await mudarSituacao(a.id!, 'cancelado');
                          void recarregar();
                          notificar('Cancelado, horário liberado');
                        }}
                        className="rotulo-caps rounded-full border border-ink/15 px-4 py-2 text-ink-muted transition-colors hover:border-[#B4462F] hover:text-[#B4462F]"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PRÓXIMOS DIAS */}
        {aba === 'dias' && (
          <section>
            <h2 className="font-display text-[1.4rem]">Próximos dias</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Toque num horário para fechá-lo. Os reservados pelo site aparecem em
              vermelho.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {proximosDias.map(({ chave, data, horarios }) => {
                const bloqueado = grade.bloqueios.includes(chave);
                return (
                  <div
                    key={chave}
                    className={`cartao rounded-2xl p-5 ${bloqueado ? 'opacity-55' : ''}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-display text-[1.15rem]">
                        {nomesDia[data.getDay()]}, {data.getDate()} de{' '}
                        {nomesMes[data.getMonth()]}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          aplicar({
                            ...grade,
                            bloqueios: bloqueado
                              ? grade.bloqueios.filter((x) => x !== chave)
                              : [...grade.bloqueios, chave],
                          })
                        }
                        className={`rotulo-caps rounded-full border px-3.5 py-1.5 transition-colors ${
                          bloqueado
                            ? 'border-[#B4462F] text-[#B4462F]'
                            : 'border-ink/15 text-ink-muted hover:border-[#B4462F] hover:text-[#B4462F]'
                        }`}
                      >
                        {bloqueado ? 'Liberar dia' : 'Bloquear dia'}
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {horarios.map((h) => {
                        const id = `${chave}T${h}`;
                        const reservado = tomados.has(id);
                        const fechado = grade.ocupados.includes(id);
                        return (
                          <button
                            key={h}
                            type="button"
                            disabled={bloqueado || reservado}
                            title={
                              reservado
                                ? 'Reservado por um cliente'
                                : fechado
                                  ? 'Fechado pela equipe'
                                  : 'Livre'
                            }
                            onClick={() =>
                              aplicar({
                                ...grade,
                                ocupados: fechado
                                  ? grade.ocupados.filter((x) => x !== id)
                                  : [...grade.ocupados, id],
                              })
                            }
                            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                              reservado
                                ? 'cursor-default border-[#B4462F]/45 bg-[#B4462F]/10 text-[#B4462F]'
                                : fechado
                                  ? 'border-ink/20 bg-ink/5 text-ink-muted line-through'
                                  : 'border-ink/12 text-ink hover:border-gold-deep/60'
                            }`}
                          >
                            {h}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* GRADE FIXA */}
        {aba === 'semana' && (
          <section>
            <h2 className="font-display text-[1.4rem]">Grade fixa da semana</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Vale para todas as semanas. É a base da agenda.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const ativos = grade.semana[String(d)] ?? [];
                return (
                  <div key={d} className="cartao rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-[1.15rem]">{nomesDia[d]}</p>
                      <span className="text-[0.78rem] text-ink-muted">
                        {ativos.length ? `${ativos.length} horários` : 'sem atendimento'}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {HORAS.map((h) => {
                        const on = ativos.includes(h);
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() =>
                              aplicar({
                                ...grade,
                                semana: {
                                  ...grade.semana,
                                  [String(d)]: on
                                    ? ativos.filter((x) => x !== h)
                                    : [...ativos, h].sort(),
                                },
                              })
                            }
                            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                              on
                                ? 'border-gold-deep bg-gold/15 font-medium text-gold-deep'
                                : 'border-ink/12 text-ink-muted hover:border-gold-deep/50'
                            }`}
                          >
                            {h}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* AJUSTES */}
        {aba === 'ajustes' && (
          <section>
            <h2 className="font-display text-[1.4rem]">Ajustes</h2>
            <div className="cartao mt-5 flex flex-col gap-6 rounded-2xl p-6">
              <label className="flex flex-col gap-2">
                <span className="text-[0.95rem] font-medium">Antecedência mínima</span>
                <span className="text-sm text-ink-muted">
                  Quanto tempo antes o cliente ainda pode escolher um horário.
                </span>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={168}
                    value={grade.antecedenciaHoras}
                    onChange={(e) =>
                      aplicar({ ...grade, antecedenciaHoras: Number(e.target.value) || 0 })
                    }
                    className="w-28 rounded-xl border border-ink/15 bg-bone px-4 py-3 outline-none focus:border-gold-deep"
                  />
                  <span className="text-sm text-ink-muted">horas</span>
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[0.95rem] font-medium">Janela de agendamento</span>
                <span className="text-sm text-ink-muted">
                  Quantos dias à frente aparecem no site.
                </span>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="number"
                    min={7}
                    max={90}
                    value={grade.diasFuturos}
                    onChange={(e) =>
                      aplicar({ ...grade, diasFuturos: Number(e.target.value) || 30 })
                    }
                    className="w-28 rounded-xl border border-ink/15 bg-bone px-4 py-3 outline-none focus:border-gold-deep"
                  />
                  <span className="text-sm text-ink-muted">dias</span>
                </div>
              </label>
            </div>
            <p className="mt-6 text-sm text-ink-muted">
              Tudo o que você muda aqui já vale no site, sem precisar publicar nada.
            </p>
          </section>
        )}
      </main>

      {aviso && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-6 py-3 text-sm text-bone">
          {aviso}
        </div>
      )}
    </div>
  );
}
