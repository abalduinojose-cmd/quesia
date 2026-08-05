/**
 * Todo o conteúdo textual do site, centralizado e tipado.
 * Nenhum texto fica hardcoded em componente.
 *
 * Itens marcados com "CONFIRMAR" também aparecem no checklist do README.
 */

export interface Area {
  id: string;
  titulo: string;
  tituloCurto: string;
  lede: string;
  topicos: string[];
}

export interface Etapa {
  titulo: string;
  texto: string;
}

export interface Credencial {
  titulo: string;
  detalhe: string;
  confirmar?: boolean;
}

export interface Avaliacao {
  nome: string;
  texto: string;
  nota: number;
  data: string;
  foto: string | null;
}

export interface PerguntaFaq {
  pergunta: string;
  resposta: string;
}

export const site = {
  nome: 'Quesia Constâncio',
  nomeCapa: ['Quesia', 'Constâncio'],
  sufixo: 'Advocacia',
  tagline: 'Assessoria e Consultoria Jurídica',
  slogan: 'Defendendo seus direitos com paixão',
  oab: 'OAB/RJ 237.540', // CONFIRMAR com a advogada
  whatsapp: {
    numero: '5524993025621',
    display: '(24) 99302-5621',
  },
  email: null as string | null, // CONFIRMAR: e-mail profissional
  endereco: {
    linha1: 'Estrada União e Indústria, 19.328, sobreloja',
    linha2: 'Pedro do Rio, Petrópolis, RJ',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Estrada+Uni%C3%A3o+e+Ind%C3%BAstria+19328+Pedro+do+Rio+Petr%C3%B3polis+RJ',
  },
  social: {
    instagram: 'https://www.instagram.com/advogada_quesiaconstancio/',
    facebook: 'https://www.facebook.com/profile.php?id=100090977194195',
    linkedin:
      'https://br.linkedin.com/in/qu%C3%A9sia-z-s-b-const%C3%A2ncio-6b1815234',
    google: 'https://share.google/wIRGZlInSuFnVsHNw',
  },
  google: {
    nota: '5,0',
    total: 46,
  },
} as const;

export const seo = {
  titulo:
    'Quesia Constâncio Advocacia · Direito Previdenciário, Imobiliário e Sucessório em Petrópolis RJ',
  descricao:
    'Advocacia em Pedro do Rio, Petrópolis RJ. Aposentadorias e benefícios do INSS, compra e regularização de imóveis, inventários e planejamento sucessório. Atendimento presencial e online.',
  palavrasChave: [
    'advogada previdenciária Petrópolis',
    'advogado INSS Pedro do Rio',
    'aposentadoria Petrópolis',
    'BPC LOAS Petrópolis',
    'inventário Petrópolis',
    'usucapião Petrópolis',
    'advogada Pedro do Rio',
  ],
} as const;

export const especialidades = [
  'Direito Previdenciário',
  'Direito Imobiliário',
  'Direito Sucessório',
] as const;

/**
 * Provimento 205/2021 da OAB veda depoimentos de clientes na publicidade.
 * A seção completa fica pronta, porém DESLIGADA: no ar aparece apenas o selo
 * objetivo com nota e quantidade de avaliações públicas do Google.
 * Ligar é decisão da advogada: basta trocar `exibir` para true, e a numeração
 * do sumário se reajusta sozinha.
 */
/**
 * Avaliações reais coletadas do perfil público no Google (01 e 04/08/2026).
 * Fotos por hotlink dos avatares públicos (lh3) com referrerpolicy no-referrer.
 * Exibição LIGADA a pedido do cliente em 02/08/2026, ciente do Provimento
 * 205/2021 da OAB.
 */
export const avaliacoes = {
  exibir: true,
  nota: '5,0',
  total: 46,
  url: site.social.google,
  itens: [
    {
      nome: 'Érica Bastos',
      nota: 5,
      data: '11 meses atrás',
      texto:
        'Ótima. Minha solicitação foi resolvida muito rápido, não precisei comparecer. Tudo resolvido pelo celular, muito mais confortável.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjUydi_xQGAK15XAJuwUJLOn3c70msA7-dqV3wPcD-pwFuqp9u4r=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Pr. Bruno Castelo',
      nota: 5,
      data: '9 meses atrás',
      texto:
        'Excelente profissional, atendimento de alta confiança, disponibilidade para esclarecer dúvidas. Nos acompanhou em todo processo nos auxiliando e realizando todas as demandas necessárias e o resultado foi que saímos vitoriosos, graças a Deus e sua competência. Muito obrigado.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjXU3brRwITLlxRPDJP3EqHbkyVmusBMzoA0qc3GlXcY9QpTdnQD=w96-h96-p-rp-mo-ba12-br100',
    },
    {
      nome: 'Maria das Graças Rosa de Oliveira',
      nota: 5,
      data: '8 meses atrás',
      texto:
        'Foi muito bom, foram dias que aprendi muito. Dra. Quesia é extraordinária, excelente profissional, eu amei ter ela ao meu lado advogando minhas causas.',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocLOWEPFL8mkMfL2H-zaNQ5sd7MwNK9oEKD7cGdads3Qtob2OA=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Pamela Souza',
      nota: 5,
      data: '8 meses atrás',
      texto:
        'Profissional extremamente competente e cuidadosa com o cliente. Tirou minhas dúvidas, me ajudou no meu caso alcançando meu objetivo.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjXYR7N-Pf-Mq_upVxlW-urOFwnCIfbBjoBsV9cZnuNL69jzjX4=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Elaine Guimarães',
      nota: 5,
      data: 'um ano atrás',
      texto:
        'Então o que falar dessa advogada maravilhosa, guerreira, carinhosa, extraordinária, competente. Ela é um anjo que Deus enviou em nossas vidas, pegou nossa causa, lutou, correu atrás e saímos com a vitória. É uma mulher que eu admiro muito.',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocJD1A-U-se56mLApPzs76YaPKVR2zHSJpj34V__DIQKSE700A=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Wiil Costa',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Ótima profissional! Resolveu meu problema com rapidez e excelência. Sempre vou recomendar para quem estiver precisando.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjVztiyZWgLzTtI1-PUh3bDk8i9zqFso5we3Ymed3EXLwk8zIIA=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Ana Schmdt',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Só tenho que agradecer muito a Deus e à Dra. Quesia por tudo que ela fez e está fazendo por mim. Super recomendo, excelente profissional.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjXIYV9MSvvMYMFB-mw3_E0QBkh_vjLxMjNVBjreVC7m5A9XMpUGfA=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Gabriela Segadas',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Quesia é uma advogada super profissional, atenciosa, cuidadosa e, uma das qualidades que mais prezo, preocupada em estar sempre nos atualizando do que está acontecendo. Eternamente agradecida por seu profissionalismo!',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjVcWaA3eyZhdOXNIjrcLH4cbzC3cLcnV4hg42CFgbPQ9pjBZUKiFA=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Felipe Souza',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Excelente profissional, dedicada e focada para melhor atender seus clientes. Super indico.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjUOJ5CHUikh-k9rNHOfSl5yq53lsP5aeeuXtNBKqmkCkRKNNDGdhA=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Priscila Sabino',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Ela é uma excelente advogada, de confiança, leva seu trabalho a sério e se preocupa com cliente. Super recomendo!',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocJNtCOTLL84V6ejI0yMVhAHTQP8g5I6eJudrwYvtMKMAMHsoA=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Rodrigo Medeiros',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Excelente profissional, dedicada, sempre pronta a atender. Rapidez e agilidade nos processos, solução garantida.',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocJLOmytviSAEE_ePxbdCGy5on-MurRLZ5Rrnu2nKPd34iNH6g=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Jonatas Correa',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Uma advogada de confiança, excelente e realmente sabe o que está fazendo. Resolveu meu problema com maestria. Recomendo de olhos fechados.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjX0IGS7m1dSnP3_aQynvJGd926Ne4TNyie-h7ODtxWNJ2cjc2M=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Renata Blog',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Pessoa de caráter, pessoa de confiança. Pode contratar, pois fez um excelente trabalho para mim, tudo certo e com confiança.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjUr7XbOELn0vjw6EO9RYjktYRarnSpcymg9N_JDu7Hayb-AdY7u=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Vitor Freitas',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Dra. Quesia, profissional de excelência, atenciosa e super competente. Indico a todos. Obrigado por todo suporte!',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjVly5zykNyI7WFTM4PWEFqfdY83MIHXnMXux2Rwa_6lkrNePR4p=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Vanessa Viana Fidelis Fonseca',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Uma profissional de excelência! Super indico! Tive êxito com o serviço prestado.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjU_UzxAgNM7F6V7PiC3Wd7Fcj5qDlaEu1wN9aMxbcj1zLQFsZU=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Soraia Santos',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Ela é ótima, explica muito bem. Atenciosa e honesta. Deus continue abençoando.',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocLg4X4SIWGwjblqPH7d65J0Sfkh-i65kwqbvF9lNApVXL1A9g=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Érika Ferreira',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'A melhor, tem minha total confiança. Eu recomendo a todos, essa faz a diferença.',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocJeq5SLFsyfB7vE5juUh43yQUyH8AkOOntVU2sLlfFweGZUYA=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Adriana C. D. Araujo',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Confiabilidade, responsabilidade, transparência, atendimento humanitário. Excelente profissional, super indico.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjXRhPhIpXvpgkA2JOi0N83lU-SYV4NJIYdTVuVURR-b3yo_ojlAuw=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Elaine Portes',
      nota: 5,
      data: '2 anos atrás',
      texto: 'Muito competente! Excelente profissional! Eu indico.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjWE2dateX3-oal5lzRvqJ6p1xE9UoLqVmnwLTl0J2OYkxJBW46r=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Peterson Vieira',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Advogada ótima, me ajudou. Só tenho a agradecer pelo seu trabalho, excelente advogada. Obrigado por tudo e super indico.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjUNKVFv677zW8eCHzFZTc-517iBQMItUQvbZDjghJZ19m10F1iTjw=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Cláudia C. G.',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Quesia é uma advogada super profissional, atenciosa e cuidadosa. Que Deus abençoe grandemente.',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocIr42YDmep2Z66zLvDDZvGUuBU0h9ct00OHYUozi8Te4Gkp7EU=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'João Pedro Pereira',
      nota: 5,
      data: '2 anos atrás',
      texto: 'Ótima no que faz, me ajudou a resolver a multa da minha moto!',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjWKK2mAYXdwG4EXVgxcpoTgeVvWwuliM36v3O9aOUaTN27ql_e8=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Alison Muniz',
      nota: 5,
      data: '2 anos atrás',
      texto:
        'Competência, comprometimento e confiabilidade, esses são os três C que definem essa profissional.',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocIUKsK3tQRtvN7AmSf3qVzClDvxzb7OOVoO2D5XTvonDazMYw=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Camila Andrade',
      nota: 5,
      data: '2 anos atrás',
      texto: 'A melhor advogada, excelente, com clareza em tudo que faz. Sensacional!',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocLr8UJmPuvn-rFd98oTN9q4Z9rPUuHPk8VcbTDOazjuBkS0Qg=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Odir Areas',
      nota: 5,
      data: '2 anos atrás',
      texto: 'Profissional e confiável, faz um excelente trabalho!',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocJA6zpz1FdyAiZRLfJOhODjq9xP5rU0x9iyQpbjIOs0-eDqlw=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Carlinha Souza',
      nota: 5,
      data: '2 anos atrás',
      texto: 'Excelente advogada, me prestou um ótimo trabalho.',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocItdEG-SUY_-zsa2P4CXr7T7sF0_VzNO1XlczVbtnQ8_HpGEQ=w96-h96-p-rp-mo-br100',
    },
    /* Segunda leva, coletada em 04/08/2026 */
    {
      nome: 'Lia Marcia Segadas Vianna',
      nota: 5,
      data: '2 anos atrás',
      texto: 'Advogada excelente. Dedicada, atenciosa e competente!',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjVB8Av5a8Bj3ziSrjJdsdCXJy7bbKaG0PcqMyNZxoKhVSMWid0=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Aliane Alcantara',
      nota: 5,
      data: 'um ano atrás',
      texto: 'Excelente profissional, recomendo de olhos fechados.',
      foto: 'https://lh3.googleusercontent.com/a/ACg8ocLfBSZyLs-DvEBur6HAwU0XDItuM0Ab692W7OoP57xxDPGo3g=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Rogério Rosa',
      nota: 5,
      data: '2 anos atrás',
      texto: 'Simplesmente competente no que faz. Parabéns.',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjW9uZxpqyrQV0CuUZhvqR3UqEZPV8C993FEsSIWFZKwsoGXWnnA=w96-h96-p-rp-mo-ba12-br100',
    },
    {
      nome: 'Ana Flávia Lima',
      nota: 5,
      data: '2 anos atrás',
      texto: 'A melhor! Muito eficiente!',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjXvi091aK8kwA3il7W2Am_ZhbIhZkQqxlFgDaCu6qPfROyRHmf6YQ=w96-h96-p-rp-mo-br100',
    },
    {
      nome: 'Marcos Toneli Goulard',
      nota: 5,
      data: '2 anos atrás',
      texto: 'Excelente, muito profissional!',
      foto: 'https://lh3.googleusercontent.com/a-/ALV-UjXozTOlozaEWo8nVPPB7E4J4jVQCKrYVKvJ4-f7rkqdEU_cRXPveg=w96-h96-p-rp-mo-br100',
    },
  ] as Avaliacao[],
};

