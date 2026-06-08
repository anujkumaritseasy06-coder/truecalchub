import * as React from "react"

export interface ResultDisplayProps {
  label: string;
  value: string | React.ReactNode;
  subValue?: string | React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export function ResultDisplay({ label, value, subValue, className = "", valueClassName = "text-4xl md:text-5xl" }: ResultDisplayProps) {
  return (
    <div className={`rounded-xl border border-border bg-zinc-50 dark:bg-zinc-900 p-6 flex flex-col items-center justify-center text-center ${className}`}>
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
        {label}
      </h3>
      <div className={`${valueClassName} font-bold text-zinc-900 dark:text-zinc-50 tracking-tight break-words w-full`}>
        {value}
      </div>
      {subValue && (
        <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {subValue}
        </p>
      )}
    </div>
  )
}

export interface SecondaryResultDisplayProps {
  label: string;
  value: string | React.ReactNode;
  valueClassName?: string;
}

export function SecondaryResultDisplay({ label, value, valueClassName = "" }: SecondaryResultDisplayProps) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-0">
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      <span className={`text-base font-semibold ${valueClassName ? valueClassName : 'text-zinc-900 dark:text-zinc-100'}`}>{value}</span>
    </div>
  )
}
