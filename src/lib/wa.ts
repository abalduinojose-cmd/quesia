import { site } from '@/content/data';

/** Monta um link wa.me com a mensagem codificada. */
export function waLink(mensagem: string): string {
  return `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`;
}

/** Mensagem padrão do CTA principal. */
export const waMensagemPadrao =
  'Olá, Dra. Quesia! Vim pelo site e gostaria de conversar sobre o meu caso.';

/** Mensagem pré-filtrada por área de atuação. */
export function waMensagemArea(area: string): string {
  return `Olá, Dra. Quesia! Vim pelo site e gostaria de falar sobre ${area}.`;
}

export interface DadosAgendamento {
  area: string;
  modalidade: string;
  nome: string;
  resumo?: string;
}

/** Mensagem estruturada do wizard de pré-agendamento. */
export function waMensagemAgendamento(d: DadosAgendamento): string {
  const linhas = [
    'Olá, Dra. Quesia! Vim pelo site e gostaria de um pré-agendamento.',
    `Área: ${d.area}`,
    `Atendimento: ${d.modalidade}`,
    `Nome: ${d.nome}`,
  ];
  if (d.resumo && d.resumo.trim().length > 0) {
    linhas.push(`Resumo: ${d.resumo.trim()}`);
  }
  return linhas.join('\n');
}
