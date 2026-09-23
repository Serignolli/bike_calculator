import { useState } from "react";
import { NumberField } from "../components/fields";
import { Panel, Rows, Stat } from "../components/results";
import { dynamoWh, extraKcal, minutesPerDay, modeCO2gPerKm, modeWeeklyCost, weeklyKm, type Trip } from "../lib/calc";
import { FOODS, MET, TREE_KG_CO2_10Y, WEEKS_PER_MONTH } from "../lib/constants";
import { kg, minutes, money, num } from "../lib/format";

export function BikeView({ trip, bodyKg, modeLabel }: { trip: Trip; bodyKg: number; modeLabel: string }) {
  const [speed, setSpeed] = useState(16);
  const [dynamo, setDynamo] = useState(false);
  const [phoneWh, setPhoneWh] = useState(17);

  const km = weeklyKm(trip);
  const rideHours = speed > 0 ? km / speed : 0;
  const weeklyCost = modeWeeklyCost(trip);
  const co2Year = modeCO2gPerKm(trip) * km * 52;
  const kcal = extraKcal(MET.bike, bodyKg, rideHours);
  const minDiff = minutesPerDay(trip.oneWayKm, trip.modeSpeedKmh) - minutesPerDay(trip.oneWayKm, speed);
  const dynWh = dynamoWh(rideHours);

  return (
    <>
      <div className="vehicle">
        <NumberField label="Sua velocidade média" unit="km/h" value={speed} onChange={setSpeed} hint="Contando semáforos e paradas." />
      </div>

      <div className="stats">
        <Stat label="Economia por mês" value={money(weeklyCost * WEEKS_PER_MONTH)} note={`${money(weeklyCost * 52)} por ano`} />
        <Stat label="CO₂ evitado por ano" value={kg(co2Year)} note={`em ${num(km * 52)} km pedalados`} />
        <Stat
          label={minDiff >= 0 ? "Tempo ganho por dia" : "Tempo a mais por dia"}
          value={minutes(minDiff)}
          note={`de bike: ${minutes(minutesPerDay(trip.oneWayKm, speed))} ida e volta`}
        />
      </div>

      <div className="panels">
        <Panel title="No bolso">
          <Rows
            rows={[
              [`Gasto semanal com ${modeLabel}`, money(weeklyCost)],
              ["Por mês", money(weeklyCost * WEEKS_PER_MONTH)],
              ["Por ano", money(weeklyCost * 52)],
            ]}
          />
          <p className="panel-note">Não desconta manutenção da bicicleta, que costuma ser baixa.</p>
        </Panel>

        <Panel title="No clima">
          <Rows
            rows={[
              ["CO₂ evitado por semana", kg(co2Year / 52)],
              ["Por ano", kg(co2Year)],
              ["Árvores urbanas equivalentes", num(co2Year / 1000 / TREE_KG_CO2_10Y)],
            ]}
          />
          <p className="panel-note">
            Árvores: quantas mudas levariam 10 anos crescendo para absorver o CO₂ de um ano de pedal.
          </p>
        </Panel>

        <Panel title="No corpo">
          <Rows
            rows={[
              ["Calorias extras por semana", `${num(kcal)} kcal`],
              ...FOODS.map((f): [string, string] => [`${f.name} (${f.unit})`, `${num(kcal / f.kcal, 1)} un.`]),
            ]}
          />
          <p className="panel-note">Gasto acima do repouso, pedalando em ritmo de deslocamento.</p>
        </Panel>

        <Panel title="Dínamo no cubo">
          <label className="check">
            <input type="checkbox" checked={dynamo} onChange={(e) => setDynamo(e.target.checked)} />
            Tenho (ou quero) um dínamo com carregador USB
          </label>
          {dynamo && (
            <>
              <NumberField label="Bateria do celular" unit="Wh" value={phoneWh} onChange={setPhoneWh} hint="4.500 mAh ≈ 17 Wh." />
              <Rows
                rows={[
                  ["Energia por semana", `${num(dynWh, 1)} Wh`],
                  ["Cargas completas do celular", num(phoneWh > 0 ? dynWh / phoneWh : 0, 1)],
                ]}
              />
              <p className="panel-note">Dínamo de 3 W e ~60% de eficiência no carregador. Rende pouco abaixo de 15 km/h.</p>
            </>
          )}
        </Panel>
      </div>
    </>
  );
}
