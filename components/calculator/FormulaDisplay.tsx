import * as React from "react"

export interface FormulaDisplayProps {
  title?: string;
  formula: string | React.ReactNode;
  description?: string;
  variables?: { symbol: string; meaning: string }[];
  className?: string;
}

export function FormulaDisplay({ title = "Formula", formula, description, variables, className = "" }: FormulaDisplayProps) {
  return (
    <div className={`mt-8 rounded-lg border border-border bg-secondary-50/50 dark:bg-secondary-900/30 p-6 ${className}`}>
      <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">{title}</h3>
      
      <div className="flex justify-center items-center py-6 px-4 bg-background border border-border rounded-md shadow-sm overflow-x-auto text-lg md:text-xl font-mono text-zinc-800 dark:text-zinc-200">
        {formula}
      </div>

      {description && (
        <p className="mt-4 text-sm text-secondary-600 dark:text-secondary-400">
          {description}
        </p>
      )}

      {variables && variables.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">Variables</h4>
          <ul className="space-y-2">
            {variables.map((v, i) => (
              <li key={i} className="text-sm flex">
                <span className="font-mono font-bold text-foreground w-12 shrink-0">{v.symbol}</span>
                <span className="text-secondary-600 dark:text-secondary-400">= {v.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
