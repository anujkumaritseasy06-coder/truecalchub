"use client";
import React, { useState, useMemo } from "react";

function calcAutoLoan(principal: number, annualRate: number, termMonths: number) {
  if (principal <= 0 || termMonths <= 0) return null;
  if (annualRate === 0) {
    const monthly = principal / termMonths;
    return { monthly, totalPayment: principal, totalInterest: 0, schedule: [] };
  }
  const r = annualRate / 100 / 12;
  const monthly = (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
  const totalPayment = monthly * termMonths;
  const totalInterest = totalPayment - principal;

  // Build amortization schedule (first 12 months + yearly summaries)
  let balance = principal;
  const schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
  for (let i = 1; i <= termMonths; i++) {
    const interestCharge = balance * r;
    const principalCharge = monthly - interestCharge;
    balance = Math.max(0, balance - principalCharge);
    schedule.push({ month: i, payment: monthly, principal: principalCharge, interest: interestCharge, balance });
  }
  return { monthly, totalPayment, totalInterest, schedule };
}

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtFull = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export function AutoLoanCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState("30000");
  const [downPayment, setDownPayment] = useState("6000");
  const [tradeIn, setTradeIn] = useState("0");
  const [interestRate, setInterestRate] = useState("7.0");
  const [termMonths, setTermMonths] = useState("60");
  const [showSchedule, setShowSchedule] = useState(false);

  const result = useMemo(() => {
    const price = parseFloat(vehiclePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const trade = parseFloat(tradeIn) || 0;
    const rate = parseFloat(interestRate) || 0;
    const term = parseInt(termMonths) || 60;
    const principal = Math.max(0, price - down - trade);
    return calcAutoLoan(principal, rate, term);
  }, [vehiclePrice, downPayment, tradeIn, interestRate, termMonths]);

  const principal = Math.max(0, (parseFloat(vehiclePrice) || 0) - (parseFloat(downPayment) || 0) - (parseFloat(tradeIn) || 0));

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <h2 className="text-white font-bold text-xl mb-1">Auto Loan Calculator</h2>
        <p className="text-white/80 text-sm">Calculate your monthly car payment and total interest</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Vehicle Price", value: vehiclePrice, setter: setVehiclePrice, prefix: "$" },
            { label: "Down Payment", value: downPayment, setter: setDownPayment, prefix: "$" },
            { label: "Trade-In Value", value: tradeIn, setter: setTradeIn, prefix: "$" },
            { label: "Interest Rate (APR)", value: interestRate, setter: setInterestRate, suffix: "%" },
          ].map(({ label, value, setter, prefix, suffix }) => (
            <div key={label}>
              <label className="block text-sm font-semibold text-foreground mb-1.5">{label}</label>
              <div className="relative">
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500 font-medium">{prefix}</span>}
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className={`w-full rounded-xl border border-border bg-background py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${prefix ? "pl-7 pr-4" : "pl-4 pr-7"}`}
                />
                {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 font-medium">{suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Loan Term */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Loan Term</label>
          <div className="grid grid-cols-4 gap-2">
            {["24", "36", "48", "60", "72", "84"].map((t) => (
              <button
                key={t}
                onClick={() => setTermMonths(t)}
                className={`rounded-xl py-2 text-sm font-semibold border transition ${
                  termMonths === t
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "border-border bg-background hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {t} mo
              </button>
            ))}
          </div>
        </div>

        {/* Loan Summary */}
        <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-3 text-sm text-secondary-500">
          Loan Amount: <strong className="text-foreground">{fmtFull(principal)}</strong>
        </div>

        {/* Results */}
        {result && (
          <>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 p-6 text-center">
              <p className="text-sm font-medium text-secondary-500 mb-1">Monthly Payment</p>
              <p className="text-5xl font-black text-blue-600 dark:text-blue-400">{fmtFull(result.monthly)}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 border border-border">
                <p className="text-xs text-secondary-500 mb-1">Loan Amount</p>
                <p className="text-lg font-bold text-foreground">{fmt(principal)}</p>
              </div>
              <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 border border-border">
                <p className="text-xs text-secondary-500 mb-1">Total Interest</p>
                <p className="text-lg font-bold text-red-500">{fmt(result.totalInterest)}</p>
              </div>
              <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 border border-border">
                <p className="text-xs text-secondary-500 mb-1">Total Cost</p>
                <p className="text-lg font-bold text-foreground">{fmt(result.totalPayment + (parseFloat(downPayment) || 0) + (parseFloat(tradeIn) || 0))}</p>
              </div>
            </div>

            {/* Toggle Amortization */}
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {showSchedule ? "▲ Hide" : "▼ Show"} Amortization Schedule (first 12 months)
            </button>

            {showSchedule && (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary-100 dark:bg-secondary-800">
                    <tr>
                      {["Mo.", "Payment", "Principal", "Interest", "Balance"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-secondary-600 dark:text-secondary-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.slice(0, 12).map((row) => (
                      <tr key={row.month} className="border-t border-border">
                        <td className="px-3 py-2 font-medium">{row.month}</td>
                        <td className="px-3 py-2">{fmtFull(row.payment)}</td>
                        <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400">{fmtFull(row.principal)}</td>
                        <td className="px-3 py-2 text-red-500">{fmtFull(row.interest)}</td>
                        <td className="px-3 py-2">{fmtFull(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
