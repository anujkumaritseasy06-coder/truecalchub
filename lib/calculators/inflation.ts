export type InflationMode = 'historical' | 'investment';
export type CurrencyRegion = 'usd' | 'gbp';

export interface InflationSettings {
  mode: InflationMode;
  region: CurrencyRegion;
  initialAmount: number;
  
  // Historical Mode Inputs
  startYear?: number;
  endYear?: number;
  
  // Forward/Investment Mode Inputs
  yearsToProject?: number;
  expectedInflationRate?: number;
  expectedInvestmentReturn?: number; // Nominal return
}

export interface HistoricalResult {
  equivalentValue: number;
  cumulativeInflationPercent: number;
  averageAnnualInflation: number;
  purchasingPowerLossPercent: number;
}

export interface InvestmentResult {
  futureNominalValue: number; // The actual dollar amount you will have
  futureRealValue: number;    // What those dollars will actually buy in today's money
  realRateOfReturn: number;
  purchasingPowerLossPercent: number;
  costOfWaitingAmount: number; // If you delayed a purchase of 'initialAmount' by X years at expected inflation
}

export interface AdvancedMetrics {
  yearsToHalvePurchasingPower: number; // Rule of 72
}

export interface InflationCalculationOutput {
  historical?: HistoricalResult;
  investment?: InvestmentResult;
  advanced: AdvancedMetrics;
}

// A simplified historical average inflation table for demonstration.
// In a true production app, this would query a massive database of monthly CPI indices.
// For this enterprise calculator, we will use accepted historical averages:
// 1913-2023 US Average is roughly 3.1%. UK is roughly 3.5%.
const APPROX_HISTORICAL_AVERAGE = {
  usd: 0.031, // 3.1% average over the last century
  gbp: 0.035, // 3.5% average
};

export function calculateInflation(settings: InflationSettings): InflationCalculationOutput {
  const { 
    mode, 
    region, 
    initialAmount, 
    startYear, 
    endYear, 
    yearsToProject, 
    expectedInflationRate, 
    expectedInvestmentReturn 
  } = settings;

  let output: InflationCalculationOutput = {
    advanced: { yearsToHalvePurchasingPower: 0 }
  };

  let activeInflationRate = 0;

  if (mode === 'historical' && startYear && endYear) {
    const years = Math.abs(endYear - startYear);
    // In a real app we'd map exact years. Here we use the historical average for the math demonstration.
    activeInflationRate = APPROX_HISTORICAL_AVERAGE[region];
    
    // Compounding formula: FV = PV * (1 + r)^n
    const equivalentValue = initialAmount * Math.pow(1 + activeInflationRate, years);
    
    const cumulativeInflationPercent = ((equivalentValue - initialAmount) / initialAmount) * 100;
    
    // Purchasing power loss is the inverse: 1 - (PV/FV)
    const purchasingPowerLossPercent = (1 - (initialAmount / equivalentValue)) * 100;

    output.historical = {
      equivalentValue,
      cumulativeInflationPercent,
      averageAnnualInflation: activeInflationRate * 100,
      purchasingPowerLossPercent
    };
  } 
  
  if (mode === 'investment' && yearsToProject && expectedInflationRate !== undefined) {
    activeInflationRate = expectedInflationRate / 100; // Convert 3% to 0.03
    const nominalReturnRate = (expectedInvestmentReturn !== undefined ? expectedInvestmentReturn : 0) / 100;
    const years = yearsToProject;

    // 1. Future Nominal Value (How many bills you physically hold)
    const futureNominalValue = initialAmount * Math.pow(1 + nominalReturnRate, years);

    // 2. Future Real Value (Discount the nominal value back by inflation)
    const futureRealValue = futureNominalValue / Math.pow(1 + activeInflationRate, years);

    // 3. Real Rate of Return (Fisher Equation approximation: Nominal - Inflation)
    // More accurate Fisher: (1 + Nominal) / (1 + Inflation) - 1
    const realRateOfReturn = ((1 + nominalReturnRate) / (1 + activeInflationRate)) - 1;

    // 4. Purchasing Power Depreciation (If you just held cash under a mattress)
    const mattressValue = initialAmount / Math.pow(1 + activeInflationRate, years);
    const purchasingPowerLossPercent = (1 - (mattressValue / initialAmount)) * 100;

    // 5. Cost of Waiting (How much more a $10k car will cost in X years)
    const costOfWaitingAmount = (initialAmount * Math.pow(1 + activeInflationRate, years)) - initialAmount;

    output.investment = {
      futureNominalValue,
      futureRealValue,
      realRateOfReturn: realRateOfReturn * 100,
      purchasingPowerLossPercent,
      costOfWaitingAmount
    };
  }

  // ADVANCED FEATURE: Rule of 72 for Purchasing Power
  // How many years until your money buys exactly half of what it buys today?
  if (activeInflationRate > 0) {
    output.advanced.yearsToHalvePurchasingPower = 72 / (activeInflationRate * 100);
  }

  return output;
}
