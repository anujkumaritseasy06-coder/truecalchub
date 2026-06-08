"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';

export function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [loanYears, setLoanYears] = useState<string>('');
  const [loanMonths, setLoanMonths] = useState<string>('');
  const [extraPayment, setExtraPayment] = useState<string>('');

  const {
    monthlyPayment,
    totalInterest,
    totalCost,
    payoffMonths,
    interestSavings,
    monthsSaved,
    error
  } = useMemo(() => {
    const P = parseFloat(loanAmount);
    const R = parseFloat(interestRate);
    const Y = parseInt(loanYears) || 0;
    const M = parseInt(loanMonths) || 0;
    const E = parseFloat(extraPayment) || 0;

    if (isNaN(P) || isNaN(R) || (isNaN(Y) && isNaN(M))) {
      return { monthlyPayment: 0, totalInterest: 0, totalCost: 0, payoffMonths: 0, interestSavings: 0, monthsSaved: 0, error: 'Please enter valid numerical values.' };
    }

    if (P <= 0 || P > 100000000) return { error: 'Loan amount must be between $1 and $100,000,000.', monthlyPayment: 0, totalInterest: 0, totalCost: 0, payoffMonths: 0, interestSavings: 0, monthsSaved: 0 };
    if (R < 0 || R > 100) return { error: 'Interest rate must be between 0% and 100%.', monthlyPayment: 0, totalInterest: 0, totalCost: 0, payoffMonths: 0, interestSavings: 0, monthsSaved: 0 };
    
    const n = (Y * 12) + M;
    if (n <= 0 || n > 1200) return { error: 'Total loan term must be between 1 month and 100 years.', monthlyPayment: 0, totalInterest: 0, totalCost: 0, payoffMonths: 0, interestSavings: 0, monthsSaved: 0 };
    if (E < 0 || E > 1000000) return { error: 'Invalid extra monthly payment.', monthlyPayment: 0, totalInterest: 0, totalCost: 0, payoffMonths: 0, interestSavings: 0, monthsSaved: 0 };

    const r = R / 100 / 12;

    // Standard Monthly Payment (Without Extra)
    let baseM = 0;
    if (r === 0) {
      baseM = P / n;
    } else {
      baseM = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const standardTotalInterest = (baseM * n) - P;

    // Calculate Amortization with Extra Payments
    let balance = P;
    let actualMonths = 0;
    let actualInterest = 0;
    const actualMonthlyPayment = baseM + E;

    // Safety brake for infinite loops
    let safetyCounter = 0;
    
    if (r === 0) {
      // 0% interest logic
      actualMonths = Math.ceil(P / actualMonthlyPayment);
      actualInterest = 0;
    } else {
      while (balance > 0 && safetyCounter < 1200) {
        const interestForMonth = balance * r;
        actualInterest += interestForMonth;
        
        let principalPaid = actualMonthlyPayment - interestForMonth;
        
        if (principalPaid > balance) {
          principalPaid = balance; // Final payment
        }
        
        balance -= principalPaid;
        actualMonths++;
        safetyCounter++;
      }
    }

    // If payment is so small it doesn't cover interest
    if (safetyCounter >= 1200 && balance > 0) {
      return { error: 'Your payment does not cover the monthly interest. The loan will never be paid off.', monthlyPayment: 0, totalInterest: 0, totalCost: 0, payoffMonths: 0, interestSavings: 0, monthsSaved: 0 };
    }

    const tSavings = Math.max(0, standardTotalInterest - actualInterest);
    const mSaved = Math.max(0, n - actualMonths);

    return {
      monthlyPayment: actualMonthlyPayment,
      totalInterest: actualInterest,
      totalCost: P + actualInterest,
      payoffMonths: actualMonths,
      interestSavings: tSavings,
      monthsSaved: mSaved,
      error: null,
    };
  }, [loanAmount, interestRate, loanYears, loanMonths, extraPayment]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // Generate payoff date
  const generateDate = (monthsAhead: number) => {
    if (monthsAhead === 0) return "N/A";
    const date = new Date();
    date.setMonth(date.getMonth() + monthsAhead);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

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
              placeholder="20000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (APR)</Label>
            <NumberInput 
              id="interestRate"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              min="0"
              max="100"
              step="0.1"
              suffixNode={<span className="font-medium">%</span>}
              placeholder="8.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="loanYears">Loan Term (Years)</Label>
              <NumberInput 
                id="loanYears"
                value={loanYears}
                onChange={(e) => setLoanYears(e.target.value)}
                min="0"
                max="100"
                step="1"
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanMonths">Loan Term (Months)</Label>
              <NumberInput 
                id="loanMonths"
                value={loanMonths}
                onChange={(e) => setLoanMonths(e.target.value)}
                min="0"
                max="11"
                step="1"
                placeholder="0"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-6 mb-4">
            <h3 className="font-medium text-foreground mb-4">Accelerate Payoff (Optional)</h3>
            <div className="space-y-2">
              <Label htmlFor="extraPayment">Extra Monthly Payment</Label>
              <NumberInput 
                id="extraPayment"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
                min="0"
                max="1000000"
                step="50"
                prefixNode={<span className="font-medium text-sm">$</span>}
                placeholder="0"
              />
              <p className="text-xs text-secondary-500 mt-1">
                Adding extra to your principal reduces interest and shortens the loan.
              </p>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 flex flex-col justify-center bg-secondary-50/50 dark:bg-secondary-900/10 p-6 sm:p-8 rounded-2xl border border-border">
          <ResultDisplay 
            label="Monthly Payment"
            value={formatCurrency(monthlyPayment)}
            className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm"
          />
          
          <div className="space-y-3 px-1 mb-8">
            <SecondaryResultDisplay 
              label="Total Interest Paid" 
              value={formatCurrency(totalInterest)} 
            />
            <SecondaryResultDisplay 
              label="Total Cost of Loan" 
              value={formatCurrency(totalCost)} 
            />
            <SecondaryResultDisplay 
              label="Estimated Payoff Date" 
              value={generateDate(payoffMonths)} 
            />
          </div>

          {(interestSavings > 0 || monthsSaved > 0) && (
            <div className="pt-6 border-t border-emerald-200 dark:border-emerald-900/50 space-y-3 px-1">
              <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wide">
                Extra Payment Impact
              </h4>
              <SecondaryResultDisplay 
                label="Interest Savings" 
                value={formatCurrency(interestSavings)} 
                valueClassName="text-emerald-600 dark:text-emerald-400 font-bold"
              />
              <SecondaryResultDisplay 
                label="Time Saved" 
                value={`${Math.floor(monthsSaved / 12)} yrs, ${monthsSaved % 12} mos`} 
                valueClassName="text-emerald-600 dark:text-emerald-400 font-bold"
              />
            </div>
          )}
        </div>
      </div>
    </CalculatorWrapper>
  );
}
