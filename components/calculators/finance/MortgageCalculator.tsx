"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';

export function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [loanTerm, setLoanTerm] = useState<string>('');
  const [propertyTax, setPropertyTax] = useState<string>('');
  const [homeInsurance, setHomeInsurance] = useState<string>('');
  const [hoaFees, setHoaFees] = useState<string>('');

  const {
    monthlyPayment,
    principalAndInterest,
    monthlyTax,
    monthlyInsurance,
    monthlyHoa,
    totalInterest,
    totalCostOfLoan,
    loanAmount,
    error
  } = useMemo(() => {
    const P_total = parseFloat(homePrice);
    const D = parseFloat(downPayment);
    const R = parseFloat(interestRate);
    const T = parseFloat(loanTerm);
    const Tax = parseFloat(propertyTax) || 0;
    const Ins = parseFloat(homeInsurance) || 0;
    const HOA = parseFloat(hoaFees) || 0;

    if (isNaN(P_total) || isNaN(D) || isNaN(R) || isNaN(T)) {
      return { monthlyPayment: 0, principalAndInterest: 0, monthlyTax: 0, monthlyInsurance: 0, monthlyHoa: 0, totalInterest: 0, totalCostOfLoan: 0, loanAmount: 0, error: 'Please enter valid numerical values.' };
    }

    if (P_total < 0 || P_total > 100000000) return { error: 'Home price must be between $0 and $100,000,000.', monthlyPayment: 0, principalAndInterest: 0, monthlyTax: 0, monthlyInsurance: 0, monthlyHoa: 0, totalInterest: 0, totalCostOfLoan: 0, loanAmount: 0 };
    if (D < 0 || D > P_total) return { error: 'Down payment cannot be negative or greater than the home price.', monthlyPayment: 0, principalAndInterest: 0, monthlyTax: 0, monthlyInsurance: 0, monthlyHoa: 0, totalInterest: 0, totalCostOfLoan: 0, loanAmount: 0 };
    if (R < 0 || R > 100) return { error: 'Interest rate must be between 0% and 100%.', monthlyPayment: 0, principalAndInterest: 0, monthlyTax: 0, monthlyInsurance: 0, monthlyHoa: 0, totalInterest: 0, totalCostOfLoan: 0, loanAmount: 0 };
    if (T <= 0 || T > 100) return { error: 'Loan term must be between 1 and 100 years.', monthlyPayment: 0, principalAndInterest: 0, monthlyTax: 0, monthlyInsurance: 0, monthlyHoa: 0, totalInterest: 0, totalCostOfLoan: 0, loanAmount: 0 };
    if (Tax < 0 || Tax > 1000000) return { error: 'Invalid annual property tax.', monthlyPayment: 0, principalAndInterest: 0, monthlyTax: 0, monthlyInsurance: 0, monthlyHoa: 0, totalInterest: 0, totalCostOfLoan: 0, loanAmount: 0 };
    if (Ins < 0 || Ins > 1000000) return { error: 'Invalid annual home insurance.', monthlyPayment: 0, principalAndInterest: 0, monthlyTax: 0, monthlyInsurance: 0, monthlyHoa: 0, totalInterest: 0, totalCostOfLoan: 0, loanAmount: 0 };
    if (HOA < 0 || HOA > 50000) return { error: 'Invalid monthly HOA fees.', monthlyPayment: 0, principalAndInterest: 0, monthlyTax: 0, monthlyInsurance: 0, monthlyHoa: 0, totalInterest: 0, totalCostOfLoan: 0, loanAmount: 0 };

    const L = P_total - D;
    const r = R / 100 / 12;
    const n = T * 12;

    // Monthly Principal & Interest
    let M_PI = 0;
    if (r === 0) {
      M_PI = L / n;
    } else {
      M_PI = L * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const mTax = Tax / 12;
    const mIns = Ins / 12;
    const mHoa = HOA;

    const totalMonthly = M_PI + mTax + mIns + mHoa;
    const tInterest = (M_PI * n) - L;
    const tCost = (M_PI * n) + D + (Tax * T) + (Ins * T) + (HOA * 12 * T);

    return {
      monthlyPayment: totalMonthly,
      principalAndInterest: M_PI,
      monthlyTax: mTax,
      monthlyInsurance: mIns,
      monthlyHoa: mHoa,
      totalInterest: tInterest > 0 ? tInterest : 0,
      totalCostOfLoan: M_PI * n,
      loanAmount: L,
      error: null,
    };
  }, [homePrice, downPayment, interestRate, loanTerm, propertyTax, homeInsurance, hoaFees]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="homePrice">Home Price</Label>
            <NumberInput 
              id="homePrice"
              value={homePrice}
              onChange={(e) => setHomePrice(e.target.value)}
              min="0"
              max="100000000"
              step="1000"
              prefixNode={<span className="font-medium">$</span>}
              placeholder="400000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="downPayment">Down Payment</Label>
            <NumberInput 
              id="downPayment"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              min="0"
              max={homePrice}
              step="1000"
              prefixNode={<span className="font-medium">$</span>}
              placeholder="80000"
            />
            <p className="text-xs text-secondary-500 text-right mt-1">
              Loan Amount: {formatCurrency(Math.max(0, parseFloat(homePrice) - parseFloat(downPayment)) || 0)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate</Label>
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
              <Label htmlFor="loanTerm">Loan Term (Years)</Label>
              <NumberInput 
                id="loanTerm"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                min="1"
                max="100"
                step="1"
                placeholder="30"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-6 mb-4">
            <h3 className="font-medium text-foreground mb-4">Additional Costs (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyTax">Annual Property Tax</Label>
                <NumberInput 
                  id="propertyTax"
                  value={propertyTax}
                  onChange={(e) => setPropertyTax(e.target.value)}
                  min="0"
                  max="1000000"
                  step="100"
                  prefixNode={<span className="font-medium text-sm">$</span>}
                  placeholder="4000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeInsurance">Annual Insurance</Label>
                <NumberInput 
                  id="homeInsurance"
                  value={homeInsurance}
                  onChange={(e) => setHomeInsurance(e.target.value)}
                  min="0"
                  max="1000000"
                  step="100"
                  prefixNode={<span className="font-medium text-sm">$</span>}
                  placeholder="1200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoaFees">Monthly HOA</Label>
                <NumberInput 
                  id="hoaFees"
                  value={hoaFees}
                  onChange={(e) => setHoaFees(e.target.value)}
                  min="0"
                  max="50000"
                  step="10"
                  prefixNode={<span className="font-medium text-sm">$</span>}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {error && <ValidationMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="lg:col-span-5 flex flex-col justify-center bg-secondary-50/50 dark:bg-secondary-900/10 p-6 sm:p-8 rounded-2xl border border-border">
          <ResultDisplay 
            label="Total Monthly Payment"
            value={formatCurrency(monthlyPayment)}
            className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm"
          />
          
          <div className="space-y-3 px-1 mb-8">
            <SecondaryResultDisplay 
              label="Principal & Interest" 
              value={formatCurrency(principalAndInterest)} 
            />
            {monthlyTax > 0 && (
              <SecondaryResultDisplay 
                label="Property Tax" 
                value={formatCurrency(monthlyTax)} 
              />
            )}
            {monthlyInsurance > 0 && (
              <SecondaryResultDisplay 
                label="Home Insurance" 
                value={formatCurrency(monthlyInsurance)} 
              />
            )}
            {monthlyHoa > 0 && (
              <SecondaryResultDisplay 
                label="HOA Fees" 
                value={formatCurrency(monthlyHoa)} 
              />
            )}
          </div>

          <div className="pt-6 border-t border-border space-y-3 px-1">
            <SecondaryResultDisplay 
              label="Loan Amount" 
              value={formatCurrency(loanAmount)} 
            />
            <SecondaryResultDisplay 
              label="Total Interest Paid" 
              value={formatCurrency(totalInterest)} 
            />
            <SecondaryResultDisplay 
              label="Total Cost of Loan" 
              value={formatCurrency(totalCostOfLoan)} 
            />
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
}
