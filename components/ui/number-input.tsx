import * as React from "react"
import { Input, InputProps } from "./input"

export interface NumberInputProps extends InputProps {
  prefixNode?: React.ReactNode;
  suffixNode?: React.ReactNode;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className = "", prefixNode, suffixNode, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {prefixNode && (
          <div className="absolute left-3 flex items-center pointer-events-none text-secondary-500">
            {prefixNode}
          </div>
        )}
        <Input
          type="number"
          ref={ref}
          className={`${prefixNode ? 'pl-8' : ''} ${suffixNode ? 'pr-16' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
          {...props}
        />
        {suffixNode && (
          <div className="absolute right-3 flex items-center pointer-events-none text-secondary-500">
            {suffixNode}
          </div>
        )}
      </div>
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }
