/**
 * Injeta um Content-Security-Policy em cada página gerada.
 *
 * Por que por <meta> e não por cabeçalho: o GitHub Pages não deixa configurar
 * cabeçalho HTTP nenhum. A meta cobre quase tudo; o que ela não cobre está
 * anotado no fim deste arquivo.
 *
 * Por que rodar depois do build: o Astro gera scripts inline (hidratação da
 * ilha React, JSON-LD, o script do vídeo do hero). Para não precisar liberar
 * 'unsafe-inline' em script-src, que é justamente o que um CSP existe para
 * impedir, aqui a gente lê o HTML pronto, calcula o sha256 de cada bloco inline
 * e libera só aqueles. Qualquer script injetado depois, por XSS, não bate com
 * nenhum hash e não roda.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pasta = join(raiz, 'docs');

/** Hosts de fora que o site realmente usa. Nada além disto carrega. */
const IMAGENS_EXTERNAS = 'https://lh3.googleusercontent.com';
const BANCO = 'https://*.supabase.co wss://*.supabase.co';

const sha = (texto) => `'sha256-${createHash('sha256').update(texto, 'utf8').digest('base64')}'`;

/** Todo <script> sem src e todo <style>, com o conteúdo exato. */
function blocosInline(html, tag) {
  const re = new RegExp(`<${tag}(?![^>]*\\ssrc=)[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
  return [...html.matchAll(re)].map((m) => m[1]);
}

function paginas(dir) {
  const achados = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) achados.push(...paginas(caminho));
    else if (nome.endsWith('.html')) achados.push(caminho);
  }
  return achados;
}

let total = 0;

for (const arquivo of paginas(pasta)) {
  let html = readFileSync(arquivo, 'utf8');

  /* Se rodar duas vezes, não empilha meta. */
  html = html.replace(
    /<meta http-equiv="Content-Security-Policy"[^>]*>/gi,
    ''
  );

  const hashesScript = [...new Set(blocosInline(html, 'script').map(sha))];

  const politica = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "worker-src 'self'",
    "manifest-src 'self'",
    `script-src 'self' ${hashesScript.join(' ')}`,
    /* style-src fica com 'unsafe-inline' porque há 68 atributos style="..." no
       HTML, e atributo de estilo não é coberto por hash. CSS injetado é um
       problema bem menor que JavaScript injetado. */
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `img-src 'self' data: ${IMAGENS_EXTERNAS}`,
    "media-src 'self'",
    `connect-src 'self' ${BANCO}`,
    'upgrade-insecure-requests',
  ].join('; ');

  const meta = `<meta http-equiv="Content-Security-Policy" content="${politica}">`;

  /* Logo depois de <head>, antes de qualquer script, senão não vale para eles. */
  if (!/<head[^>]*>/i.test(html)) {
    console.warn(`csp: ${arquivo} não tem <head>, pulado`);
    continue;
  }
  html = html.replace(/(<head[^>]*>)/i, `$1${meta}`);

  writeFileSync(arquivo, html);
  total += 1;
  console.log(`csp: ${arquivo.slice(pasta.length + 1)} (${hashesScript.length} scripts inline)`);
}

console.log(`csp: ${total} página(s) protegida(s)`);

/**
 * O que a meta NÃO cobre, por limitação da própria especificação:
 *
 *   frame-ancestors  → contra clickjacking. Só funciona por cabeçalho HTTP, que
 *                      o GitHub Pages não deixa configurar. Por isso o /admin
 *                      tem um trecho próprio que se recusa a rodar dentro de
 *                      iframe (ver PainelLocal.astro).
 *   report-uri       → não há para onde reportar num site estático.
 *   sandbox          → idem.
 *
 * Se um dia o site sair do GitHub Pages para a Cloudflare ou a Vercel, vale
 * migrar tudo isto para cabeçalho e acrescentar frame-ancestors 'none',
 * Strict-Transport-Security, X-Content-Type-Options e Referrer-Policy.
 */
