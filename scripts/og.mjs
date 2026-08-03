/** Gera public/og.jpg (1200x630): lockup dourado sobre bone com fios. */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lockup = join(raiz, 'public', 'logos', 'qc-lockup.png');

const fios = Buffer.from(
  `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect x="72" y="56" width="1056" height="1" fill="#C9A851" opacity="0.5"/>
    <rect x="72" y="573" width="1056" height="1" fill="#C9A851" opacity="0.5"/>
  </svg>`
);

const marca = await sharp(lockup)
  .resize({ width: 660, withoutEnlargement: true })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 3,
    background: '#FAF9F9',
  },
})
  .composite([
    { input: fios, top: 0, left: 0 },
    { input: marca, gravity: 'centre' },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(join(raiz, 'public', 'og.jpg'));

console.log('og.jpg gerado');
