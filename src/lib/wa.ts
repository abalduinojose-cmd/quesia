import { site } from '@/content/data';

/** Monta um link wa.me com a mensagem codificada. */
export function waLink(mensagem: string): string {
  return `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`;
}

/** Mensagem padrão do CTA principal. */
export const waMensagemPadrao =
  'Olá, Dra. Quesia! Vim pelo site e gostaria de conversar sobre o meu caso.';

/* A mensagem estruturada do agendamento é montada dentro do próprio wizard
   (Agendamento.tsx), porque depende de área, tema, data e valor escolhidos. */
