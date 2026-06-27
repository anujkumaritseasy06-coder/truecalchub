"use client";
import React, { useState, useMemo } from "react";

// 2025 Federal Tax Brackets
const BRACKETS_2025 = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  married_jointly: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  married_separately: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 375800, rate: 0.35 },
    { min: 375800, max: Infinity, rate: 0.37 },
  ],
};

const STANDARD_DEDUCTION_2025: Record<string, number> = {
  single: 15000,
  married_jointly: 30000,
  head_of_household: 22500,
  married_separately: 15000,
};

type FilingStatus = keyof typeof BRACKETS_2025;

function calcTax(taxableIncome: number, status: FilingStatus) {
  const brackets = BRACKETS_2025[status];
  let tax = 0;
  const details: { rate: number; from: number; to: number; taxed: number; tax: number }[] = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    const bracketTax = taxableInBracket * bracket.rate;
    tax += bracketTax;
    details.push({
      rate: bracket.rate,
      from: bracket.min,
      to: Math.min(taxableIncome, bracket.max),
      taxed: taxableInBracket,
      tax: bracketTax,
    });
  }

  return { tax, details };
}

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = (n: number) => (n * 100).toFixed(1) + "%";

const STATUS_LABELS: Record<FilingStatus, string> = {
  single: "Single",
  married_jointly: "Married Filing Jointly",
  married_separately: "Married Filing Separately",
  head_of_household: "Head of Household",
};

export function TaxCalculator2025() {
  const [grossIncome, setGrossIncome] = useState("75000");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [additionalDeductions, setAdditionalDeductions] = useState("0");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const result = useMemo(() => {
    const gross = parseFloat(grossIncome) || 0;
    const extraDeductions = parseFloat(additionalDeductions) || 0;
    const standardDeduction = STANDARD_DEDUCTION_2025[filingStatus];
    const totalDeductions = standardDeduction + extraDeductions;
    const taxableIncome = Math.max(0, gross - totalDeductions);
    const { tax, details } = calcTax(taxableIncome, filingStatus);
    const effectiveRate = gross > 0 ? tax / gross : 0;
    const marginalRate = details.length > 0 ? details[details.length - 1].rate : 0;
    return { gross, taxableIncome, tax, effectiveRate, marginalRate, standardDeduction, totalDeductions, details };
  }, [grossIncome, filingStatus, additionalDeductions]);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6">
        <h2 className="text-white font-bold text-xl mb-1">2025 Federal Income Tax Calculator</h2>
        <p className="text-white/80 text-sm">Estimate your federal income tax using 2025 brackets</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Filing Status */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Filing Status</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(STATUS_LABELS) as FilingStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilingStatus(status)}
                className={`rounded-xl py-2.5 px-3 text-sm font-medium border transition text-left ${
                  filingStatus === status
                    ? "bg-green-600 text-white border-green-600 shadow-md"
                    : "border-border bg-background hover:border-green-500"
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Gross Annual Income</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500 font-medium">$</span>
              <input
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-7 pr-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Extra Deductions (401k, IRA, etc.)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500 font-medium">$</span>
              <input
                type="number"
                value={additionalDeductions}
                onChange={(e) => setAdditionalDeductions(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-7 pr-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Standard deduction badge */}
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-3 text-sm">
          <span className="text-secondary-600 dark:text-secondary-400">2025 Standard Deduction ({STATUS_LABELS[filingStatus]}): </span>
          <strong className="text-green-700 dark:text-green-300">{fmt(result.standardDeduction)}</strong>
        </div>

        {/* Main Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 p-5 text-center">
            <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-1">Est. Federal Tax</p>
            <p className="text-4xl font-black text-green-700 dark:text-green-300">{fmt(result.tax)}</p>
          </div>
          <div className="rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-border p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-500">Gross Income</span>
                <strong>{fmt(result.gross)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Total Deductions</span>
                <strong className="text-green-600">−{fmt(result.totalDeductions)}</strong>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-secondary-500">Taxable Income</span>
                <strong>{fmt(result.taxableIncome)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Effective Rate</span>
                <strong className="text-amber-600">{pct(result.effectiveRate)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Marginal Rate</span>
                <strong className="text-red-500">{pct(result.marginalRate)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bracket Breakdown Toggle */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
        >
          {showBreakdown ? "▲ Hide" : "▼ Show"} Tax Bracket Breakdown
        </button>

        {showBreakdown && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead className="bg-secondary-100 dark:bg-secondary-800">
                <tr>
                  {["Rate", "Income Range", "Amount in Bracket", "Tax Owed"].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-secondary-600 dark:text-secondary-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.details.map((d, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2 font-bold text-amber-600">{pct(d.rate)}</td>
                    <td className="px-3 py-2">{fmt(d.from)} – {d.to >= 999999 ? "∞" : fmt(d.to)}</td>
                    <td className="px-3 py-2">{fmt(d.taxed)}</td>
                    <td className="px-3 py-2 font-semibold text-red-500">{fmt(d.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-secondary-400 text-center">
          Estimate only. Does not include state taxes, FICA, or tax credits. Consult a tax professional.
        </p>
      </div>
    </div>
  );
}
