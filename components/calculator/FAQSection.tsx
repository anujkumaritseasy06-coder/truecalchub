"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

export interface FAQ {
  question: string;
  answer: React.ReactNode | string;
}

export interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
  className?: string;
}

export function FAQSection({ faqs, title = "Frequently Asked Questions", className = "" }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className={`mt-12 ${className}`}>
      {title && <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>}
      
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          
          return (
            <div 
              key={index} 
              className={`border border-border rounded-lg overflow-hidden transition-colors ${isOpen ? 'bg-secondary-50/50 dark:bg-secondary-900/30' : 'bg-card'}`}
            >
              <button
                type="button"
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                onClick={() => toggleOpen(index)}
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-foreground pr-8">{faq.question}</span>
                <ChevronDown 
                  className={`h-5 w-5 text-secondary-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-96 py-4 pt-0 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="text-secondary-600 dark:text-secondary-400 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
