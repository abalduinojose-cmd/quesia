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
 * Agendamento em 5 passos: área, modalidade, dia e horário, valor, dados.
 * A grade vem de /grade.json em tempo de execução, então a equipe publica
 * novos horários sem recompilar o site.
 */

export interface Honorarios {
  valor: string;
  pergunta: string;
  texto: string;
  opcaoSim: string;
  opcaoNao: string;
  recusaTitulo: string;
  recusaTexto: string;
  recusaLinks: readonly { rotulo: string; href: string }[];
}

interface Props {
  areasOpcoes: string[];
  assuntos: Record<string, string[]>;
  modalidades: string[];
  intro: string;
  aviso: string;
  urlGrade: string;
  honorarios: Honorarios;
  /** Traçado do ícone por área, só nas opções do primeiro passo */
  icones?: Record<string, string>;
  /** Cabeçalho de confiança: quem vai atender */
  foto?: string;
  advogada?: string;
  oab?: string;
}

const esquemaNome = z
  .string()
  .trim()
  .min(2, 'Digite o seu nome completo.')
  .max(80, 'Use um nome mais curto.');

/* Sem WhatsApp no fim do fluxo, o contato é o único caminho de volta até a
   pessoa: aceita telefone (10 a 13 dígitos) ou e-mail. */
const esquemaContato = z
  .string()
  .trim()
  .min(1, 'Precisamos de um telefone ou e-mail para confirmar com você.')
  .refine(
    (v) =>
      /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v) ||
      (v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 13),
    'Confira o telefone com DDD, ou escreva um e-mail válido.'
  );

const rotulos = ['Assunto', 'Atendimento', 'Data', 'Valor', 'Dados'];