/** Seções que entram na navegação e na numeração de fundo */
export const capitulos = [
  { id: 'sobre', titulo: 'Sobre a advogada', curto: 'Sobre' },
  { id: 'agendamento', titulo: 'Agendar atendimento', curto: 'Agendar' },
  { id: 'areas', titulo: 'Áreas de atuação', curto: 'Áreas' },
  { id: 'como-funciona', titulo: 'Como funciona', curto: 'Como funciona' },
  { id: 'formacao', titulo: 'Formação e atuação', curto: 'Formação' },
  ...(avaliacoes.exibir
    ? [{ id: 'avaliacoes', titulo: 'O que dizem os clientes', curto: 'Avaliações' }]
    : []),
  { id: 'faq', titulo: 'Perguntas frequentes', curto: 'FAQ' },
  { id: 'holding', titulo: 'Consultoria jurídica e holding', curto: 'Holding' },
  { id: 'contato', titulo: 'Contato e agendamento', curto: 'Contato' },
];

export const hero = {
  subDestaque: 'Dra. Quesia Constâncio, OAB/RJ 237.540.',
  subResto:
    'Direito Previdenciário, Imobiliário e Sucessório, com atendimento presencial em Pedro do Rio e online para todo o Brasil.',
} as const;

export const totalFls = String(capitulos.length).padStart(2, '0');

export function numeroCapitulo(id: string): string {
  const i = capitulos.findIndex((c) => c.id === id);
  return String(i + 1).padStart(2, '0');
}

export const sobre = {
  headline: 'Um direito que enxerga pessoas antes de processos',
  paragrafos: [
    'Construí minha carreira alicerçada na premissa de ouvir antes de peticionar. Para mim, cada caso não é apenas um processo, mas uma vida que precisa de suporte. Minha atuação é conduzida com técnica, transparência e uma proximidade rara, acompanhando pessoalmente cada etapa da jornada de quem atendo, seja presencialmente ou de forma digital para todo o Brasil.',
    'Acredito que o Direito é uma ferramenta de proteção e justiça, visão que transborda também para o meu papel como mãe de um casal de filhos e minha dedicação ao ministério pastoral. É essa mesma paixão que me move na defesa dos direitos de cada cliente, oferecendo orientação franca sobre caminhos e riscos, sempre com um atendimento profundamente humanizado.',
    'Minha prática concentra-se em três frentes que sustentam a vida das famílias: o benefício previdenciário que garante a segurança, o imóvel que abriga e o patrimônio que passa de geração em geração.',
  ],
  especialista: 'Especialista em Previdenciário, Imobiliário e Sucessório.',
  fecho: 'Defendendo seus direitos com paixão.',
  legendaFoto: 'Quesia Constâncio, advogada · Pedro do Rio, Petrópolis RJ',
} as const;

