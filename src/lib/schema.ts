import { site, seo, especialidades } from '@/content/data';

/**
 * JSON-LD schema.org para a advogada.
 * aggregateRating fica de fora de propósito: coerência com a decisão de não
 * exibir depoimentos (Provimento 205/2021 da OAB).
 * openingHours omitido: o horário público do Google aparenta estar errado.
 */
export function jsonLdAttorney(url: string, logoUrl: string, fotoUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Attorney',
    name: `${site.nome} ${site.sufixo}`,
    alternateName: site.tagline,
    slogan: site.slogan,
    description: seo.descricao,
    url,
    image: fotoUrl,
    logo: logoUrl,
    telephone: `+${site.whatsapp.numero}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.endereco.linha1,
      addressLocality: 'Petrópolis',
      addressRegion: 'RJ',
      addressCountry: 'BR',
    },
    areaServed: ['Petrópolis RJ', 'Região Serrana do RJ', 'Brasil (online)'],
    knowsAbout: [...especialidades],
    sameAs: [
      site.social.instagram,
      site.social.facebook,
      site.social.linkedin,
      site.social.google,
    ],
  };
}
