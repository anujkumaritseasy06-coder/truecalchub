"use client"

import React, { useState, useMemo } from 'react';
import { CalculatorWrapper } from '@/components/calculator/CalculatorWrapper';
import { ResultDisplay, SecondaryResultDisplay } from '@/components/calculator/ResultDisplay';
import { ValidationMessage } from '@/components/calculator/ValidationMessage';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';

export function PaycheckCalculator() {
  const [annualSalary, setAnnualSalary] = useState<string>('');
  const [payFrequency, setPayFrequency] = useState<string>(''); // Bi-Weekly default
  const [federalTaxRate, setFederalTaxRate] = useState<string>('');
  const [stateTaxRate, setStateTaxRate] = useState<string>('');
  const [fourOhOneK, setFourOhOneK] = useState<string>('');
  const [preTaxDeductions, setPreTaxDeductions] = useState<string>(''); // e.g. health insurance per paycheck
  const [postTaxDeductions, setPostTaxDeductions] = useState<string>('');

  const {
    grossPaycheck,
    federalTaxWithholding,
    stateTaxWithholding,
    totalTaxes,
    totalDeductions,
    netPaycheck,
    annualNetIncome,
    error
  } = useMemo(() => {
    const A = parseFloat(annualSalary);
    const Freq = parseInt(payFrequency);
    const FedRate = parseFloat(federalTaxRate) || 0;
    const StateRate = parseFloat(stateTaxRate) || 0;
    const K401 = parseFloat(fourOhOneK) || 0;
    const PreTax = parseFloat(preTaxDeductions) || 0;
    const PostTax = parseFloat(postTaxDeductions) || 0;

    if (isNaN(A) || isNaN(Freq)) {
      return { grossPaycheck: 0, federalTaxWithholding: 0, stateTaxWithholding: 0, totalTaxes: 0, totalDeductions: 0, netPaycheck: 0, annualNetIncome: 0, error: 'Please enter valid numerical values.' };
    }

    if (A <= 0 || A > 100000000) return { error: 'Annual salary must be between $1 and $100,000,000.', grossPaycheck: 0, federalTaxWithholding: 0, stateTaxWithholding: 0, totalTaxes: 0, totalDeductions: 0, netPaycheck: 0, annualNetIncome: 0 };
    if (FedRate < 0 || FedRate > 100) return { error: 'Federal tax rate must be between 0% and 100%.', grossPaycheck: 0, federalTaxWithholding: 0, stateTaxWithholding: 0, totalTaxes: 0, totalDeductions: 0, netPaycheck: 0, annualNetIncome: 0 };
    if (StateRate < 0 || StateRate > 100) return { error: 'State tax rate must be between 0% and 100%.', grossPaycheck: 0, federalTaxWithholding: 0, stateTaxWithholding: 0, totalTaxes: 0, totalDeductions: 0, netPaycheck: 0, annualNetIncome: 0 };
    if (K401 < 0 || K401 > 100) return { error: '401(k) contribution must be between 0% and 100%.', grossPaycheck: 0, federalTaxWithholding: 0, stateTaxWithholding: 0, totalTaxes: 0, totalDeductions: 0, netPaycheck: 0, annualNetIncome: 0 };
    if (PreTax < 0 || PreTax > 100000) return { error: 'Invalid pre-tax deduction amount.', grossPaycheck: 0, federalTaxWithholding: 0, stateTaxWithholding: 0, totalTaxes: 0, totalDeductions: 0, netPaycheck: 0, annualNetIncome: 0 };
    if (PostTax < 0 || PostTax > 100000) return { error: 'Invalid post-tax deduction amount.', grossPaycheck: 0, federalTaxWithholding: 0, stateTaxWithholding: 0, totalTaxes: 0, totalDeductions: 0, netPaycheck: 0, annualNetIncome: 0 };

    const gross = A / Freq;
    const k401Amount = gross * (K401 / 100);
    const totalPreTax = k401Amount + PreTax;

    if (totalPreTax > gross) {
      return { error: 'Your pre-tax deductions exceed your gross paycheck.', grossPaycheck: 0, federalTaxWithholding: 0, stateTaxWithholding: 0, totalTaxes: 0, totalDeductions: 0, netPaycheck: 0, annualNetIncome: 0 };
    }

    const taxableIncome = gross - totalPreTax;
    
    const fedTax = taxableIncome * (FedRate / 100);
    const stateTax = taxableIncome * (StateRate / 100);
    const tTaxes = fedTax + stateTax;

    if (tTaxes + PostTax > taxableIncome) {
       return { error: 'Your taxes and post-tax deductions exceed your taxable income.', grossPaycheck: 0, federalTaxWithholding: 0, stateTaxWithholding: 0, totalTaxes: 0, totalDeductions: 0, netPaycheck: 0, annualNetIncome: 0 };
    }

    const net = taxableIncome - tTaxes - PostTax;
    const tDeductions = totalPreTax + tTaxes + PostTax;
    const annualNet = net * Freq;

    return {
      grossPaycheck: gross,
      federalTaxWithholding: fedTax,
      stateTaxWithholding: stateTax,
      totalTaxes: tTaxes,
      totalDeductions: tDeductions,
      netPaycheck: net,
      annualNetIncome: annualNet,
      error: null,
    };
  }, [annualSalary, payFrequency, federalTaxRate, stateTaxRate, fourOhOneK, preTaxDeductions, postTaxDeductions]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <CalculatorWrapper className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="annualSalary">Annual Gross Salary</Label>
              <NumberInput 
                id="annualSalary"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(e.target.value)}
                min="1"
                max="100000000"
                step="1000"
                prefixNode={<span className="font-medium">$</span>}
                placeholder="75000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payFrequency">Pay Frequency</Label>
              <select
                id="payFrequency"
                value={payFrequency}
                onChange={(e) => setPayFrequency(e.target.value)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="52">Weekly (52/yr)</option>
                <option value="26">Bi-Weekly (26/yr)</option>
                <option value="24">Semi-Monthly (24/yr)</option>
                <option value="12">Monthly (12/yr)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-6 mb-4">
            <h3 className="font-medium text-foreground mb-4">Tax Withholdings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="federalTaxRate">Effective Federal Tax Rate</Label>
                <NumberInput 
                  id="federalTaxRate"
                  value={federalTaxRate}
                  onChange={(e) => setFederalTaxRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  suffixNode={<span className="font-medium">%</span>}
                  placeholder="12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stateTaxRate">Effective State Tax Rate</Label>
                <NumberInput 
                  id="stateTaxRate"
                  value={stateTaxRate}
                  onChange={(e) => setStateTaxRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  suffixNode={<span className="font-medium">%</span>}
                  placeholder="4.5"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-6 mb-4">
            <h3 className="font-medium text-foreground mb-4">Benefits & Deductions (Per Paycheck)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fourOhOneK">401(k) Contribution</Label>
                <NumberInput 
                  id="fourOhOneK"
                  value={fourOhOneK}
                  onChange={(e) => setFourOhOneK(e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                  suffixNode={<span className="font-medium">%</span>}
                  placeholder="5"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preTaxDeductions">Pre-Tax Deductions (Health, HSA)</Label>
                  <NumberInput 
                    id="preTaxDeductions"
                    value={preTaxDeductions}
                    onChange={(e) => setPreTaxDeductions(e.target.value)}
                    min="0"
                    max="100000"
                    step="10"
                    prefixNode={<span className="font-medium text-sm">$</span>}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postTaxDeductions">Post-Tax Deductions (Union, Roth)</Label>
                  <NumberInput 
                    id="postTaxDeductions"
                    value={postTaxDeductions}
                    onChange={(e) => setPostTaxDeductions(e.target.value)}
                    min="0"
                    max="100000"
                    step="10"
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
            label="Net Paycheck (Take Home)"
            value={formatCurrency(netPaycheck)}
            className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900 shadow-sm"
          />
          
          <div className="space-y-3 px-1 mb-8">
            <SecondaryResultDisplay 
              label="Gross Paycheck" 
              value={formatCurrency(grossPaycheck)} 
            />
            <SecondaryResultDisplay 
              label="Federal Tax Withholding" 
              value={formatCurrency(federalTaxWithholding)} 
            />
            <SecondaryResultDisplay 
              label="State Tax Withholding" 
              value={formatCurrency(stateTaxWithholding)} 
            />
            <SecondaryResultDisplay 
              label="Total Deductions (Taxes + Benefits)" 
              value={formatCurrency(totalDeductions)} 
            />
          </div>

          <div className="pt-6 border-t border-border space-y-3 px-1">
            <SecondaryResultDisplay 
              label="Annual Net Income" 
              value={formatCurrency(annualNetIncome)} 
              valueClassName="font-bold text-foreground"
            />
          </div>
        </div>
      </div>
    </CalculatorWrapper>
  );
}
