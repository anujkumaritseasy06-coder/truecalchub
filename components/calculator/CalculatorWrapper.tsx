import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export interface CalculatorWrapperProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function CalculatorWrapper({ title, description, children, className = "" }: CalculatorWrapperProps) {
  return (
    <Card className={`w-full border-border bg-card shadow-sm ${className}`}>
      {(title || description) && (
        <CardHeader className="border-b border-border bg-secondary-50/50 dark:bg-secondary-900/20 pb-4">
          {title && <CardTitle className="text-xl md:text-2xl text-foreground">{title}</CardTitle>}
          {description && <CardDescription className="text-sm mt-1">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  )
}