export const instagram = {
  usuario: '@advogada_quesiaconstancio',
  url: site.social.instagram,
  titulo: 'O dia a dia de quem defende você',
  texto:
    'Bastidores do escritório, dicas em vídeo e novidades sobre direitos. Acompanhe de perto no Instagram.',
  reels: [
    { arquivo: 'reel-01', legenda: 'Direitos na prática' },
    { arquivo: 'reel-02', legenda: 'Dicas do escritório' },
    { arquivo: 'reel-03', legenda: 'Bastidores' },
  ],
} as const;

export const areas: Area[] = [
  {
    id: 'previdenciario',
    titulo: 'Direito Previdenciário',
    tituloCurto: 'Previdenciário',
    lede: 'Benefícios do INSS analisados com estratégia: da organização dos documentos ao requerimento, do indeferimento ao recurso.',
    topicos: [
      'Aposentadoria por idade e por tempo de contribuição',
      'Aposentadoria especial e da pessoa com deficiência',
      'Auxílio por incapacidade temporária e permanente',
      'BPC LOAS para idosos e pessoas com deficiência',
      'Pensão por morte e salário-maternidade',
      'Revisões e planejamento previdenciário',
    ],
  },
  {
    id: 'imobiliario',
    titulo: 'Direito Imobiliário',
    tituloCurto: 'Imobiliário',
    lede: 'Segurança jurídica para comprar, vender, regularizar e proteger o imóvel da sua família.',
    topicos: [
      'Contratos de compra e venda de imóveis',
      'Análise de riscos antes da assinatura (due diligence)',
      'Usucapião judicial e extrajudicial',
      'Regularização de imóveis e registros',
      'Locação e questões condominiais',
    ],
  },
  {
    id: 'sucessorio',
    titulo: 'Direito Sucessório',
    tituloCurto: 'Sucessório',
    lede: 'Organização do patrimônio e condução de inventários com serenidade, técnica e respeito ao momento da família.',
    topicos: [
      'Inventário judicial e extrajudicial',
      'Testamentos e disposições de última vontade',
      'Planejamento sucessório em vida',
      'Partilha de bens e sobrepartilha',
      'Doações com reserva de usufruto',
    ],
  },
];

export const processo: Etapa[] = [
  {
    titulo: 'Primeira conversa',
    texto:
      'Você conta o seu caso pelo WhatsApp ou no escritório. É o momento de entender o contexto, os documentos existentes e o que você busca.',
  },
  {
    titulo: 'Análise e estratégia',
    texto:
      'A documentação é estudada com calma e você recebe uma orientação clara sobre os caminhos possíveis, prazos e custos envolvidos.',
  },
  {
    titulo: 'Condução do caso',
    texto:
      'Definida a estratégia, a advogada conduz cada etapa e mantém você informado do início ao fim, sem juridiquês.',
  },
];

