/**
 * Otimiza o vídeo vertical da capa:
 *  Downloads (3,6 MB) → public/hero/quesia-loop.mp4 (~300 kB) + poster.jpg
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, statSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const copiaLocal = join(raiz, 'src-assets', 'hero-raw.mp4');
const ORIGEM_DOWNLOADS =
  'C:/Users/ABJ PUBLICIDADE/Downloads/movimentos_leves_camera_estática_202608010943.mp4';

mkdirSync(join(raiz, 'src-assets'), { recursive: true });
mkdirSync(join(raiz, 'public', 'hero'), { recursive: true });

if (!existsSync(copiaLocal)) {
  if (!existsSync(ORIGEM_DOWNLOADS)) {
    console.error('Vídeo bruto não encontrado em Downloads nem em src-assets.');
    process.exit(1);
  }
  copyFileSync(ORIGEM_DOWNLOADS, copiaLocal);
  console.log('vídeo bruto copiado para src-assets/hero-raw.mp4');
}

const saida = join(raiz, 'public', 'hero', 'quesia-loop.mp4');
execFileSync(ffmpeg, [
  '-y',
  '-i', copiaLocal,
  '-vf', 'scale=720:-2',
  '-an',
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '28',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  saida,
]);

const posterTmp = join(raiz, 'src-assets', 'poster-frame.png');
execFileSync(ffmpeg, ['-y', '-i', saida, '-frames:v', '1', posterTmp]);
await sharp(posterTmp)
  .resize({ width: 720 })
  .jpeg({ quality: 78, mozjpeg: true })
  .toFile(join(raiz, 'public', 'hero', 'poster.jpg'));
rmSync(posterTmp, { force: true });

const kb = (c) => `${Math.round(statSync(c).size / 1024)} kB`;
console.log(`quesia-loop.mp4: ${kb(saida)}`);
console.log(`poster.jpg: ${kb(join(raiz, 'public', 'hero', 'poster.jpg'))}`);
