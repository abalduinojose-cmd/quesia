/**
 * Conteúdo da página /precatorios, feita para receber tráfego de anúncio.
 *
 * Duas regras guiaram a escrita e é bom que fiquem registradas, porque mexer
 * nelas sem saber vira problema de ética profissional:
 *
 * 1. Nada de promessa. Precatório é área cheia de anúncio que promete prazo e
 *    valor, e o Provimento 205/2021 da OAB veda promessa de resultado,
 *    sensacionalismo e mercantilização. Aqui o texto explica e qualifica, não
 *    garante nada.
 * 2. A advogada NÃO compra nem antecipa precatório. Quem faz isso é fundo de
 *    investimento. Ela orienta sobre a cessão: se vale a pena, qual o deságio,
 *    o que olhar no contrato. O texto diz exatamente isso.
 */

export const precatorios = {
  eyebrow: 'Precatórios',
  /* Título e linha curtos de propósito: é a primeira tela de um anúncio, e
     texto comprido aqui empurra o funil para baixo da dobra. */
  titulo: 'Tem um precatório para receber?',
  subtitulo:
    'Responda seis perguntas rápidas. A advogada recebe o seu caso já organizado e responde pelo WhatsApp.',

  /* Uma linha só de prova social, logo abaixo do título. */
  selos: [
    'Atendimento online para todo o Brasil',
    'Análise antes de qualquer contratação',
  ],

  /* ------------------------------------------------------------------
     O funil. Cada passo é uma pergunta de um toque só: a pessoa escolhe
     e já avança, sem botão de "próximo". "Não sei" aparece em todas de
     propósito, porque quem procura precatório quase nunca sabe os termos
     e uma pergunta sem saída é onde se perde a pessoa.
  ------------------------------------------------------------------ */
  passos: [
    {
      id: 'situacao',
      rotulo: 'O que precisa',
      pergunta: 'O que você precisa resolver?',
      ajuda: 'Escolha o que mais se parece com o seu caso.',
      opcoes: [
        'Tenho um precatório e quero saber quando recebo',
        'Acho que tenho direito, mas não tenho certeza',
        'Quero entender se vale a pena antecipar o meu',
        'Sou herdeiro de quem tinha o precatório',
        'O meu está atrasado e não foi pago',
        'Outro assunto sobre precatório',
      ],
    },
    {
      id: 'devedor',
      rotulo: 'Quem deve',
      pergunta: 'Quem é que deve o valor?',
      ajuda: 'Cada devedor tem uma fila e um orçamento diferente.',
      opcoes: [
        'União, ou seja, o Governo Federal',
        'INSS',
        'Governo do Estado do Rio de Janeiro',
        'Governo de outro estado',
        'Prefeitura',
        'Não sei dizer',
      ],
    },
    {
      id: 'origem',
      rotulo: 'Origem do direito',
      pergunta: 'De onde veio esse direito?',
      ajuda: 'Isso muda a ordem de pagamento: verba de salário tem preferência.',
      opcoes: [
        'Salário, aposentadoria ou pensão',
        'Diferenças do FUNDEF ou FUNDEB, como professor',
        'Indenização',
        'Desapropriação de imóvel',
        'Imposto pago a mais',
        'Não sei dizer',
      ],
    },
    {
      id: 'prioridade',
      rotulo: 'Situação pessoal',
      pergunta: 'Alguma destas situações é a sua?',
      ajuda:
        'A lei coloca na frente da fila quem tem 60 anos ou mais, doença grave ou deficiência.',
      opcoes: [
        'Tenho 60 anos ou mais',
        'Tenho uma doença grave',
        'Sou pessoa com deficiência',
        'Quem recebe é um espólio, porque o titular faleceu',
        'Nenhuma dessas',
      ],
    },
    {
      id: 'fase',
      rotulo: 'Fase do processo',
      pergunta: 'Em que pé está o processo?',
      ajuda: 'Se não souber, tudo bem: dá para descobrir com o número da ação.',
      opcoes: [
        'O precatório já foi expedido e tem número',
        'A ação acabou, mas o precatório ainda não saiu',
        'A ação ainda está correndo',
        'Não sei dizer',
      ],
    },
  ],

  /* Último passo: nome e valor. O valor fica opcional de propósito, porque
     perguntar quanto a pessoa tem a receber logo de cara espanta. */
  valores: [
    'Até R$ 50 mil',
    'Entre R$ 50 mil e R$ 200 mil',
    'Entre R$ 200 mil e R$ 500 mil',
    'Acima de R$ 500 mil',
    'Prefiro não informar agora',
  ],

  /* ------------------------------------------------------------------ */
  comoFunciona: [
    {
      titulo: 'Você conta o caso',
      texto:
        'As seis perguntas acima já dizem à advogada o essencial: quem deve, de onde vem o direito e em que fase está.',
    },
    {
      titulo: 'A advogada analisa',
      texto:
        'Com o número da ação ou do precatório em mãos, dá para conferir a fila, a ordem cronológica e se cabe pedido de preferência.',
    },
    {
      titulo: 'Você decide com clareza',
      texto:
        'Só depois disso se fala em contratar. Você vai saber o que é possível no seu caso antes de assumir qualquer compromisso.',
    },
  ],

  duvidas: [
    {
      p: 'O que é um precatório, afinal?',
      r: 'É a ordem de pagamento que o Judiciário manda ao poder público depois que o processo acaba e não cabe mais recurso. Em vez de pagar na hora, o governo entra numa fila orçamentária e paga por ordem de apresentação.',
    },
    {
      p: 'Dá para furar a fila?',
      r: 'Furar, não. Mas a lei prevê preferência para quem tem 60 anos ou mais, doença grave ou deficiência, dentro de um limite de valor. O pedido é feito nos autos e precisa de prova da condição.',
    },
    {
      p: 'Vale a pena antecipar ou vender o meu precatório?',
      r: 'Depende do deságio, da fila do seu devedor e da sua necessidade. Quem compra precatório é fundo de investimento, não advogado. O que a Dra. Quesia faz é analisar a proposta com você, conferir o contrato de cessão e dizer o que está em jogo antes de você assinar.',
    },
    {
      p: 'O titular faleceu. Os herdeiros recebem?',
      r: 'Sim. O valor entra no inventário e os herdeiros precisam se habilitar nos autos para que o pagamento saia em nome deles. É um procedimento próprio, e é comum ele ficar parado por falta de alguém cuidando.',
    },
    {
      p: 'Preciso ter o número do precatório para conversar?',
      r: 'Não. Ajuda muito, mas com o número da ação, ou até com o nome e o CPF do titular, já dá para começar a procurar.',
    },
  ],

  /* Curto, mas sem abrir mão do que a OAB exige: nada de promessa de
     resultado nem de prazo. */
  aviso: 'Conteúdo informativo. Não constitui promessa de resultado ou de prazo.',
} as const;