export const formacao: Credencial[] = [
  {
    titulo: 'Bacharelado em Direito',
    detalhe: 'instituição a confirmar',
    confirmar: true,
  },
  {
    titulo: 'Pós-graduação em Direito Previdenciário',
    detalhe: 'a confirmar',
    confirmar: true,
  },
  {
    titulo: 'Inscrição na Ordem dos Advogados do Brasil',
    detalhe: 'OAB/RJ 237.540',
  },
  {
    titulo: 'Atendimento presencial e online',
    detalhe: 'Petrópolis, região serrana e todo o Brasil',
  },
];

export const faq: PerguntaFaq[] = [
  {
    pergunta: 'Como funciona a primeira conversa?',
    resposta:
      'Você pode chamar no WhatsApp ou usar o agendamento aqui do site. Na conversa, a advogada entende o seu caso, orienta sobre os documentos necessários e explica os próximos passos, sem juridiquês.',
  },
  {
    pergunta: 'A doutora atende online?',
    resposta:
      'Sim. Todo o acompanhamento pode ser feito a distância, por videochamada e WhatsApp, e os processos do INSS tramitam de forma digital. O atendimento presencial acontece no escritório de Pedro do Rio, em Petrópolis.',
  },
  {
    pergunta: 'Quais documentos devo separar para uma consulta previdenciária?',
    resposta:
      'Documento de identidade, CPF, carteiras de trabalho, carnês de contribuição, extrato CNIS (disponível no Meu INSS) e laudos médicos, quando houver. Se algo estiver faltando, a advogada orienta como conseguir.',
  },
  {
    pergunta: 'Meu benefício foi negado pelo INSS. E agora?',
    resposta:
      'O indeferimento não é o fim do caminho. Conforme o caso, é possível apresentar recurso administrativo ou levar a questão ao Judiciário. O primeiro passo é analisar a carta de indeferimento e o processo administrativo.',
  },
  {
    pergunta: 'Inventário precisa sempre ir à Justiça?',
    resposta:
      'Não. Quando há consenso entre herdeiros maiores e capazes, o inventário pode ser feito em cartório, de forma extrajudicial, em geral mais rápida. Havendo menores, incapazes ou divergência, a via é a judicial.',
  },
  {
    pergunta: 'O que é usucapião e quando ela cabe?',
    resposta:
      'É a forma de adquirir a propriedade pelo uso prolongado, contínuo e sem oposição de um imóvel, cumpridos os prazos e requisitos da lei. É o caminho usual para regularizar imóveis ocupados há muitos anos sem escritura.',
  },
];

/**
 * Serviços complementares, fora das três frentes principais. Ficam no fim da
 * página de propósito, a pedido do cliente em 04/08/2026.
 */
export const servicosExtras = {
  eyebrow: 'Também atendo',
  lede:
    'Não são o foco do escritório, mas chegam com frequência junto dos casos de família e de imóvel. Quando fazem sentido para o seu caso, a condução é a mesma: técnica e conversa franca.',
  itens: [
    {
      id: 'juridico',
      titulo: 'Assessoria e consultoria jurídica',
      tituloCurto: 'Consultoria jurídica',
      lede: 'Para quem prefere um parecer antes de decidir, em vez de um processo depois do problema.',
      icone: 'M6.6 3.6h7.5l3.9 3.9v12.9H6.6V3.6Zm7.5 0v3.9h3.9M9.6 12.2h5.2m-5.2 3.5h5.2',
      topicos: [
        'Leitura de contratos antes da assinatura',
        'Pareceres e orientação preventiva',
        'Acompanhamento de pequenos negócios',
        'Notificações extrajudiciais e acordos',
      ],
    },
    {
      id: 'holding',
      titulo: 'Holding familiar e patrimonial',
      tituloCurto: 'Holding familiar',
      lede: 'Organização do patrimônio da família ainda em vida, com as regras da sucessão combinadas entre todos.',
      icone: 'M9.2 3.6h5.6v3.4H9.2zM3.6 14.9h5.6v3.4H3.6zM14.8 14.9h5.6v3.4h-5.6zM12 7v3.9M6.4 14.9v-4h11.2v4',
      topicos: [
        'Estudo do patrimônio e da estrutura familiar',
        'Constituição da holding e integralização de bens',
        'Doação de quotas com reserva de usufruto',
        'Acordo de sócios e regras de sucessão',
      ],
    },
  ],
} as const;

/**
 * Frentes que entram só nas opções do agendamento, sem painel próprio na
 * página. Pedido do cliente em 04/08/2026.
 */
export const areasSoAgenda = [
  {
    tituloCurto: 'Tributário',
    topicos: [
      'Isenção de imposto de renda por doença grave',
      'Restituição de imposto pago a mais',
      'ITBI na compra e venda de imóvel',
      'ITCMD em doação e inventário',
      'Parcelamento e negociação de dívida fiscal',
      'Defesa em autuação e execução fiscal',
    ],
  },
] as const;

/** Assuntos de cada área, para o segundo filtro do agendamento. */
export const assuntosPorArea: Record<string, string[]> = Object.fromEntries([
  ...areas.map((a) => [a.tituloCurto, [...a.topicos, `Outro tema de ${a.tituloCurto}`]]),
  ...servicosExtras.itens.map((s) => [
    s.tituloCurto,
    [...s.topicos, `Outro tema de ${s.tituloCurto}`],
  ]),
  ...areasSoAgenda.map((a) => [
    a.tituloCurto,
    [...a.topicos, `Outro tema de ${a.tituloCurto}`],
  ]),
  ['Outro assunto', []],
]);

export const preAgendamento = {
  titulo: 'Agendamento',
  intro:
    'Escolha a área, o tipo de atendimento e o melhor horário. A mensagem chega pronta no WhatsApp e a advogada confirma com você.',
  /* As três frentes principais primeiro, depois as complementares */
  areas: [
    ...areas.map((a) => a.tituloCurto),
    ...servicosExtras.itens.map((s) => s.tituloCurto),
    ...areasSoAgenda.map((a) => a.tituloCurto),
    'Outro assunto',
  ],
  modalidades: [
    'Presencial em Pedro do Rio',
    'Online',
    'Qualquer uma das opções',
  ],
  aviso:
    'O horário fica reservado após a confirmação da advogada pelo WhatsApp.',
} as const;

/**
 * Passo do valor da consulta, exibido antes dos dados pessoais.
 * Quem responde "não" recebe os caminhos de atendimento gratuito em vez do
 * formulário, para não ocupar um horário pago sem querer.
 */
export const honorarios = {
  valor: 'R$ 150',
  pergunta: 'A consulta particular custa R$ 150. Podemos seguir?',
  texto:
    'É uma hora de atendimento com a advogada, com análise dos seus documentos e orientação sobre os próximos passos. O pagamento é combinado direto com ela.',
  opcaoSim: 'Sim, entendo o valor do serviço especializado.',
  opcaoNao: 'Não, estou buscando apenas orientações gratuitas.',
  recusaTitulo: 'Sem problema, aqui vão os caminhos gratuitos',
  recusaTexto:
    'Para atendimento sem custo, procure a Defensoria Pública ou o serviço de assistência judiciária da OAB. Se mudar de ideia e quiser a consulta particular, é só voltar e escolher a primeira opção.',
  recusaLinks: [
    { rotulo: 'Defensoria Pública do Rio de Janeiro', href: 'https://www.defensoria.rj.def.br/' },
    { rotulo: 'OAB Petrópolis', href: 'https://www.oabpetropolis.org.br/' },
  ],
} as const;

export const contato = {
  headline: 'Vamos conversar sobre o seu caso?',
  texto:
    'O atendimento é humano do primeiro ao último contato. Use o agendamento, o botão verde do WhatsApp ou visite o escritório.',
} as const;

export const rodape = {
  avisos: [
    'Publicidade em conformidade com o Código de Ética e Disciplina da OAB e com o Provimento 205/2021.',
    'As informações deste site têm caráter meramente informativo e não constituem aconselhamento jurídico nem promessa de resultado.',
  ],
} as const;
