import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';

/**
 * Wizard de 3 passos que abre o WhatsApp com a mensagem estruturada.
 * TODO (Resend): quando houver domínio e chave de API, este envio pode virar
 * um POST para /api/contact com o provedor Resend; o site hoje é 100% estático.
 */

interface Props {
  areasOpcoes: string[];
  modalidades: string[];
  intro: string;
  aviso: string;
  numeroWhats: string;
}

const esquemaNome = z
  .string()
  .trim()
  .min(2, 'Digite o seu nome para incluir na mensagem.')
  .max(80, 'Use um nome mais curto.');

const perguntas = [
  'Qual área tem a ver com o seu caso?',
  'Como você prefere ser atendido?',
  'Para terminar, como a advogada deve te chamar?',
];

const rotulos = ['Área', 'Atendimento', 'Seus dados'];

export default function PreAgendamento({
  areasOpcoes,
  modalidades,
  intro,
  aviso,
  numeroWhats,
}: Props) {
  const [passo, setPasso] = useState(0);
  const [area, setArea] = useState<string | null>(null);
  const [modalidade, setModalidade] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [resumo, setResumo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const primeiraRender = useRef(true);

  useEffect(() => {
    if (primeiraRender.current) {
      primeiraRender.current = false;
      return;
    }
    tituloRef.current?.focus({ preventScroll: true });
  }, [passo]);

  const voltar = () => {
    setErro(null);
    setPasso((p) => Math.max(0, p - 1));
  };

  const validarNome = () => {
    const r = esquemaNome.safeParse(nome);
    setErro(r.success ? null : (r.error.issues[0]?.message ?? 'Confira o nome.'));
    return r;
  };

  const abrirWhats = () => {
    const r = validarNome();
    if (!r.success) return;
    const linhas = [
      'Olá, Dra. Quesia! Vim pelo site e gostaria de um pré-agendamento.',
      `Área: ${area ?? 'a definir'}`,
      `Atendimento: ${modalidade ?? 'a combinar'}`,
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
              className={`flex flex-1 items-center gap-2.5 px-4 py-4 sm:gap-3 sm:px-6 ${
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
        {/* Resumo das escolhas em chips */}
        {passo > 0 && (
          <div className="mb-7 flex flex-wrap gap-2">
            {[area, passo > 1 ? modalidade : null].filter(Boolean).map((c) => (
              <span
                key={c as string}
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
          {perguntas[passo]}
        </h3>

        {passo === 0 && (
          <p className="medida-curta mt-3 text-[0.95rem] text-bone-muted">{intro}</p>
        )}

        <div key={passo} className="pa-passo">
          {passo === 0 &&
            escolha(
              areasOpcoes,
              area,
              (o) => {
                setArea(o);
                setPasso(1);
              },
              'sm:grid-cols-2'
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

          {passo === 2 && (
            <div className="mt-8 flex flex-col gap-7">
              <div>
                <label htmlFor="pa-nome" className="rotulo-caps text-bone-muted">
                  Seu nome <span className="text-gold" aria-hidden="true">*</span>
                </label>
                <input
                  id="pa-nome"
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
                  aria-describedby={erro ? 'pa-erro' : undefined}
                  className="mt-2.5 w-full rounded-xl border border-bone/15 bg-white/[0.03] px-4 py-3.5 text-bone outline-none transition-colors duration-300 placeholder:text-bone-muted/50 focus:border-gold"
                />
                {erro && (
                  <p id="pa-erro" role="alert" className="mt-2 text-sm text-[#F2B8A2]">
                    {erro}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="pa-resumo" className="rotulo-caps text-bone-muted">
                  Resumo do caso{' '}
                  <span className="normal-case tracking-normal">(opcional)</span>
                </label>
                <textarea
                  id="pa-resumo"
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
                className="btn-clean w-full text-[0.95rem] sm:w-auto sm:self-start"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.2 14.8l-.5-.3-2.5.7.7-2.5-.3-.5A8 8 0 0 1 12 4Zm-3 4.4c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.1 0 1.3.9 2.5 1 2.7.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.7-.9c-.2-.1-.4-.1-.6.1l-.8.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2-.1-.4 0-.5l.6-.8c.2-.2.2-.4.1-.6l-.8-1.9c-.2-.5-.4-.7-.5-.7Z"
                    fill="currentColor"
                  />
                </svg>
                Abrir WhatsApp
              </button>

              <p className="text-xs leading-relaxed text-bone-muted">{aviso}</p>
            </div>
          )}
        </div>

        {passo > 0 && (
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
