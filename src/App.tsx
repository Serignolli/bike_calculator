import { useState } from "react";
import { NumberField, Segmented, SelectField } from "./components/fields";
import { BarList } from "./components/results";
import {
  electricWeekly,
  modeCO2gPerKm,
  modeWeeklyCost,
  weeklyKm,
  type ReplacedMode,
  type Trip,
} from "./lib/calc";
import { ELECTRIC_PRESETS, GRID_G_CO2_PER_KWH, SOURCES, WEEKS_PER_MONTH } from "./lib/constants";
import { kg, money, num } from "./lib/format";
import { BikeView } from "./views/BikeView";
import { ElectricView } from "./views/ElectricView";

type Tab = "bike" | "eletrica";

const MODE_OPTIONS: { value: ReplacedMode; label: string }[] = [
  { value: "carro", label: "Carro próprio" },
  { value: "app", label: "Carro por app" },
  { value: "moto", label: "Moto a gasolina" },
  { value: "onibus", label: "Ônibus" },
];

// Velocidade média típica no trânsito urbano, só para preencher o campo.
const MODE_SPEED: Record<ReplacedMode, number> = { carro: 20, app: 20, moto: 25, onibus: 14 };

export default function App() {
  const [tab, setTab] = useState<Tab>("bike");
  const [bodyKg, setBodyKg] = useState(70);
  const [trip, setTrip] = useState<Trip>({
    oneWayKm: 7,
    daysPerWeek: 5,
    mode: "carro",
    modeSpeedKmh: MODE_SPEED.carro,
    gasPrice: 6.5,
    carKmPerL: 11,
    motoKmPerL: 40,
    parkingPerDay: 20,
    busFare: 5.3,
    appFarePerTrip: 25,
  });
  const set = <K extends keyof Trip>(key: K) => (value: Trip[K]) => setTrip((t) => ({ ...t, [key]: value }));

  const modeLabel = MODE_OPTIONS.find((o) => o.value === trip.mode)!.label.toLowerCase();

  return (
    <div className="page">
      <header className="masthead">
        <p className="eyebrow">Calculadora do Pedal</p>
        <h1>Quanto você ganha indo de bicicleta?</h1>
        <p className="lede">
          Troque o carro, a moto ou o ônibus por uma bike — comum ou elétrica — e veja o efeito no bolso, no
          tempo, no clima e no corpo. Todos os números podem ser ajustados para o seu caso.
        </p>
      </header>

      <main className="layout">
        <aside className="trip" aria-label="Seu trajeto">
          <h2>Seu trajeto</h2>
          <NumberField label="Distância só de ida" unit="km" step={0.5} value={trip.oneWayKm} onChange={set("oneWayKm")} />
          <NumberField
            label="Dias por semana"
            unit="dias"
            value={trip.daysPerWeek}
            onChange={(d) => set("daysPerWeek")(Math.min(7, Math.round(d)))}
          />
          <NumberField label="Seu peso" unit="kg" value={bodyKg} onChange={setBodyKg} hint="Usado só nas calorias." />

          <h2>O que você deixaria de usar</h2>
          <SelectField
            label="Meio de transporte atual"
            value={trip.mode}
            options={MODE_OPTIONS}
            onChange={(mode) => setTrip((t) => ({ ...t, mode, modeSpeedKmh: MODE_SPEED[mode] }))}
          />
          <NumberField
            label="Velocidade média no trânsito"
            unit="km/h"
            value={trip.modeSpeedKmh}
            onChange={set("modeSpeedKmh")}
            hint="Em SP, a CET mede ~18–22 km/h para carros no pico."
          />
          {(trip.mode === "carro" || trip.mode === "moto") && (
            <>
              <NumberField label="Gasolina" unit="R$/L" step={0.1} value={trip.gasPrice} onChange={set("gasPrice")} />
              {trip.mode === "carro" ? (
                <NumberField label="Consumo do carro" unit="km/L" value={trip.carKmPerL} onChange={set("carKmPerL")} />
              ) : (
                <NumberField label="Consumo da moto" unit="km/L" value={trip.motoKmPerL} onChange={set("motoKmPerL")} />
              )}
              <NumberField label="Estacionamento" unit="R$/dia" value={trip.parkingPerDay} onChange={set("parkingPerDay")} />
            </>
          )}
          {trip.mode === "app" && (
            <>
              <NumberField label="Preço de cada corrida" unit="R$" value={trip.appFarePerTrip} onChange={set("appFarePerTrip")} />
              <NumberField
                label="Consumo do carro do app"
                unit="km/L"
                value={trip.carKmPerL}
                onChange={set("carKmPerL")}
                hint="Usado só no cálculo de CO₂."
              />
            </>
          )}
          {trip.mode === "onibus" && (
            <NumberField
              label="Tarifa"
              unit="R$"
              step={0.1}
              value={trip.busFare}
              onChange={set("busFare")}
              hint="Uma passagem na ida e outra na volta."
            />
          )}
        </aside>

        <div className="results">
          <Segmented
            role="tablist"
            label="Tipo de bicicleta"
            value={tab}
            onChange={setTab}
            options={[
              { value: "bike", label: "Bicicleta" },
              { value: "eletrica", label: "Bike e moto elétrica" },
            ]}
          />
          {tab === "bike" ? (
            <BikeView trip={trip} bodyKg={bodyKg} modeLabel={modeLabel} />
          ) : (
            <ElectricView trip={trip} bodyKg={bodyKg} modeLabel={modeLabel} />
          )}
          <Comparison trip={trip} />
          <Share trip={trip} />
        </div>
      </main>

      <footer className="sources">
        <h2>Métodos e fontes</h2>
        <p>
          O CO₂ conta só a queima de combustível fóssil (escapamento) e, nos elétricos, a geração da energia da
          tomada. Fabricação dos veículos, manutenção, seguro e preço da bike não entram na conta.
        </p>
        <ol>
          {SOURCES.map((s) => (
            <li key={s.label}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>{" "}
              — {s.detail}
            </li>
          ))}
        </ol>
        <p className="support">
          Gostou? <a href="https://apoie.serignolli.com/" target="_blank" rel="noopener noreferrer">Apoie o projeto</a>.
        </p>
      </footer>
    </div>
  );
}

