import type { ReactNode } from "react";

export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

/** Linhas "rótulo ........ valor". */
export function Rows({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="rows">
      {rows.map(([k, v], i) => (
        <div key={i}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export type Bar = { label: string; value: number; highlight?: boolean };

/** Barras horizontais de uma só série, com o valor escrito ao lado. */
export function BarList({ bars, format }: { bars: Bar[]; format: (n: number) => string }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <ul className="bars">
      {bars.map((b) => (
        <li key={b.label} className={b.highlight ? "highlight" : undefined}>
          <span className="bar-label">{b.label}</span>
          <span className="bar-track" aria-hidden>
            <span className="bar-fill" style={{ width: `${Math.max(b.value > 0 ? 1 : 0, (b.value / max) * 100)}%` }} />
          </span>
          <span className="bar-value">{format(b.value)}</span>
        </li>
      ))}
    </ul>
  );
}
