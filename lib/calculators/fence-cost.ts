export type FenceCostMaterial = 'pine' | 'cedar' | 'vinyl' | 'chain-link' | 'aluminum';
export type FenceCostHeight = '4' | '6' | '8';
export type FenceCostTerrain = 'flat' | 'sloped' | 'rocky';
export type FenceCostInstall = 'diy' | 'pro';

export interface CostRange {
  low: number;
  high: number;
}

export interface FenceCostResult {
  materialCost: CostRange;
  laborCost: CostRange;
  gateCost: CostRange;
  totalCost: CostRange;
}

export function calculateFenceCost(
  linearFeet: number,
  material: FenceCostMaterial,
  height: FenceCostHeight,
  gates: number,
  terrain: FenceCostTerrain,
  install: FenceCostInstall
): FenceCostResult {
  if (linearFeet <= 0 || isNaN(linearFeet)) {
    return {
      materialCost: { low: 0, high: 0 },
      laborCost: { low: 0, high: 0 },
      gateCost: { low: 0, high: 0 },
      totalCost: { low: 0, high: 0 }
    };
  }

  // Base Material Cost Per Linear Foot (Low - High)
  let matBaseLow = 0;
  let matBaseHigh = 0;

  switch (material) {
    case 'pine':
      matBaseLow = 12; matBaseHigh = 18; break;
    case 'cedar':
      matBaseLow = 18; matBaseHigh = 25; break;
    case 'vinyl':
      matBaseLow = 25; matBaseHigh = 35; break;
    case 'chain-link':
      matBaseLow = 8; matBaseHigh = 15; break;
    case 'aluminum':
      matBaseLow = 30; matBaseHigh = 45; break;
  }

  // Height Multiplier
  let heightMult = 1.0;
  if (height === '4') heightMult = 0.75;
  if (height === '8') heightMult = 1.40;

  // Calculate Materials
  const rawMatLow = linearFeet * (matBaseLow * heightMult);
  const rawMatHigh = linearFeet * (matBaseHigh * heightMult);

  // Gate Costs (Materials + Labor combined, usually flat rate per gate)
  let gateLow = 0;
  let gateHigh = 0;
  switch (material) {
    case 'pine': gateLow = 150; gateHigh = 250; break;
    case 'cedar': gateLow = 250; gateHigh = 400; break;
    case 'vinyl': gateLow = 300; gateHigh = 500; break;
    case 'chain-link': gateLow = 150; gateHigh = 250; break;
    case 'aluminum': gateLow = 400; gateHigh = 800; break;
  }
  const totalGateLow = gates * gateLow;
  const totalGateHigh = gates * gateHigh;

  // Labor Costs
  let laborLow = 0;
  let laborHigh = 0;

  if (install === 'pro') {
    // Pro labor is usually $15 to $30 per foot depending on material
    let laborBaseLow = 15;
    let laborBaseHigh = 25;

    if (material === 'vinyl' || material === 'aluminum') {
      laborBaseLow = 12; laborBaseHigh = 20; // Pre-assembled panels install faster
    }

    // Terrain Multipliers (Labor only)
    let terrainMult = 1.0;
    if (terrain === 'sloped') terrainMult = 1.25; // Stepping/racking takes longer
    if (terrain === 'rocky') terrainMult = 1.50; // Digging through rock is brutal

    laborLow = linearFeet * (laborBaseLow * terrainMult);
    laborHigh = linearFeet * (laborBaseHigh * terrainMult);
  }

  return {
    materialCost: { low: rawMatLow, high: rawMatHigh },
    laborCost: { low: laborLow, high: laborHigh },
    gateCost: { low: totalGateLow, high: totalGateHigh },
    totalCost: {
      low: rawMatLow + laborLow + totalGateLow,
      high: rawMatHigh + laborHigh + totalGateHigh
    }
  };
}