function Comparison({ trip }: { trip: Trip }) {
  const g = (mode: ReplacedMode) => modeCO2gPerKm({ ...trip, mode });
  const grid = (whPerKm: number) =>
    electricWeekly(1, { whPerKm, batteryWh: 0, kwhPrice: 0, gridGPerKwh: GRID_G_CO2_PER_KWH }).co2g;
  const bars = [
    { label: "Carro por app", value: g("app"), highlight: trip.mode === "app" },
    { label: "Carro", value: g("carro"), highlight: trip.mode === "carro" },
    { label: "Moto a gasolina", value: g("moto"), highlight: trip.mode === "moto" },
    { label: "Ônibus (por pessoa)", value: g("onibus"), highlight: trip.mode === "onibus" },
    { label: "Moto elétrica", value: grid(ELECTRIC_PRESETS.emoto.whPerKm) },
    { label: "Bike elétrica", value: grid(ELECTRIC_PRESETS.ebike.whPerKm) },
    { label: "Bicicleta", value: 0 },
  ];
  return (
    <section className="panel wide">
      <h3>CO₂ por pessoa a cada km</h3>
      <p className="panel-note">Com os consumos informados ao lado. Os elétricos usam a média da rede brasileira.</p>
      <BarList bars={bars} format={(n) => `${num(n, n < 10 && n > 0 ? 1 : 0)} g`} />
    </section>
  );
}

function Share({ trip }: { trip: Trip }) {
  const [copied, setCopied] = useState(false);
  const km = weeklyKm(trip);
  const monthly = modeWeeklyCost(trip) * WEEKS_PER_MONTH;
  const co2Year = modeCO2gPerKm(trip) * km * 52;

  const share = async () => {
    const text =
      `Indo de bike ${num(km)} km por semana eu economizaria ${money(monthly)} por mês ` +
      `e deixaria de emitir ${kg(co2Year)} de CO₂ por ano. Faça a sua conta: ${location.href}`;
    if (navigator.share) {
      await navigator.share({ title: "Calculadora do Pedal", text }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share">
      <button type="button" className="button" onClick={share}>
        {copied ? "Texto copiado" : "Compartilhar resultado"}
      </button>
    </div>
  );
}
