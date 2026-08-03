/** Copia as fontes locais de node_modules para public/fonts. */
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Em src/ (não em public/): o Vite reescreve as URLs respeitando o BASE_PATH
const destino = join(raiz, 'src', 'assets', 'fonts');
mkdirSync(destino, { recursive: true });

const arquivos = [
  [
    'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
    'inter-var.woff2',
  ],
  [
    'node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2',
    'fraunces-var.woff2',
  ],
  [
    'node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2',
    'fraunces-var-italic.woff2',
  ],
];

for (const [origem, nome] of arquivos) {
  copyFileSync(join(raiz, origem), join(destino, nome));
  console.log(`fonte copiada: ${nome}`);
}
