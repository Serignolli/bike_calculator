// Usado só no build (scripts/prerender.mjs): gera o HTML da página para que robôs que não
// rodam JavaScript (ChatGPT, Claude, Perplexity) leiam o conteúdo. No navegador, o main.tsx
// renderiza tudo de novo por cima, igual a antes.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
