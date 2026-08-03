/**
 * Trata a foto do "Sobre": recorte 3:4 + AVIF/WebP em dois tamanhos.
 * Troque ORIGEM_FOTO para usar outra imagem do ensaio.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEM_FOTO =
  'C:/Users/ABJ PUBLICIDADE/Desktop/ABJ/QUESIA CONTÁNCIA/FOTOS/WhatsApp Image 2025-04-21 at 08.10.55.jpg';
const copiaLocal = join(raiz, 'src-assets', 'sobre-original.jpg');
const destino = join(raiz, 'public', 'sobre');

mkdirSync(join(raiz, 'src-assets'), { recursive: true });
mkdirSync(destino, { recursive: true });

if (!existsSync(copiaLocal)) {
  copyFileSync(ORIGEM_FOTO, copiaLocal);
  console.log('foto original copiada para src-assets/sobre-original.jpg');
}

const base = sharp(copiaLocal).rotate();

/* Retrato 3:4 (reserva; a v3 usa vídeo no Sobre) */
for (const largura of [640, 960]) {
  const altura = Math.round((largura * 4) / 3);
  const recorte = base.clone().resize(largura, altura, {
    fit: 'cover',
    position: sharp.strategy.attention,
  });
  await recorte
    .clone()
    .avif({ quality: 55 })
    .toFile(join(destino, `quesia-${largura}.avif`));
  await recorte
    .clone()
    .webp({ quality: 80 })
    .toFile(join(destino, `quesia-${largura}.webp`));
  console.log(`sobre: quesia-${largura} (avif + webp)`);
}

/* Hero desktop full-bleed (v3): quadro inteiro em larguras responsivas */
const dirHero = join(raiz, 'public', 'hero');
mkdirSync(dirHero, { recursive: true });
for (const largura of [1280, 1920, 2560]) {
  const quadro = base.clone().resize({ width: largura, withoutEnlargement: true });
  await quadro
    .clone()
    .avif({ quality: 52 })
    .toFile(join(dirHero, `hero-${largura}.avif`));
  await quadro
    .clone()
    .webp({ quality: 76 })
    .toFile(join(dirHero, `hero-${largura}.webp`));
  console.log(`hero desktop: hero-${largura} (avif + webp)`);
}
