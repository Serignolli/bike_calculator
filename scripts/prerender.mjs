// Pré-renderização: grava dentro do <div id="root"> do HTML do build o conteúdo que o React
// renderiza. Robôs de IA (ChatGPT, Claude, Perplexity) não rodam JavaScript e, sem isso,
// recebiam a página vazia. No navegador nada muda: o React renderiza por cima, igual a antes.
// Uso: node scripts/prerender.mjs <url-do-site>
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

const SITE_URL = process.argv[2] ?? 'http://localhost/';
const OUT_DIR = resolve('dist');
const SERVER_DIR = resolve('dist-prerender');
const EMPTY_ROOT = '<div id="root"></div>';

process.env.NODE_ENV = 'production';
// O app lê window, location e localStorage ao montar: um DOM simulado cobre isso no build.
GlobalRegistrator.register({ url: SITE_URL, width: 1280, height: 800 });
// O HTML pré-renderizado sai sempre em português, o idioma padrão do site.
Object.defineProperty(globalThis.navigator, 'language', { get: () => 'pt-BR', configurable: true });
Object.defineProperty(globalThis.navigator, 'languages', { get: () => ['pt-BR', 'pt'], configurable: true });

try {
  const { render, pages = ['index.html'] } = await import(
    pathToFileURL(resolve(SERVER_DIR, 'entry-prerender.js')).href
  );
  // Páginas novas (rotas) partem do index.html do build.
  const template = await readFile(resolve(OUT_DIR, 'index.html'), 'utf8');
  if (!template.includes(EMPTY_ROOT)) throw new Error(`index.html: ${EMPTY_ROOT} não encontrado`);
  for (const page of pages) {
    const html = await render(page, template);
    // render() devolve só o conteúdo do #root, ou o documento inteiro quando a rota tem <head> próprio.
    const out = html.startsWith('<!') ? html : template.replace(EMPTY_ROOT, `<div id="root">${html}</div>`);
    const path = resolve(OUT_DIR, page);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, out);
    console.log(`pré-renderizado: ${page}`);
  }
} finally {
  await rm(SERVER_DIR, { recursive: true, force: true });
  await GlobalRegistrator.unregister();
}
