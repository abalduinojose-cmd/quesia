/** Prefixa caminhos absolutos com o BASE_URL (GitHub Pages em subpasta). */
export function withBase(caminho: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}${caminho.startsWith('/') ? caminho : `/${caminho}`}`;
}
