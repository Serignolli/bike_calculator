import {
  BUS_AVG_OCCUPANCY,
  BUS_KM_PER_L,
  CHARGE_EFFICIENCY,
  DIESEL_B_KG_CO2_PER_L,
  DYNAMO_USB_EFFICIENCY,
  DYNAMO_W,
  GASOLINE_C_KG_CO2_PER_L,
  REST_MET,
  RIDE_HAILING_OVERHEAD,
} from "./constants";

export type ReplacedMode = "carro" | "app" | "moto" | "onibus";

export type Trip = {
  oneWayKm: number;
  daysPerWeek: number;
  mode: ReplacedMode;
  modeSpeedKmh: number;
  gasPrice: number;
  carKmPerL: number;
  motoKmPerL: number;
  parkingPerDay: number;
  busFare: number;
  appFarePerTrip: number;
};

export const weeklyKm = (t: Trip) => t.oneWayKm * 2 * t.daysPerWeek;

/** Minutos por dia (ida e volta) numa velocidade média. */
export const minutesPerDay = (oneWayKm: number, speedKmh: number) =>
  speedKmh > 0 ? ((oneWayKm * 2) / speedKmh) * 60 : 0;

const perKm = (kgPerL: number, kmPerL: number) => (kmPerL > 0 ? (kgPerL / kmPerL) * 1000 : 0);

/** g de CO₂ fóssil por km, por pessoa, no modal substituído. */
export function modeCO2gPerKm(t: Trip): number {
  switch (t.mode) {
    case "carro":
      return perKm(GASOLINE_C_KG_CO2_PER_L, t.carKmPerL);
    case "app":
      return perKm(GASOLINE_C_KG_CO2_PER_L, t.carKmPerL) * RIDE_HAILING_OVERHEAD;
    case "moto":
      return perKm(GASOLINE_C_KG_CO2_PER_L, t.motoKmPerL);
    case "onibus":
      return perKm(DIESEL_B_KG_CO2_PER_L, BUS_KM_PER_L) / BUS_AVG_OCCUPANCY;
  }
}

/** Gasto semanal (R$) com o modal substituído. */
export function modeWeeklyCost(t: Trip): number {
  const km = weeklyKm(t);
  const fuel = (kmPerL: number) => (kmPerL > 0 ? (km / kmPerL) * t.gasPrice : 0);
  switch (t.mode) {
    case "carro":
      return fuel(t.carKmPerL) + t.parkingPerDay * t.daysPerWeek;
    case "moto":
      return fuel(t.motoKmPerL) + t.parkingPerDay * t.daysPerWeek;
    case "onibus":
      return t.busFare * 2 * t.daysPerWeek;
    case "app":
      return t.appFarePerTrip * 2 * t.daysPerWeek;
  }
}

/** kcal gastas acima do repouso. */
export const extraKcal = (met: number, bodyKg: number, hours: number) =>
  Math.max(0, met - REST_MET) * bodyKg * hours;

/** Energia de um dínamo de cubo entregue ao celular, em Wh. */
export const dynamoWh = (rideHours: number) => DYNAMO_W * DYNAMO_USB_EFFICIENCY * rideHours;

export type Electric = {
  whPerKm: number;
  batteryWh: number;
  kwhPrice: number;
  gridGPerKwh: number;
};

export function electricWeekly(km: number, e: Electric) {
  const batteryWh = km * e.whPerKm;
  const gridKwh = batteryWh / CHARGE_EFFICIENCY / 1000;
  return {
    gridKwh,
    cost: gridKwh * e.kwhPrice,
    co2g: gridKwh * e.gridGPerKwh,
    charges: e.batteryWh > 0 ? batteryWh / e.batteryWh : 0,
    rangeKm: e.whPerKm > 0 ? e.batteryWh / e.whPerKm : 0,
  };
}
