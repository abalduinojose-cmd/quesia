// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages: build para docs/ com BASE_PATH="/nome-do-repo" e SITE_URL do usuário.
// Ex. (PowerShell):  $env:BASE_PATH='/quesia-constancio'; $env:SITE_URL='https://usuario.github.io'; npm run build
const SITE_URL = process.env.SITE_URL ?? 'https://abjpublicidade.github.io';
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
