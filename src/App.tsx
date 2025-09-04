import {
  BatteryCharging,
  Bike,
  Bus,
  Calculator,
  Car,
  ChevronDown,
  Coffee,
  DollarSign,
  Gamepad2,
  Heart,
  HelpCircle,
  Leaf,
  Lightbulb,
  MapPin,
  Share2,
  Smartphone,
  TreePine,
  TrendingUp,
  Users,
  Volume2,
  Wind,
  Zap
} from "lucide-react";
import React, { useMemo, useState } from "react";

function App() {
  // Estados existentes
  const [oneWayKm, setOneWayKm] = useState(7.2);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState(18);
  const [phoneCapacityWh, setPhoneCapacityWh] = useState(12);
  const [fastChargePowerW, setFastChargePowerW] = useState(20);
  const [dynamoPowerW, setDynamoPowerW] = useState(3);
  const [dynamoSystemEff, setDynamoSystemEff] = useState(0.6);
  const [riderSustainableW, setRiderSustainableW] = useState(120);
  const [genSystemEff, setGenSystemEff] = useState(0.7);
  const [mode, setMode] = useState("carro");
  const [gridCI, setGridCI] = useState(100);
  const [riderMassKg, setRiderMassKg] = useState(75);
  const [metabolicEfficiency, setMetabolicEfficiency] = useState(0.25);

  // Novos estados
  const [activeTab, setActiveTab] = useState("individual");
  const [isPeakHour, setIsPeakHour] = useState(true);
  const [parkingCostPerDay, setParkingCostPerDay] = useState(20);
  const [gasPrice, setGasPrice] = useState(5.5);
  const [carConsumption, setCarConsumption] = useState(12); // km/l

  const modeFactors: Record<string, number> = {
    carro: 180,
    moto: 100,
    onibus: 80,
    app: 200,
  };

  // Tooltips com fontes
  const tooltips: Record<string, string> = {
    carro: "Carro 180 g CO₂/km → Fonte: Inventário de emissões CET/SP 2023",
    moto: "Moto 100 g CO₂/km → Fonte: IPCC Guidelines 2019",
    onibus: "Ônibus 80 g CO₂/km por passageiro → Fonte: SPTrans 2023",
    app: "Carro por app 200 g CO₂/km → Fonte: Estudo mobilidade urbana USP 2023",
    dynamo: "Dínamo 3W @ 60% eficiência → Fonte: Shimano DH-3N80 specs",
    roller: "Rolo 120W @ 70% eficiência → Fonte: Tacx Neo 2T measurements",
    metabolism: "Eficiência metabólica 25% → Fonte: Sports Medicine Journal 2020"
  };

  // Cálculos existentes
  const twoWayKm = useMemo(() => oneWayKm * 2, [oneWayKm]);
  const weeklyKm = useMemo(() => twoWayKm * daysPerWeek, [twoWayKm, daysPerWeek]);
  const timePerDayHours = useMemo(() => twoWayKm / Math.max(5, avgSpeedKmh), [twoWayKm, avgSpeedKmh]);
  const weeklyRideHours = useMemo(() => timePerDayHours * daysPerWeek, [timePerDayHours, daysPerWeek]);
  const weeklyDynamoWh = useMemo(() => dynamoPowerW * weeklyRideHours * dynamoSystemEff, [dynamoPowerW, weeklyRideHours, dynamoSystemEff]);
  const timeToFullPhoneOnDynamoHours = useMemo(() => (phoneCapacityWh / Math.max(0.1, dynamoPowerW * dynamoSystemEff)), [phoneCapacityWh, dynamoPowerW, dynamoSystemEff]);
  const netGenW = useMemo(() => riderSustainableW * genSystemEff, [riderSustainableW, genSystemEff]);
  const timeToFullPhoneOnRollerHours = useMemo(() => phoneCapacityWh / Math.max(1, netGenW), [phoneCapacityWh, netGenW]);
  const avoidedCO2gPerWeek = useMemo(() => weeklyKm * (modeFactors[mode] || 0), [weeklyKm, mode]);
  const avoidedCO2kgPerWeek = useMemo(() => avoidedCO2gPerWeek / 1000, [avoidedCO2gPerWeek]);
  const weeklyMechJ = useMemo(() => riderSustainableW * weeklyRideHours * 3600, [riderSustainableW, weeklyRideHours]);
  const weeklyMetabolicJ = useMemo(() => weeklyMechJ / Math.max(0.05, metabolicEfficiency), [weeklyMechJ, metabolicEfficiency]);
  const weeklyKcal = useMemo(() => weeklyMetabolicJ / 4184, [weeklyMetabolicJ]);

  // Novos cálculos
  const carSpeedInPeak = isPeakHour ? 12 : 25; // km/h
  const bikeSpeed = 18; // km/h (mais estável)
  const carTimeHours = useMemo(() => twoWayKm / carSpeedInPeak, [twoWayKm, carSpeedInPeak]);
  const bikeTimeHours = useMemo(() => twoWayKm / bikeSpeed, [twoWayKm]);
  const timeSavedMinutes = useMemo(() => (carTimeHours - bikeTimeHours) * 60, [carTimeHours, bikeTimeHours]);

  // Economia financeira
  const weeklyGasCost = useMemo(() => (weeklyKm / carConsumption) * gasPrice, [weeklyKm, carConsumption, gasPrice]);
  const weeklyParkingCost = useMemo(() => parkingCostPerDay * daysPerWeek, [parkingCostPerDay, daysPerWeek]);
  const monthlyCarCost = useMemo(() => (weeklyGasCost + weeklyParkingCost) * 4.33, [weeklyGasCost, weeklyParkingCost]);

  // Comparações lúdicas
  const foodComparisons = useMemo(() => ({
    paoFrances: weeklyKcal / 280,
    paoQueijo: weeklyKcal / 120,
    coxinha: weeklyKcal / 250,
    cafeExpresso: weeklyKcal / 5
  }), [weeklyKcal]);

  const energyComparisons = useMemo(() => ({
    phoneHours: weeklyDynamoWh / 4,
    ledHours: weeklyDynamoWh / 10,
    gamepadHours: weeklyDynamoWh / 5
  }), [weeklyDynamoWh]);

  // Poluição evitada
  const pollutionAvoided = useMemo(() => ({
    nox: weeklyKm * 0.5, // g NOx/km
    pm25: weeklyKm * 0.02, // g PM2.5/km
    co: weeklyKm * 2.1 // g CO/km
  }), [weeklyKm]);

  // Espaço ocupado
  const spaceOccupied = useMemo(() => ({
    car: weeklyKm * 10, // m² por km
    bike: weeklyKm * 2 // m² por km
  }), [weeklyKm]);

  const fmt = (x: number, digits = 2) => Number.isFinite(x) ? x.toFixed(digits) : "-";

  // Componente Tooltip
  const Tooltip = ({ content, children }: { content: string; children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onClick={() => setIsVisible(!isVisible)}
          className="cursor-help"
        >
          {children}
        </div>
        {isVisible && (
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    );
  };

  // Componente Select customizado
  const CustomSelect = ({ value, onValueChange, options, placeholder }: {
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left bg-white border-2 border-green-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:outline-none transition-all duration-200 flex items-center justify-between hover:border-green-300"
        >
          <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border-2 border-green-200 rounded-xl shadow-xl">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-green-50 first:rounded-t-xl last:rounded-b-xl transition-colors duration-150"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Componente Slider customizado
  const CustomSlider = ({ value, onChange, min, max, step }: {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
  }) => {
    return (
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${((value - min) / (max - min)) * 100}%, #bbf7d0 ${((value - min) / (max - min)) * 100}%, #bbf7d0 100%)`
          }}
        />
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #059669;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
          }
          .slider::-webkit-slider-thumb:hover {
            background: #047857;
            transform: scale(1.1);
          }
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #059669;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    );
  };

  // Função de compartilhamento
  const shareResults = () => {
    const text = `🚴‍♂️ Meus resultados do pedal:\n\n💚 CO₂ evitado: ${fmt(avoidedCO2kgPerWeek)} kg/semana\n⚡ Energia gerada: ${fmt(weeklyDynamoWh)} Wh/semana\n💰 Economia: R$ ${fmt(monthlyCarCost)}/mês\n🔥 Calorias: ${fmt(weeklyKcal)} kcal/semana\n\nCalcule o seu impacto: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Calculadora do Pedal',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Resultados copiados para a área de transferência!');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 text-gray-800">
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-emerald-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-200/20 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-40 right-1/3 w-56 h-56 bg-green-300/10 rounded-full blur-xl animate-pulse delay-1500"></div>
      </div>

      <div className="relative z-10 p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 py-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <Bike className="w-12 h-12 text-emerald-600 animate-bounce" />
                <Leaf className="w-6 h-6 text-green-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-emerald-400 to-green-600"></div>
              <TreePine className="w-10 h-10 text-green-600 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 bg-clip-text text-transparent">
              Calculadora do Pedal
            </h1>
            <p className="text-xl md:text-2xl text-green-700 font-medium">
              Energia, Sustentabilidade & Impacto Social
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-green-500 mx-auto rounded-full"></div>
          </div>

          {/* Inputs Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-green-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Calculator className="w-6 h-6 text-emerald-600" />
              Configurações do Trajeto
            </h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Trajeto */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Trajeto
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Distância (ida), km
                      <Tooltip content="Distância em linha reta ou rota preferida">
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                      </Tooltip>
                    </label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={oneWayKm} 
                      onChange={e=>setOneWayKm(parseFloat(e.target.value)||0)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dias/semana</label>
                    <input 
                      type="number" 
                      value={daysPerWeek} 
                      onChange={e=>setDaysPerWeek(parseInt(e.target.value)||0)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Velocidade bike (km/h)</label>
                    <input 
                      type="number" 
                      value={avgSpeedKmh} 
                      onChange={e=>setAvgSpeedKmh(parseFloat(e.target.value)||0)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Modal substituído
                      <Tooltip content={tooltips[mode]}>
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                      </Tooltip>
                    </label>
                    <CustomSelect 
                      value={mode} 
                      onValueChange={setMode}
                      options={[
                        { value: "carro", label: "🚗 Carro" },
                        { value: "moto", label: "🏍️ Moto" },
                        { value: "onibus", label: "🚌 Ônibus" },
                        { value: "app", label: "📱 Carro por app" }
                      ]}
                      placeholder="Escolha"
                    />
                  </div>
                </div>
              </div>

              {/* Energia */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2">
                  <BatteryCharging className="w-5 h-5 text-blue-600" />
                  Energia
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Capacidade telefone (Wh)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={phoneCapacityWh} 
                      onChange={e=>setPhoneCapacityWh(parseFloat(e.target.value)||0)}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Dínamo (W)
                      <Tooltip content={tooltips.dynamo}>
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                      </Tooltip>
                    </label>
                    <input 
                      type="number" 
                      value={dynamoPowerW} 
                      onChange={e=>setDynamoPowerW(parseFloat(e.target.value)||0)}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Eficiência dínamo</label>
                    <CustomSlider 
                      value={Math.round(dynamoSystemEff*100)} 
                      onChange={v=>setDynamoSystemEff(v/100)} 
                      max={90} 
                      min={30} 
                      step={1}
                    />
                    <div className="text-sm text-blue-600 font-medium">{fmt(dynamoSystemEff*100,0)}%</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Potência no rolo (W)
                      <Tooltip content={tooltips.roller}>
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                      </Tooltip>
                    </label>
                    <input 
                      type="number" 
                      value={riderSustainableW} 
                      onChange={e=>setRiderSustainableW(parseFloat(e.target.value)||0)}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Financeiro */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Financeiro
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Preço gasolina (R$/L)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={gasPrice} 
                      onChange={e=>setGasPrice(parseFloat(e.target.value)||0)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Consumo carro (km/L)</label>
                    <input 
                      type="number" 
                      value={carConsumption} 
                      onChange={e=>setCarConsumption(parseFloat(e.target.value)||0)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Estacionamento (R$/dia)</label>
                    <input 
                      type="number" 
                      value={parkingCostPerDay} 
                      onChange={e=>setParkingCostPerDay(parseFloat(e.target.value)||0)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="peakHour"
                      checked={isPeakHour} 
                      onChange={e=>setIsPeakHour(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-2 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="peakHour" className="text-sm font-medium text-gray-700">
                      Horário de pico (6-9h, 17-19h)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
            {[
              { id: 'individual', label: 'Impacto Individual', icon: Calculator },
              { id: 'ambiental', label: 'Impacto Ambiental', icon: Leaf },
              { id: 'coletivo', label: 'Impacto Coletivo', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/80'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'individual' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Energia & Tempo */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl border-0 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                <div className="p-8 space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Zap className="w-5 h-5 text-amber-600"/>
                    </div>
                    Energia & Tempo
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                      <span className="text-sm text-gray-700">Energia/semana:</span>
                      <span className="font-bold text-amber-700">{fmt(weeklyDynamoWh)} Wh</span>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl">
                      <div className="text-sm text-gray-700 mb-2">Equivale a:</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-blue-500" />
                          <span>{fmt(energyComparisons.phoneHours)} horas de celular</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          <span>{fmt(energyComparisons.ledHours)} horas de LED 10W</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4 text-purple-500" />
                          <span>{fmt(energyComparisons.gamepadHours)} horas de controle</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                      <span className="text-sm text-gray-700">Tempo bike vs carro:</span>
                      <span className="font-bold text-amber-700">
                        {timeSavedMinutes > 0 ? `+${fmt(Math.abs(timeSavedMinutes))} min` : `-${fmt(Math.abs(timeSavedMinutes))} min`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calorias */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 shadow-xl border-0 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-rose-400 to-pink-500"></div>
                <div className="p-8 space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-rose-100 rounded-xl">
                      <Wind className="w-5 h-5 text-rose-600"/>
                    </div>
                    Calorias Queimadas
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/60 rounded-xl">
                      <div className="text-2xl font-bold text-rose-700 mb-2">{fmt(weeklyKcal,0)} kcal/semana</div>
                      <div className="text-sm text-gray-600">Equivale a:</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-white/40 rounded-lg">
                        <span className="flex items-center gap-2">
                          🥖 Pão francês
                        </span>
                        <span className="font-semibold">{fmt(foodComparisons.paoFrances,1)} unidades</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/40 rounded-lg">
                        <span className="flex items-center gap-2">
                          🧀 Pão de queijo
                        </span>
                        <span className="font-semibold">{fmt(foodComparisons.paoQueijo,1)} unidades</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/40 rounded-lg">
                        <span className="flex items-center gap-2">
                          🍗 Coxinha
                        </span>
                        <span className="font-semibold">{fmt(foodComparisons.coxinha,1)} unidades</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/40 rounded-lg">
                        <span className="flex items-center gap-2">
                          ☕ Café expresso
                        </span>
                        <span className="font-semibold">{fmt(foodComparisons.cafeExpresso,0)} xícaras</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Economia */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl border-0 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                <div className="p-8 space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <DollarSign className="w-5 h-5 text-green-600"/>
                    </div>
                    Economia Financeira
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/60 rounded-xl">
                      <div className="text-2xl font-bold text-green-700 mb-1">R$ {fmt(monthlyCarCost)}</div>
                      <div className="text-sm text-gray-600">economizados por mês</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-white/40 rounded-lg">
                        <span>⛽ Gasolina/semana:</span>
                        <span className="font-semibold">R$ {fmt(weeklyGasCost)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/40 rounded-lg">
                        <span>🅿️ Estacionamento/semana:</span>
                        <span className="font-semibold">R$ {fmt(weeklyParkingCost)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/40 rounded-lg">
                        <span>📅 Economia anual:</span>
                        <span className="font-semibold text-green-700">R$ {fmt(monthlyCarCost * 12)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ambiental' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* CO2 */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 shadow-xl border-0 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-emerald-400 to-green-500"></div>
                <div className="p-8 space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <Leaf className="w-5 h-5 text-emerald-600"/>
                    </div>
                    CO₂ Evitado
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/60 rounded-xl">
                      <div className="text-2xl font-bold text-emerald-700 mb-1">{fmt(avoidedCO2kgPerWeek)} kg</div>
                      <div className="text-sm text-gray-600">por semana</div>
                    </div>
                    <div className="p-4 bg-white/60 rounded-xl flex items-center gap-3">
                      <TreePine className="w-8 h-8 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-700">Equivalente em árvores</div>
                        <div className="text-xl font-bold text-green-700">{fmt(avoidedCO2kgPerWeek / (20/52))}</div>
                        <div className="text-xs text-gray-500">por semana</div>
                      </div>
                    </div>
                    <div className="p-3 bg-white/40 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1">Anual:</div>
                      <div className="font-bold text-emerald-700">{fmt(avoidedCO2kgPerWeek * 52)} kg CO₂</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qualidade do Ar */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl border-0 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                <div className="p-8 space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Wind className="w-5 h-5 text-blue-600"/>
                    </div>
                    Qualidade do Ar
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-700">Poluentes evitados/semana:</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="text-sm">NOx (óxidos de nitrogênio):</span>
                        <span className="font-bold text-blue-700">{fmt(pollutionAvoided.nox)} g</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="text-sm">PM2.5 (material particulado):</span>
                        <span className="font-bold text-blue-700">{fmt(pollutionAvoided.pm25)} g</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="text-sm">CO (monóxido de carbono):</span>
                        <span className="font-bold text-blue-700">{fmt(pollutionAvoided.co)} g</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ruído */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 shadow-xl border-0 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
                <div className="p-8 space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Volume2 className="w-5 h-5 text-purple-600"/>
                    </div>
                    Poluição Sonora
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/60 rounded-xl">
                      <div className="text-sm text-gray-700 mb-2">Níveis de ruído:</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm">
                            <Car className="w-4 h-4" />
                            Carro (50 km/h)
                          </span>
                          <span className="font-bold text-red-600">70 dB</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm">
                            <Bike className="w-4 h-4" />
                            Bicicleta
                          </span>
                          <span className="font-bold text-green-600">40 dB</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white/40 rounded-xl">
                      <div className="text-sm text-gray-600">Redução de ruído:</div>
                      <div className="text-xl font-bold text-purple-700">-30 dB</div>
                      <div className="text-xs text-gray-500">Muito mais silencioso!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coletivo' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Espaço Urbano */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 shadow-xl border-0 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-teal-400 to-cyan-500"></div>
                <div className="p-8 space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-teal-100 rounded-xl">
                      <MapPin className="w-5 h-5 text-teal-600"/>
                    </div>
                    Espaço Urbano
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/60 rounded-xl">
                      <div className="text-sm text-gray-700 mb-2">Espaço ocupado/semana:</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-red-500" />
                            Carro
                          </span>
                          <span className="font-bold text-red-600">{fmt(spaceOccupied.car)} m²</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Bike className="w-4 h-4 text-green-500" />
                            Bicicleta
                          </span>
                          <span className="font-bold text-green-600">{fmt(spaceOccupied.bike)} m²</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white/40 rounded-xl">
                      <div className="text-sm text-gray-600">Espaço liberado:</div>
                      <div className="text-xl font-bold text-teal-700">{fmt(spaceOccupied.car - spaceOccupied.bike)} m²</div>
                      <div className="text-xs text-gray-500">por semana</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparativo Modal */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 shadow-xl border-0 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>
                <div className="p-8 space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-orange-100 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-orange-600"/>
                    </div>
                    Comparativo por Passageiro
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-700 mb-2">Emissões CO₂ (g/km/pessoa):</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          Carro (1 pessoa)
                        </span>
                        <span className="font-bold text-red-600">180 g</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="flex items-center gap-2">
                          <Bus className="w-4 h-4" />
                          Ônibus (40 pessoas)
                        </span>
                        <span className="font-bold text-yellow-600">35 g</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="flex items-center gap-2">
                          <Bike className="w-4 h-4" />
                          Bicicleta
                        </span>
                        <span className="font-bold text-green-600">0 g</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white/40 rounded-xl">
                      <div className="text-sm text-gray-600">Sua contribuição:</div>
                      <div className="text-lg font-bold text-orange-700">-1 carro nas ruas</div>
                      <div className="text-xs text-gray-500">Menos trânsito para todos!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share Button */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={shareResults}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Share2 className="w-5 h-5" />
                Compartilhar Resultados
              </button>
              
              <a
                href="https://buymeacoffee.com/gabrielserignolli"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Coffee className="w-5 h-5" />
                <Heart className="w-4 h-4" />
                Apoiar o Projeto
              </a>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Convide alguém para vir de bike também! 🚴‍♂️🌱
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Gostou da calculadora? Ajude a manter o projeto ativo! ☕
            </p>
          </div>

          {/* Footer */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400"></div>
            <div className="p-8 space-y-4">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Calculator className="w-5 h-5 text-purple-600"/>
                </div>
                Metodologia & Fontes
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Emissões CO₂: Inventário CET/SP 2023, IPCC Guidelines 2019</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Dínamo: Shimano DH-3N80 specs, eficiência 60% após regulação USB</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Poluentes: EPA emission factors, adaptados para frota brasileira</span>
                  </li>
                </ul>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Velocidades SP: CET 2023 - pico 12 km/h, normal 25 km/h</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Ruído: WHO Guidelines, medições urbanas típicas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Espaço: Manual de desenho urbano ITDP Brasil</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;