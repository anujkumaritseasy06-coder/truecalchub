export type PayType = 'hourly' | 'salary';
export type OvertimeRate = 1.5 | 2.0 | 2.5;

export interface OvertimeSettings {
  payType: PayType;
  baseRateOrSalary: number;
  regularHours: number;
  overtimeHours: number;
  overtimeMultiplier: OvertimeRate;
  
  // Advanced Feature: True Wage Estimator
  commuteHoursPerWeek?: number;
  workExpensesPerWeek?: number; // Gas, tolls, uniforms, tools
}

export interface PaycheckBreakdown {
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  estimatedTaxes: number;
  netPay: number;
}

export interface TrueWageMetrics {
  totalHoursInvested: number; // Work + Commute
  totalNetEarnings: number;   // Net Pay - Expenses
  trueHourlyWage: number;     // Total Net / Total Hours Invested
  wageDifferencePercentage: number;
}

export interface OvertimeResult {
  effectiveHourlyRate: number;
  paycheck: PaycheckBreakdown;
  trueWage?: TrueWageMetrics;
}

export function calculateOvertime(settings: OvertimeSettings): OvertimeResult {
  const { 
    payType, 
    baseRateOrSalary, 
    regularHours, 
    overtimeHours, 
    overtimeMultiplier,
    commuteHoursPerWeek,
    workExpensesPerWeek
  } = settings;

  // 1. Determine Effective Hourly Rate
  let effectiveHourlyRate = 0;
  if (payType === 'hourly') {
    effectiveHourlyRate = baseRateOrSalary;
  } else {
    // Standard FLSA calculation: Annual Salary / 52 weeks / 40 hours
    effectiveHourlyRate = baseRateOrSalary / 52 / 40;
  }

  // 2. Calculate Gross Pay Components
  const regularPay = effectiveHourlyRate * regularHours;
  const overtimeRate = effectiveHourlyRate * overtimeMultiplier;
  const overtimePay = overtimeRate * overtimeHours;
  const grossPay = regularPay + overtimePay;

  // 3. Estimate Taxes (Simplified Progressive Bracket Estimation for Net Pay)
  // We project the weekly gross to annual to find the effective tax rate
  const projectedAnnualGross = grossPay * 52;
  let effectiveTaxRate = 0;

  if (projectedAnnualGross > 200000) effectiveTaxRate = 0.32;
  else if (projectedAnnualGross > 100000) effectiveTaxRate = 0.24;
  else if (projectedAnnualGross > 60000) effectiveTaxRate = 0.20;
  else if (projectedAnnualGross > 30000) effectiveTaxRate = 0.15;
  else effectiveTaxRate = 0.10;

  // FICA (Social Security + Medicare) is flat 7.65%
  const ficaRate = 0.0765;
  const totalTaxRate = effectiveTaxRate + ficaRate;

  const estimatedTaxes = grossPay * totalTaxRate;
  const netPay = grossPay - estimatedTaxes;

  const paycheck: PaycheckBreakdown = {
    regularPay,
    overtimePay,
    grossPay,
    estimatedTaxes,
    netPay,
  };

  // 4. Calculate Advanced "True Wage"
  let trueWage: TrueWageMetrics | undefined = undefined;

  if ((commuteHoursPerWeek !== undefined && commuteHoursPerWeek > 0) || 
      (workExpensesPerWeek !== undefined && workExpensesPerWeek > 0)) {
    
    const commute = commuteHoursPerWeek || 0;
    const expenses = workExpensesPerWeek || 0;

    const totalHoursInvested = regularHours + overtimeHours + commute;
    const totalNetEarnings = netPay - expenses;

    let trueHourlyWage = 0;
    if (totalHoursInvested > 0) {
      trueHourlyWage = Math.max(0, totalNetEarnings / totalHoursInvested);
    }

    // Compare True Wage to stated Effective Hourly Rate
    // E.g., if you make $20/hr gross, but true net is $12/hr, that's a -40% drop
    const wageDifferencePercentage = effectiveHourlyRate > 0 
      ? ((trueHourlyWage - effectiveHourlyRate) / effectiveHourlyRate) * 100 
      : 0;

    trueWage = {
      totalHoursInvested,
      totalNetEarnings,
      trueHourlyWage,
      wageDifferencePercentage
    };
  }

  return {
    effectiveHourlyRate,
    paycheck,
    trueWage
  };
}
