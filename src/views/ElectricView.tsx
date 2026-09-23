import { useState } from "react";
import { NumberField, Segmented } from "../components/fields";
import { Panel, Rows, Stat } from "../components/results";
import {
  electricWeekly,
  extraKcal,
  minutesPerDay,
  modeCO2gPerKm,
  modeWeeklyCost,
  weeklyKm,
  type Electric,
  type Trip,
} from "../lib/calc";
import { ELECTRIC_PRESETS, FOODS, GRID_G_CO2_PER_KWH, MET, WEEKS_PER_MONTH, type ElectricKind as Kind } from "../lib/constants";
import { kg, minutes, money, num } from "../lib/format";

type Assist = "leve" | "alta";

const RULES: Record<Kind, string> = {
  ebike:
    "Pela Resolução CONTRAN 996/2023, bicicleta elétrica só tem pedal assistido (sem acelerador), motor de até 1.000 W e assistência até 32 km/h. Não precisa de placa, registro ou habilitação.",
  emoto:
    "Com acelerador, até 1.000 W e 32 km/h, é autopropelido: sem placa nem habilitação. Até 4.000 W e 50 km/h é ciclomotor: exige registro, placa, capacete e habilitação ACC ou A. Acima disso, é motocicleta.",
};

export function ElectricView({ trip, bodyKg, modeLabel }: { trip: Trip; bodyKg: number; modeLabel: string }) {
  const [kind, setKind] = useState<Kind>("ebike");
  const [assist, setAssist] = useState<Assist>("leve");
  const [speed, setSpeed] = useState(ELECTRIC_PRESETS.ebike.speed);
  const [e, setE] = useState<Electric>({
    whPerKm: ELECTRIC_PRESETS.ebike.whPerKm,
    batteryWh: ELECTRIC_PRESETS.ebike.batteryWh,
    kwhPrice: 0.95,
    gridGPerKwh: GRID_G_CO2_PER_KWH,
  });
  const set = (key: keyof Electric) => (value: number) => setE((prev) => ({ ...prev, [key]: value }));

  const changeKind = (next: Kind) => {
    const p = ELECTRIC_PRESETS[next];
    setKind(next);
    setSpeed(p.speed);
    setE((prev) => ({ ...prev, whPerKm: p.whPerKm, batteryWh: p.batteryWh }));
  };

  const km = weeklyKm(trip);
  const w = electricWeekly(km, e);
  const saved = modeWeeklyCost(trip) - w.cost;
  const co2Year = (modeCO2gPerKm(trip) * km - w.co2g) * 52;
  const minDiff = minutesPerDay(trip.oneWayKm, trip.modeSpeedKmh) - minutesPerDay(trip.oneWayKm, speed);
  const kcal = extraKcal(assist === "leve" ? MET.ebikeLow : MET.ebikeHigh, bodyKg, speed > 0 ? km / speed : 0);

  return (
    <>
      <div className="vehicle">
        <Segmented
          label="Veículo elétrico"
          value={kind}
          onChange={changeKind}
          options={[
            { value: "ebike", label: "Bicicleta elétrica" },
            { value: "emoto", label: "Scooter ou moto elétrica" },
          ]}
        />
        <div className="vehicle-grid">
          <NumberField label="Velocidade média" unit="km/h" value={speed} onChange={setSpeed} />
          <NumberField
            label="Consumo"
            unit="Wh/km"
            value={e.whPerKm}
            onChange={set("whPerKm")}
            hint={kind === "ebike" ? "Bikes: 8–15 Wh/km." : "Scooters e motos: 30–60 Wh/km."}
          />
          <NumberField label="Bateria" unit="Wh" step={50} value={e.batteryWh} onChange={set("batteryWh")} hint="Volts × Ah. Ex.: 48 V × 10 Ah = 480 Wh." />
          <NumberField
            label="Tarifa de energia"
            unit="R$/kWh"
            step={0.05}
            value={e.kwhPrice}
            onChange={set("kwhPrice")}
            hint="Com impostos. Veja na sua conta de luz."
          />
        </div>
      </div>

      <div className="stats">
        <Stat
          label="Economia por mês"
          value={money(saved * WEEKS_PER_MONTH)}
          note={`já descontados ${money(w.cost * WEEKS_PER_MONTH)} de energia`}
        />
        <Stat label="CO₂ evitado por ano" value={kg(co2Year)} note={`a rede ainda emite ${kg(w.co2g * 52)}`} />
        <Stat
          label={minDiff >= 0 ? "Tempo ganho por dia" : "Tempo a mais por dia"}
          value={minutes(minDiff)}
          note={`de elétrica: ${minutes(minutesPerDay(trip.oneWayKm, speed))} ida e volta`}
        />
      </div>

      <div className="panels">
        <Panel title="Recarga">
          <Rows
            rows={[
              ["Energia da tomada por semana", `${num(w.gridKwh, 1)} kWh`],
              ["Custo por semana", money(w.cost)],
              ["Custo por km", money(km > 0 ? w.cost / km : 0)],
              ["Recargas por semana", num(w.charges, 1)],
              ["Autonomia estimada", `${num(w.rangeKm)} km`],
            ]}
          />
          <p className="panel-note">Considera 15% de perda no carregador. Autonomia real cai com subidas, frio e peso.</p>
        </Panel>

        <Panel title="No bolso">
          <Rows
            rows={[
              [`Gasto semanal com ${modeLabel}`, money(modeWeeklyCost(trip))],
              ["Energia elétrica por semana", `− ${money(w.cost)}`],
              ["Economia por ano", money(saved * 52)],
            ]}
          />
          <p className="panel-note">Não inclui compra, troca de bateria, manutenção ou seguro.</p>
        </Panel>

        <Panel title="No clima">
          <NumberField
            label="Emissão da rede elétrica"
            unit="g CO₂/kWh"
            step={0.5}
            value={e.gridGPerKwh}
            onChange={set("gridGPerKwh")}
            hint="Média do Brasil em 2023: 38,5 (MCTI). Com energia solar própria, perto de 0."
          />
          <Rows
            rows={[
              ["CO₂ evitado por semana", kg(co2Year / 52)],
              ["Por ano", kg(co2Year)],
            ]}
          />
        </Panel>

        {kind === "ebike" ? (
          <Panel title="No corpo">
            <Segmented
              label="Nível de assistência"
              value={assist}
              onChange={setAssist}
              options={[
                { value: "leve", label: "Assistência leve" },
                { value: "alta", label: "Assistência alta" },
              ]}
            />
            <Rows
              rows={[
                ["Calorias extras por semana", `${num(kcal)} kcal`],
                [`${FOODS[0].name} (${FOODS[0].unit})`, `${num(kcal / FOODS[0].kcal, 1)} un.`],
              ]}
            />
            <p className="panel-note">Na e-bike você ainda pedala: com assistência leve o gasto fica perto da bike comum.</p>
          </Panel>
        ) : (
          <Panel title="Antes de comprar">
            <p className="panel-text">{RULES.emoto}</p>
          </Panel>
        )}
      </div>

      {kind === "ebike" && <p className="rules">{RULES.ebike}</p>}
    </>
  );
}
