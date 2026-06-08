import * as React from "react"
import Link from "next/link"
import { Calculator, ArrowRight } from "lucide-react"

export interface CalculatorReference {
  title: string;
  description: string;
  url: string;
}

export interface RelatedCalculatorsProps {
  calculators: CalculatorReference[];
  title?: string;
  className?: string;
}

export function RelatedCalculators({ calculators, title = "Related Calculators", className = "" }: RelatedCalculatorsProps) {
  if (!calculators || calculators.length === 0) return null;

  return (
    <section className={`mt-12 ${className}`}>
      {title && <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary-600" />
        {title}
      </h2>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map((calc, idx) => (
          <Link 
            key={idx} 
            href={calc.url}
            className="group flex flex-col justify-between p-5 rounded-lg border border-border bg-card hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
          >
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary-600 transition-colors mb-2">
                {calc.title}
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                {calc.description}
              </p>
            </div>
            <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
              Open <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
