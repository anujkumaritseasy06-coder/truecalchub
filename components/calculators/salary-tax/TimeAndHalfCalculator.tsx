"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  calculateOvertime, 
  PayType,
  OvertimeRate
} from '@/lib/calculators/salary';
import { Clock, DollarSign, Calculator, Briefcase, Car, AlertCircle } from 'lucide-react';

export function TimeAndHalfCalculator() {
  const [payType, setPayType] = useState<PayType>('hourly');
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<OvertimeRate>(1.5);
  
  // Empty states as requested
  const [baseRate, setBaseRate] = useState<string>('');
  const [regularHours, setRegularHours] = useState<string>('');
  const [overtimeHours, setOvertimeHours] = useState<string>('');
  
  // Advanced True Wage Inputs
  const [commuteHours, setCommuteHours] = useState<string>('');
  const [workExpenses, setWorkExpenses] = useState<string>('');

  const { results, error } = useMemo(() => {
    const rate = parseFloat(baseRate);
    const regHrs = parseFloat(regularHours);
    const otHrs = parseFloat(overtimeHours) || 0;
    
    const commute = parseFloat(commuteHours) || undefined;
    const expenses = parseFloat(workExpenses) || undefined;

    if (!baseRate && !regularHours) {
      return { results: null, error: null }; // Initial empty state
    }

    if (isNaN(rate) || rate <= 0) {
      return { results: null, error: 'Please enter a valid base pay rate or salary.' };
    }
    
    if (isNaN(regHrs) || regHrs < 0) {
      return { results: null, error: 'Please enter valid regular hours.' };
    }

    const outputs = calculateOvertime({
      payType,
      baseRateOrSalary: rate,
      regularHours: regHrs,
      overtimeHours: otHrs,
      overtimeMultiplier,
      commuteHoursPerWeek: commute,
      workExpensesPerWeek: expenses
    });

    return { results: outputs, error: null };
  }, [baseRate, regularHours, overtimeHours, payType, overtimeMultiplier, commuteHours, workExpenses]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <CalculatorWrapper className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-6 space-y-8">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary-500" />
              Base Compensation
            </h3>
            
            <div className="flex bg-secondary-100 dark:bg-secondary-900 rounded-lg p-1">
              <button
                onClick={() => setPayType('hourly')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  payType === 'hourly' ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
                }`}
              >
                Hourly Employee
              </button>
              <button
                onClick={() => setPayType('salary')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  payType === 'salary' ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
                }`}
              >
                Salaried Employee
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{payType === 'hourly' ? 'Base Hourly Rate' : 'Annual Salary'}</Label>
                <NumberInput 
                  value={baseRate} 
                  onChange={(e) => setBaseRate(e.target.value)} 
                  min="0" 
                  placeholder={payType === 'hourly' ? 'e.g. 25.50' : 'e.g. 65000'} 
                  prefixNode={<span>$</span>} 
                  className="text-lg" 
                />
              </div>
              <div className="space-y-2">
                <Label>Overtime Multiplier</Label>
                <select
                  className="flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  value={overtimeMultiplier}
                  onChange={(e) => setOvertimeMultiplier(parseFloat(e.target.value) as OvertimeRate)}
                >
                  <option value={1.5}>Time and a Half (1.5x) - Standard FLSA</option>
                  <option value={2.0}>Double Time (2.0x) - Holidays/Sundays</option>
                  <option value={2.5}>Double Time & a Half (2.5x) - Premium Holiday</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Hours Worked (Per Pay Period)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-blue-900 dark:text-blue-200">Regular Hours</Label>
                <NumberInput 
                  value={regularHours} 
                  onChange={(e) => setRegularHours(e.target.value)} 
                  min="0" 
                  placeholder="e.g. 40" 
                  suffixNode={<span className="text-blue-600">hrs</span>} 
                  className="border-blue-200 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-900 dark:text-blue-200">Overtime Hours</Label>
                <NumberInput 
                  value={overtimeHours} 
                  onChange={(e) => setOvertimeHours(e.target.value)} 
                  min="0" 
                  placeholder="e.g. 12" 
                  suffixNode={<span className="text-blue-600">hrs</span>} 
                  className="border-blue-200 focus-visible:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 shadow-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Car className="w-5 h-5 text-slate-500" />
                Advanced: True Hourly Wage Estimator
              </h3>
              <p className="text-xs text-slate-500">Calculate your actual net wage by factoring in unpaid commute time and job-related expenses.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Commute (Hours/Period)</Label>
                <NumberInput 
                  value={commuteHours} 
                  onChange={(e) => setCommuteHours(e.target.value)} 
                  min="0" 
                  placeholder="e.g. 5" 
                  suffixNode={<span className="text-slate-500">hrs</span>} 
                />
              </div>
              <div className="space-y-2">
                <Label>Work Expenses (Gas, Tools, etc.)</Label>
                <NumberInput 
                  value={workExpenses} 
                  onChange={(e) => setWorkExpenses(e.target.value)} 
                  min="0" 
                  placeholder="e.g. 60" 
                  prefixNode={<span className="text-slate-500">$</span>} 
                />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-6 space-y-6">
          {!results ? (
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px] shadow-sm">
              <div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-6">
                <Calculator className="w-10 h-10 text-secondary-400" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">Awaiting Payroll Data</h3>
              <p className="text-secondary-500 max-w-sm mx-auto">
                Enter your wage and hours to generate a precise breakdown of your gross pay, overtime premiums, and estimated tax withholdings.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-gradient-to-br from-blue-700 to-indigo-800 dark:from-blue-900 dark:to-indigo-950 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary-500 opacity-20 blur-3xl rounded-full"></div>
                <h3 className="text-blue-200 font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-300" />
                  Estimated Net Take-Home Pay
                </h3>
                <div className="text-5xl font-bold tracking-tight mb-3">
                  {formatCurrency(results.paycheck.netPay)}
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-800/50 rounded-lg px-3 py-1.5 border border-blue-700/50">
                    <p className="text-blue-200 text-xs font-medium">Gross Pay: <span className="text-white">{formatCurrency(results.paycheck.grossPay)}</span></p>
                  </div>
                  <div className="bg-blue-800/50 rounded-lg px-3 py-1.5 border border-blue-700/50">
                    <p className="text-blue-200 text-xs font-medium">Est. Taxes: <span className="text-rose-300">-{formatCurrency(results.paycheck.estimatedTaxes)}</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-5">Paycheck Breakdown</h3>
                
                {/* Visual Bar */}
                <div className="w-full h-4 rounded-full flex overflow-hidden mb-6 bg-secondary-100">
                  <div className="bg-emerald-500" style={{ width: `${(results.paycheck.regularPay / results.paycheck.grossPay) * 100}%` }}></div>
                  {results.paycheck.overtimePay > 0 && (
                    <div className="bg-amber-500" style={{ width: `${(results.paycheck.overtimePay / results.paycheck.grossPay) * 100}%` }}></div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="font-medium text-foreground">Regular Pay ({parseFloat(regularHours)} hrs @ {formatCurrency(results.effectiveHourlyRate)}/hr)</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(results.paycheck.regularPay)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="font-medium text-foreground">Overtime Premium ({parseFloat(overtimeHours || '0')} hrs @ {formatCurrency(results.effectiveHourlyRate * overtimeMultiplier)}/hr)</span>
                    </div>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(results.paycheck.overtimePay)}</span>
                  </div>
                </div>
              </div>

              {/* ADVANCED FEATURE: True Wage Dashboard */}
              {results.trueWage && (
                <div className="bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 p-6 rounded-2xl border border-rose-200 dark:border-rose-800/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertCircle className="w-24 h-24 text-rose-500" />
                  </div>
                  
                  <h3 className="text-sm font-bold text-rose-800 dark:text-rose-200 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    True Net Hourly Wage
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-rose-100 dark:border-rose-800/50">
                      <p className="text-xs font-medium text-rose-700 dark:text-rose-400 mb-1">Stated Gross Wage</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(results.effectiveHourlyRate)}/hr</p>
                    </div>
                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-rose-100 dark:border-rose-800/50">
                      <p className="text-xs font-medium text-rose-700 dark:text-rose-400 mb-1">True Net Wage</p>
                      <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{formatCurrency(results.trueWage.trueHourlyWage)}/hr</p>
                    </div>
                  </div>

                  <div className="bg-rose-600 dark:bg-rose-700 rounded-xl p-4 flex justify-between items-center shadow-inner">
                    <span className="text-rose-50 font-medium">Hidden Wage Depreciation:</span>
                    <span className="text-xl font-bold text-white">{results.trueWage.wageDifferencePercentage.toFixed(1)}%</span>
                  </div>
                  
                  <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-3">
                    *Your True Wage calculates your actual take-home pay divided by the total hours invested (Work + Commute), minus job-related expenses. 
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </CalculatorWrapper>
  );
}
