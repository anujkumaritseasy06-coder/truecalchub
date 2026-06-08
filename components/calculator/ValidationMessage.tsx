import * as React from "react"
import { AlertCircle } from "lucide-react"

export interface ValidationMessageProps {
  message: string;
  type?: "error" | "warning";
  className?: string;
}

export function ValidationMessage({ message, type = "error", className = "" }: ValidationMessageProps) {
  if (!message) return null;

  const isError = type === "error";
  const bgClass = isError ? "bg-red-50 dark:bg-red-950/30" : "bg-amber-50 dark:bg-amber-950/30";
  const borderClass = isError ? "border-red-200 dark:border-red-900" : "border-amber-200 dark:border-amber-900";
  const textClass = isError ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400";
  const iconClass = isError ? "text-red-500" : "text-amber-500";

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${bgClass} ${borderClass} ${textClass} ${className}`}>
      <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${iconClass}`} />
      <p className="text-sm font-medium leading-relaxed">{message}</p>
    </div>
  )
}
