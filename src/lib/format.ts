const cache = new Map<number, Intl.NumberFormat>();

export function num(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "–";
  let f = cache.get(digits);
  if (!f) {
    f = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    cache.set(digits, f);
  }
  return f.format(n);
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const money = (n: number) => (Number.isFinite(n) ? brl.format(n) : "–");

/** kg com casas decimais só quando o número é pequeno. */
export const kg = (grams: number) => {
  const k = grams / 1000;
  return `${num(k, k < 10 ? 1 : 0)} kg`;
};

export const minutes = (m: number) => {
  const abs = Math.abs(Math.round(m));
  if (abs < 60) return `${abs} min`;
  return `${Math.floor(abs / 60)} h ${String(abs % 60).padStart(2, "0")}`;
};
