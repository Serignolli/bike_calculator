# Calculadora do Pedal

Calcula o que muda quando você troca carro, carro por app, moto ou ônibus por uma bicicleta, comum ou elétrica:

- dinheiro economizado por semana, mês e ano
- CO₂ fóssil evitado, já descontada a energia da tomada nos elétricos
- tempo de viagem comparado ao meio de transporte atual
- calorias gastas, com equivalência em alimentos da tabela TACO
- custo de recarga, autonomia e regras do CONTRAN para bikes, scooters e motos elétricas
- energia de um dínamo de cubo para carregar o celular

Os fatores e as fontes ficam em [`src/lib/constants.ts`](src/lib/constants.ts) e as fórmulas em [`src/lib/calc.ts`](src/lib/calc.ts). A página também lista as fontes no rodapé.

## Rodando

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # checa os tipos e gera dist/
```

Feito com React, TypeScript e Vite.

## Apoio

[Buy Me a Coffee](https://buymeacoffee.com/gabrielserignolli)
