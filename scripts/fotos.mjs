/**
 * Trata as fotos do ensaio: recorte 3:4 para o "Sobre" e quadro cheio para a
 * hero do desktop, sempre em AVIF + WebP.
 *
 * São duas origens diferentes de propósito: o retrato fechado funciona bem no
 * avatar do agendamento, e a foto do escritório funciona bem em tela cheia.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_ENSAIO = 'C:/Users/ABJ PUBLICIDADE/Desktop/ABJ/QUESIA CONTÁNCIA/FOTOS';

const ORIGEM_FOTO = `${PASTA_ENSAIO}/WhatsApp Image 2025-04-21 at 08.10.55.jpg`;
const ORIGEM_HERO = `${PASTA_ENSAIO}/IMG_6443.jpg`;

const copiaLocal = join(raiz, 'src-assets', 'sobre-original.jpg');
const copiaHero = join(raiz, 'src-assets', 'hero-original.jpg');
const destino = join(raiz, 'public', 'sobre');

mkdirSync(join(raiz, 'src-assets'), { recursive: true });
mkdirSync(destino, { recursive: true });

if (!existsSync(copiaLocal)) {
  copyFileSync(ORIGEM_FOTO, copiaLocal);
  console.log('foto original copiada para src-assets/sobre-original.jpg');
}
// A foto da hero sai da câmera com 5184px e 18 MB. O maior arquivo que a gente
// entrega tem 2560px, então a cópia de trabalho fica em 3200px: sobra margem
// para recortar e o repositório não engorda com um arquivo que ninguém usa
// inteiro. O original continua na pasta do ensaio.
if (!existsSync(copiaHero)) {
  await sharp(ORIGEM_HERO)
    .rotate()
    .resize({ width: 3200, withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(copiaHero);
  console.log('foto da hero copiada para src-assets/hero-original.jpg (3200px)');
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

/* Hero desktop full-bleed (v3): quadro inteiro em larguras responsivas.
 *
 * O quadro sai espelhado (.flop) porque no original a Quesia fica à esquerda e
 * a estátua à direita, justo onde o título e os botões entram. Espelhado, ela
 * vai para o lado claro do véu e a estátua fica atrás do texto. */
const baseHero = sharp(copiaHero).rotate().flop();
const dirHero = join(raiz, 'public', 'hero');
mkdirSync(dirHero, { recursive: true });
for (const largura of [1280, 1920, 2560]) {
  const quadro = baseHero.clone().resize({ width: largura, withoutEnlargement: true });
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
