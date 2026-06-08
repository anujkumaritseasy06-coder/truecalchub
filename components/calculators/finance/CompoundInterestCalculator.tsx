"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const FREQUENCY_OPTIONS = [
  { label: 'Daily (365/yr)', value: 365 },
  { label: 'Monthly (12/yr)', value: 12 },
  { label: 'Quarterly (4/yr)', value: 4 },
  { label: 'Semi-Annually (2/yr)', value: 2 },
  { label: 'Annually (1/yr)', value: 1 },
];

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [years, setYears] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');

  const { finalAmount, totalInterest, growthPercentage, error } = useMemo(() => {
    const P = parseFloat(principal);
    const R = parseFloat(rate);
    const T = parseFloat(years);
    const N = parseInt(frequency, 10);

    if (isNaN(P) || isNaN(R) || isNaN(T) || isNaN(N)) {
      return { finalAmount: 0, totalInterest: 0, growthPercentage: 0, error: 'Please enter valid numerical values.' };
    }

    if (P < 0) return { finalAmount: 0, totalInterest: 0, growthPercentage: 0, error: 'Principal amount cannot be negative.' };
    if (P > 1000000000) return { finalAmount: 0, totalInterest: 0, growthPercentage: 0, error: 'Principal amount cannot exceed $1,000,000,000.' };
    if (R < 0) return { finalAmount: 0, totalInterest: 0, growthPercentage: 0, error: 'Interest rate cannot be negative.' };
    if (R > 100) return { finalAmount: 0, totalInterest: 0, growthPercentage: 0, error: 'Interest rate cannot exceed 100%.' };
    if (T < 0 || T > 100) return { finalAmount: 0, totalInterest: 0, growthPercentage: 0, error: 'Time period must be between 0 and 100 years.' };

    const r = R / 100;
    const A = P * Math.pow(1 + r / N, N * T);
    const interest = A - P;
    const growth = P > 0 ? (interest / P) * 100 : 0;

    return {
      finalAmount: A,
      totalInterest: interest,
      growthPercentage: growth,
      error: null,
    };
  }, [principal, rate, years, frequency]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatPercent = (val: number) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val) + '%';

  return (
    <CalculatorWrapper className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="principal">Initial Investment (Principal)</Label>
            <NumberInput 
              id="principal"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              min="0"
              max="1000000000"
              step="100"
              prefixNode={<span className="font-medium">$</span>}
              placeholder="10000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rate">Annual Interest Rate</Label>
              <NumberInput 
                id="rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                min="0"
                max="100"
                step="0.1"
                suffixNode={<span className="font-medium">%</span>}
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years">Time Period (Years)</Label>
              <NumberInput 
                id="years"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                min="0"
                max="100"
                step="1"
                placeholder="10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Compounding Frequency</Label>
            <Select 
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              options={FREQUENCY_OPTIONS}
            />
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <ResultDisplay 
            label="Final Balance"
            value={formatCurrency(finalAmount)}
            subValue={`After ${years || 0} years`}
            className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-100 dark:border-emerald-900"
          />
          
          <div className="space-y-2 px-2">
            <SecondaryResultDisplay 
              label="Total Principal" 
              value={formatCurrency(parseFloat(principal) || 0)} 
            />
            <SecondaryResultDisplay 
              label="Total Interest Earned" 
              value={<span className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(totalInterest)}</span>} 
            />
            <SecondaryResultDisplay 
              label="Total Growth" 
              value={<span className="text-emerald-600 dark:text-emerald-400">+{formatPercent(growthPercentage)}</span>} 
            />
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
}
