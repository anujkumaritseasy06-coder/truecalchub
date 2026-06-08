"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';

export function APRCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [loanYears, setLoanYears] = useState<string>('');
  const [loanFees, setLoanFees] = useState<string>('');
  const [closingCosts, setClosingCosts] = useState<string>('');
  const [otherCharges, setOtherCharges] = useState<string>('');

  const {
    apr,
    monthlyPayment,
    totalFees,
    totalInterest,
    totalCost,
    effectiveBorrowingCost,
    error
  } = useMemo(() => {
    const P = parseFloat(loanAmount);
    const R = parseFloat(interestRate);
    const Y = parseFloat(loanYears);
    const F = parseFloat(loanFees) || 0;
    const C = parseFloat(closingCosts) || 0;
    const O = parseFloat(otherCharges) || 0;

    if (isNaN(P) || isNaN(R) || isNaN(Y)) {
      return { apr: 0, monthlyPayment: 0, totalFees: 0, totalInterest: 0, totalCost: 0, effectiveBorrowingCost: 0, error: 'Please enter valid numerical values.' };
    }

    if (P <= 0 || P > 100000000) return { error: 'Loan amount must be between $1 and $100,000,000.', apr: 0, monthlyPayment: 0, totalFees: 0, totalInterest: 0, totalCost: 0, effectiveBorrowingCost: 0 };
    if (R < 0 || R > 100) return { error: 'Interest rate must be between 0% and 100%.', apr: 0, monthlyPayment: 0, totalFees: 0, totalInterest: 0, totalCost: 0, effectiveBorrowingCost: 0 };
    if (Y <= 0 || Y > 100) return { error: 'Loan term must be between 1 and 100 years.', apr: 0, monthlyPayment: 0, totalFees: 0, totalInterest: 0, totalCost: 0, effectiveBorrowingCost: 0 };
    
    const totalFeesCalc = F + C + O;
    if (totalFeesCalc < 0 || totalFeesCalc >= P) return { error: 'Total fees cannot be negative or greater than the loan amount.', apr: 0, monthlyPayment: 0, totalFees: 0, totalInterest: 0, totalCost: 0, effectiveBorrowingCost: 0 };

    const n = Y * 12;
    const r = R / 100 / 12;

    // Standard Monthly Payment (based on nominal rate)
    let baseM = 0;
    if (r === 0) {
      baseM = P / n;
    } else {
      baseM = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const tInterest = (baseM * n) - P;
    const tCost = (baseM * n) + totalFeesCalc;
    const effectiveCost = tInterest + totalFeesCalc;

    // Calculate APR using Binary Search
    // We need to find the monthly rate 'apr_r' where the PV of payments equals the adjusted loan amount.
    const adjustedLoanAmount = P - totalFeesCalc;
    let aprResult = R;

    if (totalFeesCalc === 0) {
      aprResult = R;
    } else if (baseM > 0 && adjustedLoanAmount > 0) {
      let low = 0;
      let high = 1; // 100% monthly rate as upper bound (extremely high)
      let mid = 0;
      
      for (let i = 0; i < 100; i++) { // Max 100 iterations for precision
        mid = (low + high) / 2;
        
        // PV = M * [ (1 - (1 + mid)^-n) / mid ]
        let pv = 0;
        if (mid === 0) {
          pv = baseM * n;
        } else {
          pv = baseM * ((1 - Math.pow(1 + mid, -n)) / mid);
        }

        if (pv > adjustedLoanAmount) {
          // PV is too high, meaning the discount rate (mid) is too low
          low = mid;
        } else {
          // PV is too low, meaning the discount rate is too high
          high = mid;
        }
      }
      
      aprResult = mid * 12 * 100;
    }

    return {
      apr: aprResult,
      monthlyPayment: baseM,
      totalFees: totalFeesCalc,
      totalInterest: tInterest > 0 ? tInterest : 0,
      totalCost: tCost,
      effectiveBorrowingCost: effectiveCost,
      error: null,
    };
  }, [loanAmount, interestRate, loanYears, loanFees, closingCosts, otherCharges]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <NumberInput 
              id="loanAmount"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              min="1"
              max="100000000"
              step="100"
              prefixNode={<span className="font-medium">$</span>}
              placeholder="250000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="interestRate">Nominal Interest Rate</Label>
              <NumberInput 
                id="interestRate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                min="0"
                max="100"
                step="0.1"
                suffixNode={<span className="font-medium">%</span>}
                placeholder="6.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanYears">Loan Term (Years)</Label>
              <NumberInput 
                id="loanYears"
                value={loanYears}
                onChange={(e) => setLoanYears(e.target.value)}
                min="1"
                max="100"
                step="1"
                placeholder="30"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-6 mb-4">
            <h3 className="font-medium text-foreground mb-4">Fees & Closing Costs</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loanFees">Origination & Loan Fees</Label>
                <NumberInput 
                  id="loanFees"
                  value={loanFees}
                  onChange={(e) => setLoanFees(e.target.value)}
                  min="0"
                  max="1000000"
                  step="100"
                  prefixNode={<span className="font-medium text-sm">$</span>}
                  placeholder="1500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="closingCosts">Closing Costs</Label>
                  <NumberInput 
                    id="closingCosts"
                    value={closingCosts}
                    onChange={(e) => setClosingCosts(e.target.value)}
                    min="0"
                    max="1000000"
                    step="100"
                    prefixNode={<span className="font-medium text-sm">$</span>}
                    placeholder="3500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherCharges">Other Finance Charges</Label>
                  <NumberInput 
                    id="otherCharges"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(e.target.value)}
                    min="0"
                    max="1000000"
                    step="100"
                    prefixNode={<span className="font-medium text-sm">$</span>}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 flex flex-col justify-center bg-secondary-50/50 dark:bg-secondary-900/10 p-6 sm:p-8 rounded-2xl border border-border">
          <ResultDisplay 
            label="True APR"
            value={apr.toFixed(3) + '%'}
            className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm"
          />
          
          <div className="space-y-3 px-1 mb-8">
            <SecondaryResultDisplay 
              label="Standard Monthly Payment" 
              value={formatCurrency(monthlyPayment)} 
            />
            <SecondaryResultDisplay 
              label="Total Fees Rolled In" 
              value={formatCurrency(totalFees)} 
            />
          </div>

          <div className="pt-6 border-t border-border space-y-3 px-1">
            <SecondaryResultDisplay 
              label="Total Interest" 
              value={formatCurrency(totalInterest)} 
            />
            <SecondaryResultDisplay 
              label="Effective Borrowing Cost" 
              value={formatCurrency(effectiveBorrowingCost)} 
            />
            <SecondaryResultDisplay 
              label="Total Cost of Loan" 
              value={formatCurrency(totalCost)} 
              valueClassName="font-bold text-foreground"
            />
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
}
