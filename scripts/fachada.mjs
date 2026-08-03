/**
 * Gera public/fachada/fachada.jpg: o logo em relevo claro sobre parede escura,
 * reproduzindo a foto de fachada da marca.
 *
 * PARA USAR A FOTO REAL: salve o arquivo como src-assets/fachada-original.jpg
 * e rode `npm run fachada` de novo, o script apenas redimensiona e comprime.
 */
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'public', 'fachada');
const original = join(raiz, 'src-assets', 'fachada-original.jpg');
mkdirSync(destino, { recursive: true });
mkdirSync(join(raiz, 'src-assets'), { recursive: true });

const L = 1080;
const A = 1350; // 4:5, bom para faixa vertical no celular

let base;
if (existsSync(original)) {
  base = sharp(original).resize(L, A, { fit: 'cover', position: 'centre' });
  console.log('usando a foto real de src-assets/fachada-original.jpg');
} else {
  /* Parede escura com leve variação + vinheta */
  const parede = Buffer.from(
    `<svg width="${L}" height="${A}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3A3B3F"/>
          <stop offset="45%" stop-color="#2A2B2E"/>
          <stop offset="100%" stop-color="#171719"/>
        </linearGradient>
        <radialGradient id="v" cx="50%" cy="42%" r="72%">
          <stop offset="55%" stop-color="rgb(0,0,0)" stop-opacity="0"/>
          <stop offset="100%" stop-color="rgb(0,0,0)" stop-opacity="0.55"/>
        </radialGradient>
      </defs>
      <rect width="${L}" height="${A}" fill="url(#p)"/>
      <rect width="${L}" height="${A}" fill="url(#v)"/>
    </svg>`
  );

  /* Lockup em branco: recolore mantendo o alfa original */
  const larguraMarca = Math.round(L * 0.6);
  const bruto = await sharp(join(raiz, 'public', 'logos', 'qc-lockup.png'))
    .resize({ width: larguraMarca, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: mw, height: mh, channels } = bruto.info;
  const branco = Buffer.from(bruto.data);
  const preto = Buffer.from(bruto.data);
  for (let i = 0; i < mw * mh; i++) {
    const p = i * channels;
    branco[p] = 250;
    branco[p + 1] = 249;
    branco[p + 2] = 249;
    preto[p] = 0;
    preto[p + 1] = 0;
    preto[p + 2] = 0;
    preto[p + 3] = Math.round(bruto.data[p + 3] * 0.55);
  }

  const marca = await sharp(branco, { raw: bruto.info }).png().toBuffer();
  const sombra = await sharp(preto, { raw: bruto.info }).blur(11).png().toBuffer();

  const topo = Math.round((A - mh) / 2);
  const esq = Math.round((L - mw) / 2);

  base = sharp(parede).composite([
    { input: sombra, top: topo + 12, left: esq + 9 },
    { input: marca, top: topo, left: esq },
  ]);
  console.log('foto real ausente: gerando a cena com o logo oficial');
}

const saida = join(destino, 'fachada.jpg');
await base.jpeg({ quality: 80, mozjpeg: true }).toFile(saida);
console.log(`fachada.jpg: ${Math.round(statSync(saida).size / 1024)} kB`);
