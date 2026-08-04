/**
 * Otimiza os 3 reels do Instagram e extrai os pôsteres.
 * Origem: Downloads (arquivos baixados do perfil da advogada).
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, statSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOWNLOADS = 'C:/Users/ABJ PUBLICIDADE/Downloads';

/* [arquivo, nome, segundo do pôster] — escolhi o quadro em que ela aparece
   melhor, não o primeiro por padrão. */
const origens = [
  ['advogada_quesiaconstancio_1782128963_3925103647524202708_50304883016.mp4', 'reel-01', 1],
  ['advogada_quesiaconstancio_1752581039_3677238404539687753_50304883016.mp4', 'reel-02', 0],
  ['advogada_quesiaconstancio_1711054867_3328891064395099275_50304883016.mp4', 'reel-03', 1],
];

const destino = join(raiz, 'public', 'reels');
mkdirSync(destino, { recursive: true });
mkdirSync(join(raiz, 'src-assets'), { recursive: true });

for (const [arquivo, nome, segundoPoster] of origens) {
  const bruto = join(DOWNLOADS, arquivo);
  const copia = join(raiz, 'src-assets', `${nome}-raw.mp4`);
  if (!existsSync(copia)) {
    if (!existsSync(bruto)) {
      console.error(`não encontrado: ${arquivo}`);
      continue;
    }
    copyFileSync(bruto, copia);
  }

  const saida = join(destino, `${nome}.mp4`);
  execFileSync(ffmpeg, [
    '-y',
    '-i', copia,
    '-vf', 'scale=540:-2',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '30',
    '-c:a', 'aac',
    '-b:a', '96k',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    saida,
  ]);

  const tmp = join(raiz, 'src-assets', `${nome}-poster.png`);
  execFileSync(ffmpeg, [
    '-y',
    '-ss', String(segundoPoster ?? 1),
    '-i', saida,
    '-frames:v', '1',
    tmp,
  ]);
  await sharp(tmp)
    .resize({ width: 540 })
    .jpeg({ quality: 76, mozjpeg: true })
    .toFile(join(destino, `${nome}.jpg`));
  rmSync(tmp, { force: true });

  const kb = (c) => `${Math.round(statSync(c).size / 1024)} kB`;
  console.log(`${nome}: ${kb(saida)} + poster ${kb(join(destino, `${nome}.jpg`))}`);
}
