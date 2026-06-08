import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    let variantStyles = "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
    
    if (variant === "outline") {
      variantStyles = "border border-border bg-background hover:bg-secondary-100 dark:hover:bg-secondary-800 text-foreground shadow-sm"
    } else if (variant === "ghost") {
      variantStyles = "hover:bg-secondary-100 hover:text-foreground dark:hover:bg-secondary-800"
    } else if (variant === "link") {
      variantStyles = "text-primary-600 underline-offset-4 hover:underline"
    } else if (variant === "secondary") {
      variantStyles = "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-50"
    }

    let sizeStyles = "h-10 px-4 py-2"
    if (size === "sm") {
      sizeStyles = "h-9 rounded-md px-3 text-xs"
    } else if (size === "lg") {
      sizeStyles = "h-11 rounded-md px-8"
    } else if (size === "icon") {
      sizeStyles = "h-10 w-10"
    }

    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50"

    return (
      <button
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
