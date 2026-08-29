// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// O site roda no domínio próprio, na raiz, SEM www: é o que está configurado
// no painel do Pages, e o www redireciona para cá. O public/CNAME precisa dizer
// exatamente a mesma coisa, senão o deploy troca o domínio configurado pelas
// costas e derruba o certificado por alguns minutos.
//
// A prévia antiga em
// abalduinojose-cmd.github.io/quesia deixou de existir: com o domínio ligado, o
// GitHub redireciona aquele endereço para cá, e um build com base `/quesia`
// deixaria todo o CSS e o JS apontando para um caminho que não existe na raiz.
//
// `build` e `build:pages` fazem a mesma coisa desde a virada. SITE_URL e
// BASE_PATH continuam mandando quando presentes, caso um dia seja preciso
// gerar uma prévia em subpasta de novo.
const SITE_URL = process.env.SITE_URL ?? 'https://quesiaconstancio.com.br';
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: 'static',
  outDir: 'docs',
  // A porta vem do ambiente (o harness pode atribuir outra); 5206 é só o padrão
  server: { port: Number(process.env.PORT) || 5206 },
  devToolbar: { enabled: false },
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  build: {
    // "assets" sem underscore: o GitHub Pages (Jekyll) ignora pastas _assim
    assets: 'assets',
    inlineStylesheets: 'auto'
  }
});
