import React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

interface LogoProps {
  className?: string;
}

export function LogoMark({ className = "h-8 w-8" }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="TrueCalcHub Logo Mark"
    >
      {/* Base T Shape / Calculator Body */}
      <path 
        d="M4 6C4 4.89543 4.89543 4 6 4H26C27.1046 4 28 4.89543 28 6V13C28 14.1046 27.1046 15 26 15H20V26C20 27.1046 19.1046 28 18 28H14C12.8954 28 12 27.1046 12 26V15H6C4.89543 15 4 14.1046 4 13V6Z" 
        fill="currentColor" 
        className="text-primary-600" 
      />
      {/* Display Window */}
      <rect x="8" y="7" width="16" height="5" rx="1.5" fill="currentColor" className="text-white dark:text-background" />
      {/* Simulated text/graph inside display */}
      <path d="M10 9.5H15" stroke="currentColor" className="text-primary-600" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 9.5H22" stroke="currentColor" className="text-primary-600" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Buttons on the stem */}
      <rect x="14" y="17" width="4" height="4" rx="1" fill="currentColor" className="text-white dark:text-background" />
      <rect x="14" y="22" width="4" height="4" rx="1" fill="currentColor" className="text-white dark:text-background" />
    </svg>
  );
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2.5 group ${className}`}>
      <LogoMark className="h-8 w-8 text-primary-600 group-hover:text-primary-700 transition-colors drop-shadow-sm" />
      <span className="font-bold sm:inline-block tracking-tight text-xl text-foreground">
        True<span className="font-medium text-secondary-600 dark:text-secondary-400">Calc</span><span className="font-light text-primary-600">Hub</span>
      </span>
    </Link>
  );
}

export function FooterLogo({ className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2.5 group ${className}`}>
      <LogoMark className="h-7 w-7 text-primary-600 group-hover:text-primary-700 transition-colors" />
      <span className="font-bold tracking-tight text-xl text-foreground">
        True<span className="font-medium text-secondary-600 dark:text-secondary-400">Calc</span><span className="font-light text-primary-600">Hub</span>
      </span>
    </Link>
  );
}
