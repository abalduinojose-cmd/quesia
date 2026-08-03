/**
 * Gera as versões do logo a partir da arte oficial (fundo claro removido):
 *  - qc-lockup.png  (monograma + wordmark, dourado original)
 *  - qc-mark.png    (só o monograma, dourado original)
 *  - qc-mark-bone.png / qc-mark-ink.png (tintas chapadas)
 *  - favicon.png / apple-touch-icon.png
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEM_OFICIAL =
  'C:/Users/ABJ PUBLICIDADE/Desktop/ABJ/QUESIA CONTÁNCIA/NOVA IDENTIDADE/cartão/1frenteA.jpg';
const copiaLocal = join(raiz, 'src-assets', 'logo-oficial.jpg');
const dirLogos = join(raiz, 'public', 'logos');
const dirPublic = join(raiz, 'public');

mkdirSync(join(raiz, 'src-assets'), { recursive: true });
mkdirSync(dirLogos, { recursive: true });

if (!existsSync(copiaLocal)) {
  copyFileSync(ORIGEM_OFICIAL, copiaLocal);
  console.log('arte oficial copiada para src-assets/logo-oficial.jpg');
}

/** Remove o fundo claro: alpha proporcional à distância da cor do canto. */
async function removeFundo(entrada) {
  const { data, info } = await entrada
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const br = data[0];
  const bg = data[1];
  const bb = data[2];
  for (let i = 0; i < width * height; i++) {
    const p = i * channels;
    const d = Math.max(
      Math.abs(data[p] - br),
      Math.abs(data[p + 1] - bg),
      Math.abs(data[p + 2] - bb)
    );
    data[p + 3] = Math.max(0, Math.min(255, (d - 8) * 5));
  }
  return sharp(data, { raw: { width, height, channels } });
}

/** Recolore mantendo o alpha. */
function tinta(pixels, info, r, g, b) {
  const copia = Buffer.from(pixels);
  for (let i = 0; i < info.width * info.height; i++) {
    const p = i * info.channels;
    copia[p] = r;
    copia[p + 1] = g;
    copia[p + 2] = b;
  }
  return sharp(copia, { raw: info });
}

const meta = await sharp(copiaLocal).metadata();
const W = meta.width ?? 1125;
const H = meta.height ?? 675;

/* Lockup completo */
const lockup = await (await removeFundo(sharp(copiaLocal))).png().toBuffer();
await sharp(lockup)
  .trim({ threshold: 12 })
  .resize({ width: 1200, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(join(dirLogos, 'qc-lockup.png'));

/* Só o monograma: divide o lockup no maior vão horizontal do canal alpha
   (separa o QC do wordmark sem depender de medidas fixas) */
const lockupTrim = await sharp(lockup).trim({ threshold: 12 }).png().toBuffer();
const lk = await sharp(lockupTrim)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const vazia = (y) => {
  let s = 0;
  for (let x = 0; x < lk.info.width; x++) {
    s += lk.data[(y * lk.info.width + x) * lk.info.channels + 3];
  }
  return s < lk.info.width * 2;
};
let melhorIni = -1;
let melhorLen = 0;
let ini = -1;
const yMin = Math.floor(lk.info.height * 0.3);
const yMax = Math.floor(lk.info.height * 0.9);
for (let y = yMin; y < yMax; y++) {
  if (vazia(y)) {
    if (ini < 0) ini = y;
  } else if (ini >= 0) {
    if (y - ini > melhorLen) {
      melhorLen = y - ini;
      melhorIni = ini;
    }
    ini = -1;
  }
}
if (ini >= 0 && yMax - ini > melhorLen) {
  melhorLen = yMax - ini;
  melhorIni = ini;
}
const corte =
  melhorIni > 0
    ? melhorIni + Math.floor(melhorLen / 2)
    : Math.floor(lk.info.height * 0.62);
const markTrim = await sharp(lockupTrim)
  .extract({ left: 0, top: 0, width: lk.info.width, height: corte })
  .trim({ threshold: 12 })
  .png()
  .toBuffer();
await sharp(markTrim)
  .resize({ width: 600, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(join(dirLogos, 'qc-mark.png'));

/* Tintas chapadas do monograma */
const markRaw = await sharp(markTrim)
  .resize({ width: 600, withoutEnlargement: true })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
await tinta(markRaw.data, markRaw.info, 250, 249, 249)
  .png({ compressionLevel: 9 })
  .toFile(join(dirLogos, 'qc-mark-bone.png'));
await tinta(markRaw.data, markRaw.info, 36, 36, 36)
  .png({ compressionLevel: 9 })
  .toFile(join(dirLogos, 'qc-mark-ink.png'));

/* Favicons */
await sharp(markTrim)
  .resize(56, 56, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 4, bottom: 4, left: 4, right: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(join(dirPublic, 'favicon.png'));

await sharp(markTrim)
  .resize(132, 132, { fit: 'contain', background: '#FAF9F9' })
  .extend({ top: 24, bottom: 24, left: 24, right: 24, background: '#FAF9F9' })
  .png()
  .toFile(join(dirPublic, 'apple-touch-icon.png'));

console.log('logos gerados em public/logos');
