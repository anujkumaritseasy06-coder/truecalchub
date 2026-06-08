"use client";

import React, { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Menu, X, Search } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Calculators", href: "/categories" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary-600 text-foreground/80"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/search"
              className="text-foreground/80 hover:text-primary-600"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-4">
            <Link href="/search" className="text-foreground/80" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground/80"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-base font-medium text-foreground/80 hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
