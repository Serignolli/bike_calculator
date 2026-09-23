import { useEffect, useId, useState, type ReactNode } from "react";

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  hint?: ReactNode;
};

/** Campo numérico que aceita vírgula e permite apagar o valor enquanto digita. */
export function NumberField({ label, value, onChange, unit, step = 1, min = 0, hint }: NumberFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft((current) => (parse(current) === value ? current : String(value)));
  }, [value]);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={draft.replace(".", ",")}
          onChange={(e) => {
            setDraft(e.target.value);
            const n = parse(e.target.value);
            if (Number.isFinite(n) && n >= min) onChange(n);
          }}
          onBlur={() => setDraft(String(value))}
          onKeyDown={(e) => {
            if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
            e.preventDefault();
            const next = Math.max(min, round(value + (e.key === "ArrowUp" ? step : -step)));
            onChange(next);
          }}
        />
        {unit && <span className="unit">{unit}</span>}
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

const parse = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(",", ".")));
const round = (n: number) => Math.round(n * 1000) / 1000;

type Option<T extends string> = { value: T; label: string };

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/** Grupo de botões exclusivos (usado para abas e escolhas curtas). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  role = "radiogroup",
}: {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  label: string;
  role?: "radiogroup" | "tablist";
}) {
  const itemRole = role === "tablist" ? "tab" : "radio";
  return (
    <div className="segmented" role={role} aria-label={label}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role={itemRole}
            aria-selected={itemRole === "tab" ? active : undefined}
            aria-checked={itemRole === "radio" ? active : undefined}
            className={active ? "active" : undefined}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
