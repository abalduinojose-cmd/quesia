import { useMemo, useRef, useState } from 'react';

/**
 * Funil de qualificação da página de anúncio de precatórios.
 *
 * Decisões que importam para a conversão, e por quê:
 *
 * - Um toque por passo, sem botão de "próximo". Cada clique a mais é gente
 *   que desiste, e aqui a escolha já é a confirmação.
 * - A pergunta do nome fica por último. Pedir dado pessoal antes de a pessoa
 *   ter investido alguma coisa é o jeito mais rápido de perder a visita.
 * - O valor é opcional de propósito: quem chega por anúncio de precatório
 *   costuma desconfiar de quem pergunta quanto ele tem a receber.
 * - No fim nada é enviado por aqui. A pessoa vai para o WhatsApp com a
 *   mensagem pronta, que é onde a advogada de fato atende.
 */

export interface Passo {
  id: string;
  rotulo: string;
  pergunta: string;
  ajuda: string;
  opcoes: readonly string[];
}

interface Props {
  passos: readonly Passo[];
  valores: readonly string[];
  whatsapp: string;
  /** Texto do atalho de quem não quer responder nada */
  atalhoWhats: string;
}

export default function Funil({ passos, valores, whatsapp, atalhoWhats }: Props) {
  const total = passos.length + 1; // as perguntas mais a tela de nome
  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [erroNome, setErroNome] = useState<string | null>(null);
  /* Para onde a cena viaja na troca. A entrada vem do lado de onde a pessoa
     está indo: avançando entra pela direita, voltando entra pela esquerda.
     Sem isso a troca não tem vetor e lê como piscada. */
  const [sentido, setSentido] = useState<'frente' | 'tras'>('frente');
  const tituloRef = useRef<HTMLParagraphElement>(null);

  const foco = () => {
    /* Leitor de tela precisa saber que a pergunta mudou; sem isto o passo
       seguinte passa despercebido para quem navega por teclado. */
    window.requestAnimationFrame(() =>
      tituloRef.current?.focus({ preventScroll: true })
    );
  };

  const responder = (id: string, opcao: string) => {
    setRespostas((r) => ({ ...r, [id]: opcao }));
    setSentido('frente');
    setPasso((p) => p + 1);
    foco();
  };

  const voltar = () => {
    setErroNome(null);
    setSentido('tras');
    setPasso((p) => Math.max(0, p - 1));
    foco();
  };

  const mensagem = useMemo(() => {
    const linhas = [
      'Olá, Dra. Quesia! Vim pela página de precatórios.',
      '',
      `Nome: ${nome.trim()}`,
      ...passos
        .filter((p) => respostas[p.id])
        .map((p) => `${p.rotulo}: ${respostas[p.id]}`),
    ];
    if (valor) linhas.push(`Valor aproximado: ${valor}`);
    return linhas.join('\n');
  }, [nome, valor, respostas, passos]);

  const linkPronto = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
  const linkDireto = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    'Olá, Dra. Quesia! Vim pela página de precatórios e gostaria de tirar uma dúvida.'
  )}`;

  const concluido = passo >= total;
  const indice = Math.min(passo, total - 1);

  const irParaResumo = () => {
    const n = nome.trim();
    if (n.length < 2) {
      setErroNome('Escreva o seu nome para a advogada saber com quem fala.');
      return;
    }
    setErroNome(null);
    setSentido('frente');
    setPasso(total);
    foco();
  };

  return (
    <div className="funil">
      {/* Barra de progresso: a pessoa precisa enxergar que é curto */}
      {/* Segmentos em vez de uma barra: a pessoa conta quantos faltam de
          relance, e "seis traços" lê mais curto que uma barra pela metade. */}
      <div className="funil-topo">
        <div className="funil-marcas" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className="funil-marca"
              data-estado={concluido || i < passo ? 'feito' : i === passo ? 'agora' : 'falta'}
            />
          ))}
        </div>
        <p className="funil-contador">
          {concluido ? 'Pronto para enviar' : `${indice + 1} de ${total}`}
        </p>
      </div>

      <div className="funil-corpo">
        <div key={passo} className="funil-cena" data-sentido={sentido}>
        {!concluido && passo < passos.length && (
          <div>
            <p
              ref={tituloRef}
              tabIndex={-1}
              className="funil-pergunta"
              aria-live="polite"
            >
              {passos[passo].pergunta}
            </p>
            <p className="funil-ajuda">{passos[passo].ajuda}</p>

            <div className="funil-opcoes">
              {passos[passo].opcoes.map((o, i) => (
                <button
                  key={o}
                  type="button"
                  className="funil-opcao"
                  style={{ '--i': i } as React.CSSProperties}
                  onClick={() => responder(passos[passo].id, o)}
                >
                  <span>{o}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M6 3.5 10.5 8 6 12.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {!concluido && passo === passos.length && (
          <div>
            <p ref={tituloRef} tabIndex={-1} className="funil-pergunta" aria-live="polite">
              Por último: como a advogada deve te chamar?
            </p>
            <p className="funil-ajuda">
              O contato acontece pelo WhatsApp, então não precisa de e-mail nem de
              telefone aqui.
            </p>

            <label className="funil-campo">
              <span className="rotulo-caps">Seu nome</span>
              <input
                type="text"
                value={nome}
                maxLength={80}
                autoComplete="name"
                placeholder="Maria da Silva"
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && irParaResumo()}
                aria-invalid={erroNome ? true : undefined}
              />
            </label>
            {erroNome && (
              <p role="alert" className="funil-erro">
                {erroNome}
              </p>
            )}

            <p className="funil-sublabel rotulo-caps">
              Valor aproximado <span>opcional</span>
            </p>
            <div className="funil-pilulas">
              {valores.map((v) => (
                <button
                  key={v}
                  type="button"
                  className="funil-pilula"
                  aria-pressed={valor === v}
                  onClick={() => setValor(valor === v ? '' : v)}
                >
                  {v}
                </button>
              ))}
            </div>

            <button type="button" className="btn-ouro funil-enviar" onClick={irParaResumo}>
              Ver o resumo
            </button>
          </div>
        )}

        {concluido && (
          <div>
            <p ref={tituloRef} tabIndex={-1} className="funil-pergunta" aria-live="polite">
              É isto que vai chegar para a advogada
            </p>
            <p className="funil-ajuda">
              Confira antes de enviar. Você ainda pode voltar e corrigir.
            </p>

            <div className="funil-resumo">
              <p className="funil-resumo-linha">
                <span>Nome</span>
                {nome.trim()}
              </p>
              {passos
                .filter((p) => respostas[p.id])
                .map((p) => (
                  <p key={p.id} className="funil-resumo-linha">
                    <span>{p.rotulo}</span>
                    {respostas[p.id]}
                  </p>
                ))}
              {valor && (
                <p className="funil-resumo-linha">
                  <span>Valor aproximado</span>
                  {valor}
                </p>
              )}
            </div>

            <a
              href={linkPronto}
              target="_blank"
              rel="noopener noreferrer"
              className="funil-whats"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
              </svg>
              Enviar para a advogada
            </a>
          </div>
        )}
        </div>
      </div>

      <div className="funil-rodape">
        {passo > 0 ? (
          <button type="button" className="funil-voltar" onClick={voltar}>
            ← Voltar
          </button>
        ) : (
          <span />
        )}

        {/* Atalho de quem não quer responder nada. Fica discreto de
            propósito: existe para não perder a visita, não para competir
            com o funil. */}
        {!concluido && (
          <a
            href={linkDireto}
            target="_blank"
            rel="noopener noreferrer"
            className="funil-atalho"
          >
            {atalhoWhats}
          </a>
        )}
      </div>
    </div>
  );
}
