"use client";
import React, { useState, useMemo } from "react";

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function TipCalculator() {
  const [billAmount, setBillAmount] = useState("65.00");
  const [tipPercent, setTipPercent] = useState(20);
  const [customTip, setCustomTip] = useState("");
  const [splitCount, setSplitCount] = useState(1);

  const effectiveTip = customTip !== "" ? parseFloat(customTip) : tipPercent;

  const result = useMemo(() => {
    const bill = parseFloat(billAmount) || 0;
    const tip = isNaN(effectiveTip) ? 0 : effectiveTip;
    const tipAmount = bill * (tip / 100);
    const total = bill + tipAmount;
    const perPerson = splitCount > 0 ? total / splitCount : total;
    const tipPerPerson = splitCount > 0 ? tipAmount / splitCount : tipAmount;
    return { bill, tipAmount, total, perPerson, tipPerPerson, tip };
  }, [billAmount, effectiveTip, splitCount]);

  const presets = [10, 15, 18, 20, 22, 25];

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6">
        <h2 className="text-white font-bold text-xl mb-1">Tip Calculator</h2>
        <p className="text-white/80 text-sm">Calculate tip and split bill between multiple people</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Bill Amount */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Bill Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500 font-semibold text-lg">$</span>
            <input
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-8 pr-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Tip % Presets */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Tip Percentage</label>
          <div className="grid grid-cols-6 gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => { setTipPercent(p); setCustomTip(""); }}
                className={`rounded-xl py-2.5 text-sm font-bold border transition ${
                  customTip === "" && tipPercent === p
                    ? "bg-rose-500 text-white border-rose-500 shadow-md"
                    : "border-border bg-background hover:border-rose-400 hover:text-rose-600"
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
          <div className="mt-2 relative">
            <input
              type="number"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              placeholder="Custom %"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
            />
          </div>
        </div>

        {/* Split Count */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Split Between: <span className="text-rose-600 font-bold">{splitCount} {splitCount === 1 ? "person" : "people"}</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
              className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-800 text-xl font-bold hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900 transition"
            >−</button>
            <div className="flex-1 h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full relative">
              <div className="h-2 bg-rose-500 rounded-full transition-all" style={{ width: `${Math.min(100, splitCount * 10)}%` }} />
            </div>
            <button
              onClick={() => setSplitCount(Math.min(20, splitCount + 1))}
              className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-800 text-xl font-bold hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900 transition"
            >+</button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border border-rose-200 dark:border-rose-800 p-5 text-center">
            <p className="text-sm font-medium text-secondary-500 mb-1">Total Bill (with {result.tip}% tip)</p>
            <p className="text-5xl font-black text-rose-600 dark:text-rose-400">{fmt(result.total)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 text-center border border-border">
              <p className="text-xs text-secondary-500 mb-1">Tip Amount</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.tipAmount)}</p>
            </div>
            <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 text-center border border-border">
              <p className="text-xs text-secondary-500 mb-1">Original Bill</p>
              <p className="text-2xl font-bold text-foreground">{fmt(result.bill)}</p>
            </div>
          </div>

          {splitCount > 1 && (
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800 p-5 text-center">
              <p className="text-sm font-medium text-secondary-500 mb-1">Each Person Pays</p>
              <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{fmt(result.perPerson)}</p>
              <p className="text-xs text-secondary-500 mt-1">Including {fmt(result.tipPerPerson)} tip per person</p>
            </div>
          )}
        </div>

        {/* Tip Guide */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold text-secondary-500 mb-2 uppercase tracking-wide">US Tipping Guide</p>
          <div className="grid grid-cols-2 gap-1 text-xs text-secondary-600 dark:text-secondary-400">
            {[
              ["Restaurant (casual)", "15–20%"],
              ["Fine dining", "20–25%"],
              ["Food delivery", "15–20%"],
              ["Hair salon", "15–25%"],
              ["Taxi/Rideshare", "15–20%"],
              ["Hotel housekeeping", "$2–5/night"],
            ].map(([service, tip]) => (
              <div key={service} className="flex justify-between py-0.5">
                <span>{service}</span>
                <span className="font-semibold text-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
