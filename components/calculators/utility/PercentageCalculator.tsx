"use client";
import React, { useState, useCallback } from "react";

type CalcMode = "percent-of" | "what-percent" | "percent-change" | "add-percent" | "subtract-percent";

const modes: { value: CalcMode; label: string; description: string }[] = [
  { value: "percent-of", label: "% of a Number", description: "What is X% of Y?" },
  { value: "what-percent", label: "What % is X of Y?", description: "X is what % of Y?" },
  { value: "percent-change", label: "% Change", description: "Increase or decrease from A to B" },
  { value: "add-percent", label: "Add a %", description: "Increase a number by X%" },
  { value: "subtract-percent", label: "Subtract a %", description: "Decrease a number by X%" },
];

function formatNum(n: number): string {
  if (isNaN(n) || !isFinite(n)) return "—";
  return n % 1 === 0 ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function PercentageCalculator() {
  const [mode, setMode] = useState<CalcMode>("percent-of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const compute = useCallback(() => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) return null;

    switch (mode) {
      case "percent-of":
        return { result: (numA / 100) * numB, label: `${numA}% of ${numB}`, unit: "" };
      case "what-percent":
        return { result: (numA / numB) * 100, label: `${numA} is what % of ${numB}`, unit: "%" };
      case "percent-change":
        return {
          result: ((numB - numA) / Math.abs(numA)) * 100,
          label: numB >= numA ? "Percentage Increase" : "Percentage Decrease",
          unit: "%",
        };
      case "add-percent":
        return { result: numA * (1 + numB / 100), label: `${numA} + ${numB}%`, unit: "" };
      case "subtract-percent":
        return { result: numA * (1 - numB / 100), label: `${numA} − ${numB}%`, unit: "" };
      default:
        return null;
    }
  }, [mode, a, b]);

  const result = compute();

  const getLabels = () => {
    switch (mode) {
      case "percent-of":
        return { aLabel: "Percentage (%)", bLabel: "Number" };
      case "what-percent":
        return { aLabel: "Value (X)", bLabel: "Total (Y)" };
      case "percent-change":
        return { aLabel: "Original Value (A)", bLabel: "New Value (B)" };
      case "add-percent":
        return { aLabel: "Original Number", bLabel: "Percentage to Add (%)" };
      case "subtract-percent":
        return { aLabel: "Original Number", bLabel: "Percentage to Subtract (%)" };
    }
  };

  const labels = getLabels();

  const isNegative = result && result.result < 0;
  const changeColor = mode === "percent-change"
    ? (result && result.result >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400")
    : "text-primary-600 dark:text-primary-400";

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      {/* Mode Selector */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
        <h2 className="text-white font-bold text-xl mb-4">Percentage Calculator</h2>
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => { setMode(m.value); setA(""); setB(""); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === m.value
                  ? "bg-white text-primary-700 shadow-md"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-white/80 text-sm mt-3">{modes.find(m => m.value === mode)?.description}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{labels.aLabel}</label>
            <input
              type="number"
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="Enter value"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{labels.bLabel}</label>
            <input
              type="number"
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder="Enter value"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
          </div>
        </div>

        {/* Result */}
        <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 border border-primary-200 dark:border-primary-800 p-6 text-center">
          {result ? (
            <>
              <p className="text-sm font-medium text-secondary-500 mb-1">{result.label}</p>
              <p className={`text-5xl font-black ${changeColor}`}>
                {mode === "percent-change" && result.result > 0 ? "+" : ""}
                {formatNum(result.result)}{result.unit}
              </p>
              {mode === "percent-change" && (
                <p className={`text-sm mt-2 font-semibold ${changeColor}`}>
                  {result.result >= 0 ? "▲ Increase" : "▼ Decrease"}
                </p>
              )}
            </>
          ) : (
            <p className="text-secondary-400 text-lg">Enter values above to see result</p>
          )}
        </div>

        {/* Quick Tips */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          {[
            { tip: "10% of X", formula: "X ÷ 10" },
            { tip: "20% tip", formula: "Bill × 0.20" },
            { tip: "% increase", formula: "((B−A)÷A)×100" },
          ].map((t) => (
            <div key={t.tip} className="bg-secondary-50 dark:bg-secondary-900 rounded-lg p-2">
              <p className="font-semibold text-foreground">{t.tip}</p>
              <p className="text-secondary-500 font-mono">{t.formula}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
