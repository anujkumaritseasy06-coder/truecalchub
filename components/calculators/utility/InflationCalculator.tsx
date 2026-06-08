"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { 
  calculateInflation, 
  InflationMode,
  CurrencyRegion
} from '@/lib/calculators/inflation';
import { TrendingDown, TrendingUp, DollarSign, PoundSterling, Clock, AlertTriangle } from 'lucide-react';

export function InflationCalculator() {
  const [mode, setMode] = useState<InflationMode>('investment');
  const [region, setRegion] = useState<CurrencyRegion>('usd');
  
  // Empty states as requested
  const [initialAmount, setInitialAmount] = useState<string>('');
  
  // Historical Inputs
  const [startYear, setStartYear] = useState<string>('');
  const [endYear, setEndYear] = useState<string>('');
  
  // Investment Inputs
  const [yearsToProject, setYearsToProject] = useState<string>('');
  const [expectedInflationRate, setExpectedInflationRate] = useState<string>('');
  const [expectedInvestmentReturn, setExpectedInvestmentReturn] = useState<string>('');

  const { results, error } = useMemo(() => {
    const amount = parseFloat(initialAmount);
    
    if (!initialAmount) return { results: null, error: null };
    if (isNaN(amount) || amount <= 0) return { results: null, error: 'Please enter a valid starting amount.' };

    if (mode === 'historical') {
      const start = parseInt(startYear);
      const end = parseInt(endYear);
      if (!startYear || !endYear) return { results: null, error: null };
      if (isNaN(start) || isNaN(end) || start > end) return { results: null, error: 'Please enter valid chronological years.' };
      
      return {
        results: calculateInflation({
          mode, region, initialAmount: amount, startYear: start, endYear: end
        }),
        error: null
      };
    } else {
      const years = parseInt(yearsToProject);
      const inflation = parseFloat(expectedInflationRate);
      const invReturn = parseFloat(expectedInvestmentReturn) || 0; // Optional, defaults to 0 if left blank

      if (!yearsToProject || !expectedInflationRate) return { results: null, error: null };
      if (isNaN(years) || years <= 0) return { results: null, error: 'Please enter valid projection years.' };
      if (isNaN(inflation)) return { results: null, error: 'Please enter expected inflation rate.' };

      return {
        results: calculateInflation({
          mode, region, initialAmount: amount, yearsToProject: years, expectedInflationRate: inflation, expectedInvestmentReturn: invReturn
        }),
        error: null
      };
    }
  }, [initialAmount, mode, region, startYear, endYear, yearsToProject, expectedInflationRate, expectedInvestmentReturn]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(region === 'usd' ? 'en-US' : 'en-GB', { 
      style: 'currency', 
      currency: region === 'usd' ? 'USD' : 'GBP',
      maximumFractionDigits: 0
    }).format(val);

  const CurrencyIcon = region === 'usd' ? DollarSign : PoundSterling;

  return (
    <CalculatorWrapper className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setRegion('usd')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                  region === 'usd' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500/50' : 'bg-secondary-100 dark:bg-secondary-900 text-secondary-600 hover:text-foreground'
                }`}
              >
                <DollarSign className="w-4 h-4" /> United States (USD)
              </button>
              <button
                onClick={() => setRegion('gbp')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                  region === 'gbp' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500/50' : 'bg-secondary-100 dark:bg-secondary-900 text-secondary-600 hover:text-foreground'
                }`}
              >
                <PoundSterling className="w-4 h-4" /> United Kingdom (GBP)
              </button>
            </div>

            <div className="flex bg-secondary-100 dark:bg-secondary-900 rounded-lg p-1">
              <button
                onClick={() => setMode('investment')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'investment' ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
                }`}
              >
                Investment Projections
              </button>
              <button
                onClick={() => setMode('historical')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'historical' ? 'bg-white dark:bg-secondary-800 text-foreground shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:text-foreground'
                }`}
              >
                Historical Inflation
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 shadow-sm">
            <div className="space-y-3">
              <Label className="text-base">Starting Amount</Label>
              <NumberInput 
                value={initialAmount} 
                onChange={(e) => setInitialAmount(e.target.value)} 
                min="0" 
                placeholder="e.g. 10000" 
                prefixNode={<CurrencyIcon className="w-4 h-4 text-slate-500" />}
                className="text-lg" 
              />
            </div>

            {mode === 'historical' ? (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>Start Year</Label>
                  <NumberInput 
                    value={startYear} 
                    onChange={(e) => setStartYear(e.target.value)} 
                    placeholder="e.g. 1990" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Year</Label>
                  <NumberInput 
                    value={endYear} 
                    onChange={(e) => setEndYear(e.target.value)} 
                    placeholder="e.g. 2024" 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>Years to Project</Label>
                  <NumberInput 
                    value={yearsToProject} 
                    onChange={(e) => setYearsToProject(e.target.value)} 
                    placeholder="e.g. 10" 
                    suffixNode={<span className="text-slate-500">years</span>} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expected Inflation Rate</Label>
                    <NumberInput 
                      value={expectedInflationRate} 
                      onChange={(e) => setExpectedInflationRate(e.target.value)} 
                      placeholder="e.g. 3.5" 
                      suffixNode={<span className="text-slate-500">%</span>} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-700 dark:text-emerald-400">Inv. Return Rate (Optional)</Label>
                    <NumberInput 
                      value={expectedInvestmentReturn} 
                      onChange={(e) => setExpectedInvestmentReturn(e.target.value)} 
                      placeholder="e.g. 8.0" 
                      suffixNode={<span className="text-slate-500">%</span>} 
                      className="border-emerald-200 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-6 space-y-6">
          {!results ? (
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px] shadow-sm">
              <div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-6">
                <TrendingDown className="w-10 h-10 text-secondary-400" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">Awaiting Economic Data</h3>
              <p className="text-secondary-500 max-w-sm mx-auto">
                Enter your starting amount and time horizon to see exactly how inflation erodes purchasing power over time.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {mode === 'historical' && results.historical && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                  <h3 className="text-slate-300 font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-400" />
                    Equivalent Purchasing Power
                  </h3>
                  <div className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                    {formatCurrency(results.historical.equivalentValue)}
                  </div>
                  <p className="text-slate-300 text-sm">
                    {formatCurrency(parseFloat(initialAmount))} in {startYear} has the same buying power as {formatCurrency(results.historical.equivalentValue)} in {endYear}.
                  </p>
                </div>
              )}

              {mode === 'investment' && results.investment && (
                <div className="bg-gradient-to-br from-emerald-800 to-teal-900 dark:from-emerald-950 dark:to-teal-950 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500 opacity-20 blur-3xl rounded-full"></div>
                  <h3 className="text-emerald-200 font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Future Real Value (Purchasing Power)
                  </h3>
                  <div className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                    {formatCurrency(results.investment.futureRealValue)}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="bg-emerald-900/50 rounded-lg px-3 py-2 border border-emerald-700/50">
                      <p className="text-emerald-200 text-xs font-medium mb-1">Nominal Output (Paper Wealth)</p>
                      <p className="text-white font-bold">{formatCurrency(results.investment.futureNominalValue)}</p>
                    </div>
                    <div className="bg-emerald-900/50 rounded-lg px-3 py-2 border border-emerald-700/50">
                      <p className="text-emerald-200 text-xs font-medium mb-1">Real Rate of Return</p>
                      <p className={`font-bold ${results.investment.realRateOfReturn >= 0 ? 'text-white' : 'text-rose-300'}`}>
                        {results.investment.realRateOfReturn.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ADVANCED FEATURE: Purchasing Power Depreciation Dashboard */}
              <div className="bg-rose-50/50 dark:bg-rose-950/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <AlertTriangle className="w-24 h-24 text-rose-500" />
                </div>
                
                <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  The Silent Tax (Depreciation)
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/80 dark:bg-black/30 p-4 rounded-xl border border-rose-100 dark:border-rose-800/50">
                    <p className="text-xs font-medium text-rose-700 dark:text-rose-400 mb-1">Loss of Purchasing Power</p>
                    <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                      -{mode === 'historical' ? results.historical?.purchasingPowerLossPercent.toFixed(1) : results.investment?.purchasingPowerLossPercent.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white/80 dark:bg-black/30 p-4 rounded-xl border border-rose-100 dark:border-rose-800/50">
                    <p className="text-xs font-medium text-rose-700 dark:text-rose-400 mb-1">Cost of Waiting</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {mode === 'historical' ? 'N/A' : `+${formatCurrency(results.investment?.costOfWaitingAmount || 0)}`}
                    </p>
                  </div>
                </div>

                {results.advanced.yearsToHalvePurchasingPower > 0 && (
                  <div className="bg-rose-600 dark:bg-rose-800 rounded-xl p-4 flex justify-between items-center shadow-inner">
                    <span className="text-rose-50 text-sm font-medium">Years until money loses 50% of its value (Rule of 72):</span>
                    <span className="text-xl font-bold text-white">{results.advanced.yearsToHalvePurchasingPower.toFixed(1)} yrs</span>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </CalculatorWrapper>
  );
}