export default function Agendamento({
  areasOpcoes,
  assuntos,
  modalidades,
  intro,
  aviso,
  urlGrade,
  honorarios,
  icones,
  foto,
  advogada,
  oab,
}: Props) {
  const [passo, setPasso] = useState(0);
  const [area, setArea] = useState<string | null>(null);
  const [assunto, setAssunto] = useState<string | null>(null);
  const [modalidade, setModalidade] = useState<string | null>(null);
  const [dia, setDia] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [cienteValor, setCienteValor] = useState<boolean | null>(null);
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [resumo, setResumo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [erroContato, setErroContato] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  /* Depois de confirmado, o cartão troca de conteúdo em vez de mandar embora */
  const [confirmado, setConfirmado] = useState<{ demo: boolean } | null>(null);
  /* A grade em si só alimenta a lista de dias; guardamos para recarregar
     quando um horário some no meio do caminho. */
  const [, setGrade] = useState<Grade>(gradePadrao);
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
        /* sem grade não há data para oferecer; o passo 3 avisa isso */
      }
    }
    if (!g) return null;

    /* Sempre descontar o que já foi pedido, venha do banco ou da demonstração:
       senão duas pessoas escolheriam o mesmo horário. */
    const tomados = await lerHorariosTomados();
    return { ...g, ocupados: [...(g.ocupados ?? []), ...tomados] };
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
    /* No passo do valor, o voltar primeiro desfaz a recusa */
    if (passo === 3 && cienteValor === false) {
      setCienteValor(null);
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

  /* Atalho de fora: os cartões de área e o parâmetro ?area= da URL abrem o
     wizard já na lista de temas daquela área, então só falta escolher o tema. */
  useEffect(() => {
    const abrir = (nome: string) => {
      const achou = areasOpcoes.find(
        (o) => o.toLowerCase() === nome.trim().toLowerCase()
      );
      if (!achou) return;
      setPasso(0);
      setErro(null);
      setArea(achou);
      setAssunto(null);
      if ((assuntos[achou] ?? []).length === 0) setPasso(1);
    };

    const daUrl = new URLSearchParams(window.location.search).get('area');
    if (daUrl) abrir(daUrl);

    const ouvir = (e: Event) => abrir(String((e as CustomEvent).detail ?? ''));
    window.addEventListener('qc:area', ouvir);
    return () => window.removeEventListener('qc:area', ouvir);
  }, [areasOpcoes, assuntos]);

  const validarNome = () => {
    const r = esquemaNome.safeParse(nome);
    setErro(r.success ? null : (r.error.issues[0]?.message ?? 'Confira o nome.'));
    return r;
  };

  const validarContato = () => {
    const r = esquemaContato.safeParse(contato);
    setErroContato(r.success ? null : (r.error.issues[0]?.message ?? 'Confira o contato.'));
    return r;
  };

  /** Grava o agendamento. Sem data escolhida não há o que reservar. */
  const confirmar = async () => {
    const rn = validarNome();
    const rc = validarContato();
    if (!rn.success || !rc.success) return;

    if (!dia || !hora) {
      setErro('Volte um passo e escolha o dia e o horário.');
      return;
    }

    setEnviando(true);
    const res = await criarAgendamento({
      data: dia,
      hora,
      nome: rn.data,
      contato: rc.data,
      area: area ?? 'a definir',
      assunto,
      modalidade: modalidade ?? 'a combinar',
      resumo: resumo.trim() || null,
    });
    setEnviando(false);

    if (res.ok) {
      setErro(null);
      setConfirmado({ demo: Boolean(res.demo) });
      return;
    }

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
    setErro('Não consegui salvar agora. Tente de novo em instantes.');
  };

  const escolha = (
    opcoes: string[],
    valor: string | null,
    aoEscolher: (o: string) => void,
    colunas: string
  ) => (
    <div className={`mt-8 grid gap-3 ${colunas}`}>
      {opcoes.map((o, i) => (
        <button
          key={o}
          type="button"
          aria-pressed={valor === o}
          onClick={() => aoEscolher(o)}
          /* com número ímpar de opções, a última ocupa a linha inteira em vez
             de deixar um buraco ao lado */
          className={`group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left text-[0.95rem] transition-all duration-300 ${
            colunas.includes('cols-2') && opcoes.length % 2 === 1 && i === opcoes.length - 1
              ? 'sm:col-span-2'
              : ''
          } ${
            valor === o
              ? 'border-gold bg-gold/10 text-gold'
              : 'border-bone/15 bg-white/[0.03] text-bone hover:border-gold/50 hover:bg-white/[0.06]'
          }`}
        >
          <span className="flex min-w-0 items-center gap-3.5">
            {icones?.[o] && (
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
                  valor === o
                    ? 'border-gold/45 bg-gold/15 text-gold'
                    : 'border-bone/12 bg-white/[0.04] text-bone-muted group-hover:border-gold/35 group-hover:text-gold'
                }`}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <path
                    d={icones[o]}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
            <span className="min-w-0">{o}</span>
          </span>
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
    passo > 3 ? `${honorarios.valor} · ciente` : null,
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
          : passo === 3
            ? cienteValor === false
              ? honorarios.recusaTitulo
              : honorarios.pergunta
            : 'Para terminar, como a advogada deve te chamar?';

  return (
    <div className="cartao-escuro overflow-hidden rounded-3xl">
      {/* Quem vai atender */}
      {advogada && (
        <div className="flex items-center gap-4 border-b border-bone/10 px-7 py-5 sm:px-9">
          {foto && (
            <img
              src={foto}
              alt=""
              width="52"
              height="52"
              loading="lazy"
              decoding="async"
              className="h-13 w-13 shrink-0 rounded-full object-cover object-top ring-1 ring-gold/40"
              style={{ height: '3.25rem', width: '3.25rem' }}
            />
          )}
          <div className="min-w-0">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-bone-muted">
              Quem vai te atender
            </p>
            <p className="mt-1 font-display text-[1.15rem] leading-tight text-bone">
              {advogada}
            </p>
            {oab && <p className="text-[0.78rem] text-bone-muted">{oab}</p>}
          </div>
          <span
            className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-gold/[0.08] px-3 py-1.5 text-[0.72rem] text-gold sm:flex"
            title="Avaliação pública no Google"
          >
            ★ 5,0
          </span>
        </div>
      )}

      {/* Confirmado: o cartão vira recibo e o resto do fluxo sai de cena */}
      {confirmado && (
        <div className="p-7 sm:p-9">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-gold/[0.10] text-gold"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M4.5 12.4 9.4 17.3 19.5 7.2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <h3
            ref={tituloRef}
            tabIndex={-1}
            className="mt-6 font-display text-[1.8rem] leading-snug text-bone outline-none"
          >
            Agendamento registrado
          </h3>
          <p className="medida-curta mt-3 text-[0.97rem] leading-relaxed text-bone-muted">
            {dia && hora
              ? `Guardamos ${descreveEscolha(dia, hora)}. A advogada confirma com você pelo contato que deixou.`
              : 'A advogada confirma com você pelo contato que deixou.'}
          </p>

          <dl className="mt-7 flex flex-col gap-px overflow-hidden rounded-2xl border border-bone/12 bg-bone/10">
            {[
              ['Área', area ?? 'a definir'],
              ['Tema', assunto ?? 'a definir'],
              ['Atendimento', modalidade ?? 'a combinar'],
              ['Nome', nome.trim()],
              ['Contato', contato.trim()],
              ['Valor da consulta', honorarios.valor],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="flex flex-wrap gap-x-4 gap-y-1 bg-ink px-5 py-3.5">
                <dt className="rotulo-caps min-w-[8rem] text-bone-muted">{rotulo}</dt>
                <dd className="min-w-0 flex-1 text-[0.93rem] text-bone">{valor}</dd>
              </div>
            ))}
          </dl>

          {confirmado.demo && (
            <p className="mt-6 rounded-2xl border border-[#C9A851]/35 bg-gold/[0.07] px-5 py-4 text-[0.86rem] leading-relaxed text-gold">
              Modo demonstração: o banco de dados ainda não está ligado, então
              este agendamento ficou guardado só neste navegador e não chegou ao
              escritório.
            </p>
          )}

          <p className="mt-6 text-xs leading-relaxed text-bone-muted">{aviso}</p>
        </div>
      )}

      {/* Trilha de passos */}
      {!confirmado && (
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
      )}

      <div className={`p-7 sm:p-9 ${confirmado ? 'hidden' : ''}`}>
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

        <div key={`${passo}-${area ?? ''}-${cienteValor}`} className="pa-passo">
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
                    Não há horários abertos no momento. A agenda costuma receber
                    datas novas toda semana, vale voltar em alguns dias.
                  </p>
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
                </>
              )}
            </div>
          )}

          {/* Passo 4: valor da consulta */}
          {passo === 3 && cienteValor !== false && (
            <div className="mt-8">
              <p className="medida-curta text-[0.95rem] text-bone-muted">
                {honorarios.texto}
              </p>
              <div className="mt-7 flex flex-col gap-2.5">
                {[
                  { rotulo: honorarios.opcaoSim, sim: true },
                  { rotulo: honorarios.opcaoNao, sim: false },
                ].map((o) => (
                  <button
                    key={o.rotulo}
                    type="button"
                    aria-pressed={cienteValor === o.sim}
                    onClick={() => {
                      setCienteValor(o.sim);
                      if (o.sim) setPasso(4);
                    }}
                    className={`group flex cursor-pointer items-start gap-3.5 rounded-2xl border px-5 py-4 text-left text-[0.95rem] transition-all duration-300 ${
                      cienteValor === o.sim
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-bone/15 bg-white/[0.03] text-bone hover:border-gold/50 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        cienteValor === o.sim
                          ? 'border-gold'
                          : 'border-bone/30 group-hover:border-gold/60'
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                          cienteValor === o.sim ? 'bg-gold' : 'bg-transparent'
                        }`}
                      />
                    </span>
                    <span className="flex-1">{o.rotulo}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Passo 4: quem não quer a consulta particular */}
          {passo === 3 && cienteValor === false && (
            <div className="mt-8 rounded-2xl border border-bone/15 bg-white/[0.03] p-6">
              <p className="medida-curta text-[0.95rem] leading-relaxed text-bone-muted">
                {honorarios.recusaTexto}
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {honorarios.recusaLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-gold/35 px-4 py-2 text-[0.85rem] text-gold transition-colors hover:bg-gold/10"
                  >
                    {l.rotulo}&nbsp;↗
                  </a>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setCienteValor(true);
                  setPasso(4);
                }}
                className="rotulo-caps mt-6 cursor-pointer text-bone-muted underline underline-offset-4 transition-colors hover:text-bone"
              >
                Quero seguir com a consulta particular
              </button>
            </div>
          )}

          {/* Passo 5: dados */}
          {passo === 4 && (
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
                <label htmlFor="ag-contato" className="rotulo-caps text-bone-muted">
                  Telefone ou e-mail{' '}
                  <span className="text-gold" aria-hidden="true">*</span>
                </label>
                <input
                  id="ag-contato"
                  type="text"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(24) 99999-0000"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  onBlur={() => {
                    if (contato.length > 0) validarContato();
                  }}
                  aria-invalid={erroContato ? true : undefined}
                  aria-describedby={erroContato ? 'ag-erro-contato' : 'ag-dica-contato'}
                  className="mt-2.5 w-full rounded-xl border border-bone/15 bg-white/[0.03] px-4 py-3.5 text-bone outline-none transition-colors duration-300 placeholder:text-bone-muted/50 focus:border-gold"
                />
                {erroContato ? (
                  <p id="ag-erro-contato" role="alert" className="mt-2 text-sm text-[#F2B8A2]">
                    {erroContato}
                  </p>
                ) : (
                  <p id="ag-dica-contato" className="mt-2 text-xs text-bone-muted">
                    É por aqui que a advogada confirma o seu horário.
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
                onClick={confirmar}
                disabled={enviando}
                className="btn-final"
              >
                <span className="selo" aria-hidden="true">
                  {enviando ? (
                    <span className="giro" />
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 3v3m8-3v3M3.5 9.5h17M5 6h14a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V7.5A1.5 1.5 0 0 1 5 6Zm3.8 8.4 2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="rotulo">
                  {enviando ? 'Reservando o horário' : 'Confirmar agendamento'}
                  <span className="linha-fina">
                    {enviando
                      ? 'só um instante'
                      : diaSelecionado && hora
                        ? `${diaSelecionado.rotuloDia} ${Number(diaSelecionado.numero)} de ${diaSelecionado.mes}, ${hora}`
                        : 'escolha o dia no passo anterior'}
                  </span>
                </span>
                <svg
                  className="seta-final"
                  width="17"
                  height="17"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8h9M8.5 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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

      {/* Sinais de confiança */}
      <div className="grid grid-cols-1 gap-px border-t border-bone/10 bg-bone/10 sm:grid-cols-2">
        {[
          {
            t: 'Sigilo profissional',
            d: 'O que você contar fica entre você e a advogada.',
            i: 'M12 2.5 5 5.5v5.2c0 4.3 2.9 8.3 7 9.3 4.1-1 7-5 7-9.3V5.5l-7-3Zm0 6.1a1.9 1.9 0 0 1 1 3.5v2a1 1 0 0 1-2 0v-2a1.9 1.9 0 0 1 1-3.5Z',
          },
          {
            t: 'Horário só seu',
            d: 'Ao confirmar, a vaga sai da agenda e ninguém mais a pega.',
            i: 'M8 3v3m8-3v3M3.5 9.5h17M5 6h14a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V7.5A1.5 1.5 0 0 1 5 6Zm3.8 8.4 2 2 4-4',
          },
        ].map((s) => (
          <div key={s.t} className="bg-ink px-6 py-5">
            <div className="flex items-start gap-3">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                className="mt-0.5 shrink-0 text-gold"
                aria-hidden="true"
              >
                <path d={s.i} fill="currentColor" />
              </svg>
              <div>
                <p className="text-[0.86rem] font-medium text-bone">{s.t}</p>
                <p className="mt-1 text-[0.78rem] leading-relaxed text-bone-muted">
                  {s.d}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
