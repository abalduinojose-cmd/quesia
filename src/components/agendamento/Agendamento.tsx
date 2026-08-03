import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import {
  descreveEscolha,
  diasDisponiveis,
  gradePadrao,
  type Dia,
  type Grade,
} from '@/lib/grade';
import {
  criarAgendamento,
  lerGradeRemota,
  lerHorariosTomados,
  temSupabase,
} from '@/lib/supabase';

/**
 * Agendamento em 4 passos: área, modalidade, dia e horário, dados.
 * A grade vem de /grade.json em tempo de execução, então a equipe publica
 * novos horários sem recompilar o site.
 */

interface Props {
  areasOpcoes: string[];
  assuntos: Record<string, string[]>;
  modalidades: string[];
  intro: string;
  aviso: string;
  numeroWhats: string;
  urlGrade: string;
}

const esquemaNome = z
  .string()
  .trim()
  .min(2, 'Digite o seu nome para incluir na mensagem.')
  .max(80, 'Use um nome mais curto.');

const rotulos = ['Assunto', 'Atendimento', 'Data', 'Dados'];

export default function Agendamento({
  areasOpcoes,
  assuntos,
  modalidades,
  intro,
  aviso,
  numeroWhats,
  urlGrade,
}: Props) {
  const [passo, setPasso] = useState(0);
  const [area, setArea] = useState<string | null>(null);
  const [assunto, setAssunto] = useState<string | null>(null);
  const [modalidade, setModalidade] = useState<string | null>(null);
  const [dia, setDia] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [resumo, setResumo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [grade, setGrade] = useState<Grade>(gradePadrao);
  const [carregando, setCarregando] = useState(true);
  const [dias, setDias] = useState<Dia[]>([]);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const primeiraRender = useRef(true);

  const carregarAgenda = async () => {
    /* Com Supabase a agenda vem do banco e já desconta o que foi reservado.
       Sem Supabase, cai no grade.json publicado. */
    let g: Grade | null = temSupabase ? await lerGradeRemota() : null;
    if (!g) {
      try {
        const r = await fetch(urlGrade, { cache: 'no-store' });
        if (r.ok) g = (await r.json()) as Grade;
      } catch {
        /* segue sem grade: o passo de data oferece combinar pelo WhatsApp */
      }
    }
    if (!g) return null;

    if (temSupabase) {
      const tomados = await lerHorariosTomados();
      g = { ...g, ocupados: [...(g.ocupados ?? []), ...tomados] };
    }
    return g;
  };

  useEffect(() => {
    let vivo = true;
    carregarAgenda()
      .then((g) => {
        if (!vivo || !g) return;
        setGrade(g);
        setDias(diasDisponiveis(g));
      })
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [urlGrade]);

  useEffect(() => {
    if (primeiraRender.current) {
      primeiraRender.current = false;
      return;
    }
    tituloRef.current?.focus({ preventScroll: true });
  }, [passo]);

  const listaAssuntos = area ? (assuntos[area] ?? []) : [];
  /* No passo 0 o voltar desfaz a área escolhida antes de sair do passo. */
  const voltar = () => {
    setErro(null);
    if (passo === 0 && area) {
      setArea(null);
      setAssunto(null);
      return;
    }
    setPasso((p) => Math.max(0, p - 1));
  };

  const escolherArea = (a: string) => {
    setArea(a);
    setAssunto(null);
    /* "Outro assunto" não tem sublista: segue direto */
    if ((assuntos[a] ?? []).length === 0) setPasso(1);
  };

  const validarNome = () => {
    const r = esquemaNome.safeParse(nome);
    setErro(r.success ? null : (r.error.issues[0]?.message ?? 'Confira o nome.'));
    return r;
  };

  const abrirWhats = async () => {
    const r = validarNome();
    if (!r.success) return;

    /* Com banco, reserva o horário antes de abrir o WhatsApp: assim ele some
       para os próximos visitantes. Se alguém pegou primeiro, avisa e volta. */
    if (temSupabase && dia && hora) {
      setEnviando(true);
      const res = await criarAgendamento({
        data: dia,
        hora,
        nome: r.data,
        area: area ?? 'a definir',
        assunto: assunto,
        modalidade: modalidade ?? 'a combinar',
        resumo: resumo.trim() || null,
      });
      setEnviando(false);

      if (!res.ok) {
        if (res.erro === 'ocupado') {
          setErro('Esse horário acabou de ser reservado. Escolha outro, por favor.');
          const g = await carregarAgenda();
          if (g) {
            setGrade(g);
            setDias(diasDisponiveis(g));
          }
          setHora(null);
          setPasso(2);
          return;
        }
        /* falha de rede não pode travar o cliente: segue para o WhatsApp */
      }
    }

    const linhas = [
      'Olá, Dra. Quesia! Vim pelo site e gostaria de agendar um atendimento.',
      `Área: ${area ?? 'a definir'}`,
      ...(assunto ? [`Assunto: ${assunto}`] : []),
      `Atendimento: ${modalidade ?? 'a combinar'}`,
      dia && hora
        ? `Data escolhida: ${descreveEscolha(dia, hora)}`
        : 'Data: prefiro combinar por aqui',
      `Nome: ${r.data}`,
    ];
    if (resumo.trim()) linhas.push(`Resumo: ${resumo.trim()}`);
    const url = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(linhas.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  };

  const escolha = (
    opcoes: string[],
    valor: string | null,
    aoEscolher: (o: string) => void,
    colunas: string
  ) => (
    <div className={`mt-8 grid gap-3 ${colunas}`}>
      {opcoes.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={valor === o}
          onClick={() => aoEscolher(o)}
          className={`group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left text-[0.95rem] transition-all duration-300 ${
            valor === o
              ? 'border-gold bg-gold/10 text-gold'
              : 'border-bone/15 bg-white/[0.03] text-bone hover:border-gold/50 hover:bg-white/[0.06]'
          }`}
        >
          {o}
          <span
            aria-hidden="true"
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
              valor === o
                ? 'border-gold bg-gold text-ink'
                : 'border-bone/25 text-transparent group-hover:border-gold/60'
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 12 12">
              <path
                d="M2 6.2 4.8 9 10 3.4"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      ))}
    </div>
  );

  const diaSelecionado = dias.find((d) => d.iso === dia) ?? null;

  const chips = [
    passo > 0 ? area : null,
    passo > 0 ? assunto : null,
    passo > 1 ? modalidade : null,
    passo > 2 && dia && hora ? descreveEscolha(dia, hora) : null,
  ].filter(Boolean) as string[];

  const pergunta =
    passo === 0
      ? area
        ? `O que você precisa em ${area}?`
        : 'Qual área tem a ver com o seu caso?'
      : passo === 1
        ? 'Como você prefere ser atendido?'
        : passo === 2
          ? 'Escolha o melhor dia e horário'
          : 'Para terminar, como a advogada deve te chamar?';

  return (
    <div className="cartao-escuro overflow-hidden rounded-3xl">
      {/* Trilha de passos */}
      <div className="flex items-stretch border-b border-bone/10">
        {rotulos.map((r, i) => {
          const feito = i < passo;
          const ativo = i === passo;
          return (
            <div
              key={r}
              className={`flex flex-1 items-center gap-2 px-3 py-4 sm:gap-3 sm:px-5 ${
                i > 0 ? 'border-l border-bone/10' : ''
              } ${ativo ? 'bg-white/[0.05]' : ''}`}
            >
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-semibold transition-colors duration-300 ${
                  feito
                    ? 'bg-gold text-ink'
                    : ativo
                      ? 'border border-gold text-gold'
                      : 'border border-bone/25 text-bone-muted'
                }`}
              >
                {feito ? (
                  <svg width="11" height="11" viewBox="0 0 12 12">
                    <path
                      d="M2 6.2 4.8 9 10 3.4"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`rotulo-caps hidden truncate sm:block ${
                  ativo ? 'text-bone' : 'text-bone-muted'
                }`}
              >
                {r}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-7 sm:p-9">
        {chips.length > 0 && (
          <div className="mb-7 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full border border-gold/30 bg-gold/[0.08] px-3.5 py-1.5 text-xs text-gold"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        <h3
          ref={tituloRef}
          tabIndex={-1}
          className="font-display text-[1.65rem] leading-snug text-bone outline-none"
        >
          {pergunta}
        </h3>

        {passo === 0 && !area && (
          <p className="medida-curta mt-3 text-[0.95rem] text-bone-muted">{intro}</p>
        )}
        {passo === 0 && area && listaAssuntos.length > 0 && (
          <p className="medida-curta mt-3 text-[0.95rem] text-bone-muted">
            Escolha o tema mais próximo do seu caso. Assim a advogada já chega na
            conversa sabendo do que se trata.
          </p>
        )}

        <div key={`${passo}-${area ?? ''}`} className="pa-passo">
          {passo === 0 &&
            !area &&
            escolha(areasOpcoes, area, escolherArea, 'sm:grid-cols-2')}

          {passo === 0 && area && listaAssuntos.length > 0 && (
            <div className="mt-8 flex flex-col gap-2.5">
              {listaAssuntos.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={assunto === t}
                  onClick={() => {
                    setAssunto(t);
                    setPasso(1);
                  }}
                  className={`group flex cursor-pointer items-center gap-3.5 rounded-xl border px-5 py-3.5 text-left text-[0.94rem] transition-all duration-300 ${
                    assunto === t
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-bone/15 bg-white/[0.03] text-bone hover:border-gold/50 hover:bg-white/[0.06]'
                  }`}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold/70 transition-transform duration-300 group-hover:scale-150"
                    aria-hidden="true"
                  />
                  <span className="flex-1">{t}</span>
                  <span
                    className="text-gold/0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-gold"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>
              ))}
            </div>
          )}

          {passo === 1 &&
            escolha(
              modalidades,
              modalidade,
              (o) => {
                setModalidade(o);
                setPasso(2);
              },
              'sm:grid-cols-3'
            )}

          {/* Passo 3: dia e horário */}
          {passo === 2 && (
            <div className="mt-8">
              {carregando && (
                <p className="text-[0.95rem] text-bone-muted">Carregando os horários…</p>
              )}

              {!carregando && dias.length === 0 && (
                <div className="rounded-2xl border border-bone/15 bg-white/[0.03] p-6">
                  <p className="text-[0.95rem] text-bone-muted">
                    Não há horários publicados no momento. Siga assim mesmo e a
                    advogada combina a data com você pelo WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPasso(3)}
                    className="btn-clean mt-5 text-[0.9rem]"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {!carregando && dias.length > 0 && (
                <>
                  <div className="sem-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2">
                    {dias.map((d) => {
                      const ativo = dia === d.iso;
                      return (
                        <button
                          key={d.iso}
                          type="button"
                          aria-pressed={ativo}
                          onClick={() => {
                            setDia(d.iso);
                            setHora(null);
                          }}
                          className={`flex w-[4.6rem] shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-2xl border px-2 py-3.5 transition-all duration-300 ${
                            ativo
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-bone/15 bg-white/[0.03] text-bone hover:border-gold/50'
                          }`}
                        >
                          <span className="rotulo-caps opacity-70">{d.rotuloDia}</span>
                          <span className="font-display text-[1.5rem] leading-none">
                            {d.numero}
                          </span>
                          <span className="rotulo-caps opacity-70">{d.mes}</span>
                        </button>
                      );
                    })}
                  </div>

                  {diaSelecionado && (
                    <div className="mt-7">
                      <p className="rotulo-caps text-bone-muted">Horários livres</p>
                      <div className="mt-3.5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                        {diaSelecionado.horarios.map((h) => (
                          <button
                            key={h}
                            type="button"
                            aria-pressed={hora === h}
                            onClick={() => {
                              setHora(h);
                              setPasso(3);
                            }}
                            className={`cursor-pointer rounded-xl border px-3 py-3 text-[0.95rem] transition-all duration-300 ${
                              hora === h
                                ? 'border-gold bg-gold/10 text-gold'
                                : 'border-bone/15 bg-white/[0.03] text-bone hover:border-gold/50 hover:bg-white/[0.06]'
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!diaSelecionado && (
                    <p className="mt-5 text-[0.9rem] text-bone-muted">
                      Escolha um dia para ver os horários.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setPasso(3)}
                    className="rotulo-caps mt-7 cursor-pointer text-bone-muted underline underline-offset-4 transition-colors hover:text-bone"
                  >
                    Prefiro combinar a data pelo WhatsApp
                  </button>
                </>
              )}
            </div>
          )}

          {/* Passo 4: dados */}
          {passo === 3 && (
            <div className="mt-8 flex flex-col gap-7">
              <div>
                <label htmlFor="ag-nome" className="rotulo-caps text-bone-muted">
                  Seu nome <span className="text-gold" aria-hidden="true">*</span>
                </label>
                <input
                  id="ag-nome"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Como prefere ser chamado"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onBlur={() => {
                    if (nome.length > 0) validarNome();
                  }}
                  aria-invalid={erro ? true : undefined}
                  aria-describedby={erro ? 'ag-erro' : undefined}
                  className="mt-2.5 w-full rounded-xl border border-bone/15 bg-white/[0.03] px-4 py-3.5 text-bone outline-none transition-colors duration-300 placeholder:text-bone-muted/50 focus:border-gold"
                />
                {erro && (
                  <p id="ag-erro" role="alert" className="mt-2 text-sm text-[#F2B8A2]">
                    {erro}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="ag-resumo" className="rotulo-caps text-bone-muted">
                  Resumo do caso{' '}
                  <span className="normal-case tracking-normal">(opcional)</span>
                </label>
                <textarea
                  id="ag-resumo"
                  rows={3}
                  placeholder="Conte em poucas linhas o que está acontecendo"
                  value={resumo}
                  onChange={(e) => setResumo(e.target.value)}
                  className="mt-2.5 w-full resize-none rounded-xl border border-bone/15 bg-white/[0.03] px-4 py-3.5 text-bone outline-none transition-colors duration-300 placeholder:text-bone-muted/50 focus:border-gold"
                />
              </div>

              <button
                type="button"
                onClick={abrirWhats}
                disabled={enviando}
                className="btn-clean w-full text-[0.95rem] disabled:opacity-60 sm:w-auto sm:self-start"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
                </svg>
                {enviando ? 'Reservando…' : 'Confirmar pelo WhatsApp'}
              </button>

              <p className="text-xs leading-relaxed text-bone-muted">{aviso}</p>
            </div>
          )}
        </div>

        {(passo > 0 || area) && (
          <button
            type="button"
            onClick={voltar}
            className="rotulo-caps mt-8 flex cursor-pointer items-center gap-2 text-bone-muted transition-colors hover:text-bone"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M10 2 4 8l6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Voltar
          </button>
        )}
      </div>
    </div>
  );
}
