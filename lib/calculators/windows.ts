export type WindowScope = 'full' | 'glass' | 'screen';
export type WindowStyle = 'single_hung' | 'double_hung' | 'casement' | 'sliding' | 'picture' | 'bay_bow' | 'custom';
export type FrameMaterial = 'vinyl' | 'wood' | 'aluminum' | 'fiberglass' | 'composite';
export type GlassType = 'single' | 'double' | 'triple';

export interface WindowOptions {
  lowE: boolean;
  argonGas: boolean;
  tempered: boolean; // Required for large glass or bathrooms
}

export interface WindowSettings {
  scope: WindowScope;
  windowCount: number;
  style: WindowStyle;
  frameMaterial: FrameMaterial;
  glassType: GlassType;
  options: WindowOptions;
  customWidth?: number;  // inches
  customHeight?: number; // inches
  currentMonthlyEnergyBill: number; // For ROI calculation
  customMaterialCostPerWindow?: number; // Optional override
  customLaborCostPerWindow?: number; // Optional override
}

export interface CostEstimate {
  low: number;
  average: number;
  high: number;
}

export interface EnergyROI {
  estimatedAnnualSavings: number;
  paybackPeriodYears: number;
  efficiencyRating: 'Poor' | 'Average' | 'Excellent' | 'Maximum';
}

export interface WindowResult {
  materialCost: CostEstimate;
  laborCost: CostEstimate;
  totalCost: CostEstimate;
  energyROI?: EnergyROI;
}

// Industry Standard Base Costs (per window)
const STYLE_BASE_COSTS: Record<WindowStyle, number> = {
  single_hung: 250,
  double_hung: 350,
  casement: 450,
  sliding: 400,
  picture: 300,
  bay_bow: 1200,
  custom: 500,
};

const FRAME_MULTIPLIERS: Record<FrameMaterial, number> = {
  vinyl: 1.0,        // Baseline
  aluminum: 1.2,     // 20% more
  fiberglass: 1.5,   // 50% more
  composite: 1.6,    // 60% more
  wood: 2.0,         // 100% more (Premium)
};

const GLASS_MULTIPLIERS: Record<GlassType, number> = {
  single: 0.8,       // Obsolete, cheaper but bad
  double: 1.0,       // Baseline modern standard
  triple: 1.4,       // Premium energy efficiency
};

export function calculateWindowReplacement(settings: WindowSettings): WindowResult {
  const { scope, windowCount, style, frameMaterial, glassType, options, currentMonthlyEnergyBill } = settings;

  let baseMaterialPerWindow = 0;
  let baseLaborPerWindow = 0;

  if (scope === 'full') {
    // 1. Calculate Full Replacement
    const styleBase = STYLE_BASE_COSTS[style];
    const frameMult = FRAME_MULTIPLIERS[frameMaterial];
    const glassMult = GLASS_MULTIPLIERS[glassType];
    
    baseMaterialPerWindow = styleBase * frameMult * glassMult;
    
    // Add options
    if (options.lowE) baseMaterialPerWindow += 40;
    if (options.argonGas) baseMaterialPerWindow += 30;
    if (options.tempered) baseMaterialPerWindow += 75;

    // Standard labor per window for full replacement (retro-fit)
    baseLaborPerWindow = 150; // Average
    if (style === 'bay_bow') baseLaborPerWindow = 450; // Complex install

  } else if (scope === 'glass') {
    // 2. Glass-Only Replacement (IGU - Insulated Glass Unit)
    // Much cheaper than full frame, highly dependent on glass type
    baseMaterialPerWindow = 120 * GLASS_MULTIPLIERS[glassType];
    
    if (options.lowE) baseMaterialPerWindow += 25;
    if (options.argonGas) baseMaterialPerWindow += 20;
    if (options.tempered) baseMaterialPerWindow += 50;
    if (style === 'bay_bow' || style === 'picture') baseMaterialPerWindow *= 2; // Large custom glass

    baseLaborPerWindow = 100;

  } else if (scope === 'screen') {
    // 3. Screen-Only Replacement
    baseMaterialPerWindow = 25; // Standard fiberglass mesh and spline
    if (style === 'bay_bow') baseMaterialPerWindow = 75; // Multiple screens
    
    baseLaborPerWindow = 20; // Very fast
  }

  // Apply Custom Cost Overrides if provided by user
  if (settings.customMaterialCostPerWindow !== undefined && settings.customMaterialCostPerWindow > 0) {
    baseMaterialPerWindow = settings.customMaterialCostPerWindow;
  }
  if (settings.customLaborCostPerWindow !== undefined && settings.customLaborCostPerWindow > 0) {
    baseLaborPerWindow = settings.customLaborCostPerWindow;
  }

  // Calculate Ranges (Contractor Variations)
  // Low end: Discount materials / Handyman labor
  // High end: Premium brand (e.g. Andersen/Pella) / White-glove installation
  const materialLow = (baseMaterialPerWindow * 0.8) * windowCount;
  const materialAvg = baseMaterialPerWindow * windowCount;
  const materialHigh = (baseMaterialPerWindow * 1.5) * windowCount;

  const laborLow = (baseLaborPerWindow * 0.7) * windowCount;
  const laborAvg = baseLaborPerWindow * windowCount;
  const laborHigh = (baseLaborPerWindow * 1.6) * windowCount;

  const totalCost: CostEstimate = {
    low: materialLow + laborLow,
    average: materialAvg + laborAvg,
    high: materialHigh + laborHigh,
  };

  // ADVANCED FEATURE: Energy ROI Calculator
  // Only calculate for Full or Glass scopes where thermal envelope changes
  let energyROI: EnergyROI | undefined = undefined;

  if ((scope === 'full' || scope === 'glass') && currentMonthlyEnergyBill > 0) {
    let efficiencyScore = 0; // 0 to 10
    
    if (glassType === 'double') efficiencyScore += 4;
    if (glassType === 'triple') efficiencyScore += 7;
    if (options.lowE) efficiencyScore += 2;
    if (options.argonGas) efficiencyScore += 1;
    if (frameMaterial === 'fiberglass' || frameMaterial === 'vinyl') efficiencyScore += 1; // Better insulators than alum/wood
    if (frameMaterial === 'aluminum') efficiencyScore -= 2; // Thermal bridge

    // Calculate annual savings percentage based on efficiency score
    // Max savings usually caps around 20-25% of HVAC bill
    const maxSavingsPercentage = 0.22; 
    const savingsPercentage = Math.max(0, (efficiencyScore / 11) * maxSavingsPercentage);
    
    const annualEnergyBill = currentMonthlyEnergyBill * 12;
    const estimatedAnnualSavings = annualEnergyBill * savingsPercentage;

    let paybackPeriodYears = 0;
    if (estimatedAnnualSavings > 0) {
      paybackPeriodYears = totalCost.average / estimatedAnnualSavings;
    }

    let rating: EnergyROI['efficiencyRating'] = 'Poor';
    if (efficiencyScore >= 9) rating = 'Maximum';
    else if (efficiencyScore >= 6) rating = 'Excellent';
    else if (efficiencyScore >= 3) rating = 'Average';

    energyROI = {
      estimatedAnnualSavings,
      paybackPeriodYears: paybackPeriodYears === 0 ? 999 : paybackPeriodYears,
      efficiencyRating: rating
    };
  }

  return {
    materialCost: { low: materialLow, average: materialAvg, high: materialHigh },
    laborCost: { low: laborLow, average: laborAvg, high: laborHigh },
    totalCost,
    energyROI
  };
}
