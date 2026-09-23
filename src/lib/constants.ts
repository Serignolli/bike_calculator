// Fatores usados nos cálculos. Cada valor tem a fonte ao lado; a lista
// exibida no rodapé fica em SOURCES, no fim do arquivo.

// --- Combustíveis (CO₂ fóssil no escapamento) ---
// Gasolina A: densidade 0,742 kg/L e PCI 10.400 kcal/kg (BEN/EPE) → 32,3 MJ/L,
// fator IPCC 2006 de 69,3 g CO₂/MJ → 2,24 kg CO₂/L.
const GASOLINE_A_KG_CO2_PER_L = 2.24;
// Diesel A: 0,840 kg/L e 10.100 kcal/kg (BEN/EPE) → 35,5 MJ/L × 74,1 g/MJ → 2,63 kg/L.
const DIESEL_A_KG_CO2_PER_L = 2.63;
// Mistura obrigatória desde 01/08/2025 (CNPE): gasolina E30 e diesel B15.
// A parcela de etanol/biodiesel é biogênica e não entra na conta de CO₂ fóssil.
export const GASOLINE_C_KG_CO2_PER_L = GASOLINE_A_KG_CO2_PER_L * 0.7;
export const DIESEL_B_KG_CO2_PER_L = DIESEL_A_KG_CO2_PER_L * 0.85;

// Ônibus urbano a diesel: ~2 km/L e ~28 passageiros em média ao longo da viagem.
// É uma estimativa: a lotação real muda muito por linha e horário.
export const BUS_KM_PER_L = 2;
export const BUS_AVG_OCCUPANCY = 28;

// Carro por app: viagens não compartilhadas emitem ~47% a mais que a mesma
// viagem em carro próprio, por causa dos km rodados vazio (UCS, 2020).
export const RIDE_HAILING_OVERHEAD = 1.47;

// --- Eletricidade ---
// Fator médio do SIN em 2023: 0,0385 t CO₂/MWh = 38,5 g/kWh (MCTI).
export const GRID_G_CO2_PER_KWH = 38.5;
// Perdas do carregador + bateria numa recarga típica.
export const CHARGE_EFFICIENCY = 0.85;

// --- Gasto energético (2024 Adult Compendium of Physical Activities) ---
export const MET = {
  bike: 6.8, // 01011 – bicicleta, ida/volta do trabalho, ritmo próprio
  ebikeLow: 6.0, // 01084 – e-bike com assistência leve
  ebikeHigh: 4.0, // 01088 – e-bike com assistência alta
};
// 1 MET ≈ 1 kcal/kg/h. Descontamos 1 MET (o repouso) para mostrar só o gasto extra.
export const REST_MET = 1;

// Alimentos (TACO/Unicamp, kcal por 100 g × peso típico da unidade).
export const FOODS = [
  { name: "Pão francês", unit: "50 g", kcal: 150 }, // 300 kcal/100 g
  { name: "Pão de queijo", unit: "30 g", kcal: 109 }, // 363 kcal/100 g
  { name: "Coxinha", unit: "80 g", kcal: 226 }, // 283 kcal/100 g
];

// Árvore urbana plantada e crescendo por 10 anos sequestra ~60 kg de CO₂ (EPA).
export const TREE_KG_CO2_10Y = 60;

// Dínamo de cubo: padrão 6 V / 3 W (ex.: Shimano DH-3N80). Carregador USB ~60%.
export const DYNAMO_W = 3;
export const DYNAMO_USB_EFFICIENCY = 0.6;

// Valores típicos de mercado para preencher os campos; cada um ajusta pelo próprio veículo.
export type ElectricKind = "ebike" | "emoto";
export const ELECTRIC_PRESETS: Record<ElectricKind, { speed: number; whPerKm: number; batteryWh: number }> = {
  ebike: { speed: 20, whPerKm: 12, batteryWh: 500 },
  emoto: { speed: 28, whPerKm: 40, batteryWh: 2000 },
};

export const WEEKS_PER_MONTH = 52 / 12;

export type Source = { label: string; detail: string; url: string };

export const SOURCES: Source[] = [
  {
    label: "Mistura E30 e B15",
    detail: "30% de etanol na gasolina e 15% de biodiesel no diesel desde 01/08/2025.",
    url: "https://www.gov.br/mme/pt-br/assuntos/noticias/e30-e-b15-entram-em-vigor-em-todo-o-brasil",
  },
  {
    label: "Fatores de CO₂ dos combustíveis",
    detail: "IPCC 2006 (vol. 2, cap. 3) com densidade e poder calorífico do Balanço Energético Nacional.",
    url: "https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol2.html",
  },
  {
    label: "Eletricidade do SIN",
    detail: "Fator médio de 0,0385 t CO₂/MWh em 2023 (MCTI). O valor varia a cada ano.",
    url: "https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/cgcl/paginas/fator-medio-inventarios-corporativos",
  },
  {
    label: "Carro por app",
    detail: "Union of Concerned Scientists, Ride-Hailing's Climate Risks (2020).",
    url: "https://www.ucs.org/resources/ride-hailing-climate-risks",
  },
  {
    label: "Calorias",
    detail: "2024 Adult Compendium of Physical Activities, códigos 01011, 01084 e 01088.",
    url: "https://pacompendium.com/bicycling/",
  },
  {
    label: "Alimentos",
    detail: "Tabela Brasileira de Composição de Alimentos (TACO), Unicamp.",
    url: "https://www.tabelatacoonline.com.br/tabela-nutricional/taco/pao-trigo-frances",
  },
  {
    label: "Árvores",
    detail: "EPA, Greenhouse Gas Equivalencies Calculator: 0,060 t CO₂ por árvore urbana em 10 anos.",
    url: "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references",
  },
  {
    label: "Preços de referência",
    detail: "Gasolina: levantamento semanal da ANP (média nacional ~R$ 6,50/L em 2026). Ônibus: tarifa SPTrans de R$ 5,30 (2026).",
    url: "https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas",
  },
  {
    label: "Velocidade do carro",
    detail: "A CET-SP mede cerca de 18–22 km/h nos horários de pico das vias principais.",
    url: "https://www.cetsp.com.br/",
  },
  {
    label: "Regras para elétricos",
    detail: "Resolução CONTRAN nº 996/2023: bicicleta elétrica, autopropelido e ciclomotor.",
    url: "https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9962023.pdf",
  },
];
