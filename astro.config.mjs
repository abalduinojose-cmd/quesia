// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// `npm run build:pages` gera a prévia do GitHub Pages (repo abalduinojose-cmd/quesia).
// `npm run build` gera para a raiz, pronto para domínio próprio.
// As variáveis SITE_URL / BASE_PATH continuam mandando quando presentes.
const ehPages = process.env.npm_lifecycle_event === 'build:pages';
const SITE_URL =
  process.env.SITE_URL ?? (ehPages ? 'https://abalduinojose-cmd.github.io' : 'https://quesiaconstancio.adv.br');
const BASE_PATH = process.env.BASE_PATH ?? (ehPages ? '/quesia' : '/');

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
