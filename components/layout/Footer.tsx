import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { FooterLogo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Column 1 - Brand */}
          <div className="md:col-span-1">
            <FooterLogo className="mb-6" />
            <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
              Accurate online calculators built for finance, construction, health, salary, tax, and everyday calculations.
            </p>
          </div>
          
          {/* Column 2 - Popular Calculators */}
          <div>
            <h3 className="font-bold mb-6 text-foreground tracking-tight">Popular Calculators</h3>
            <ul className="space-y-3 text-sm text-secondary-600 dark:text-secondary-400">
              <li><Link href="/finance/mortgage-calculator" className="hover:text-primary-600 transition-colors">Mortgage Calculator</Link></li>
              <li><Link href="/finance/loan-calculator" className="hover:text-primary-600 transition-colors">Loan Calculator</Link></li>
              <li><Link href="/finance/compound-interest-calculator" className="hover:text-primary-600 transition-colors">Compound Interest Calculator</Link></li>
              <li><Link href="/health/bmi-calculator" className="hover:text-primary-600 transition-colors">BMI Calculator</Link></li>
              <li><Link href="/construction/concrete-calculator" className="hover:text-primary-600 transition-colors">Concrete Calculator</Link></li>
              <li><Link href="/salary-tax/salary-calculator" className="hover:text-primary-600 transition-colors">Salary Calculator</Link></li>
            </ul>
          </div>
          
          {/* Column 3 - Categories */}
          <div>
            <h3 className="font-bold mb-6 text-foreground tracking-tight">Categories</h3>
            <ul className="space-y-3 text-sm text-secondary-600 dark:text-secondary-400">
              <li><Link href="/categories/finance" className="hover:text-primary-600 transition-colors">Finance</Link></li>
              <li><Link href="/categories/salary-tax" className="hover:text-primary-600 transition-colors">Salary & Tax</Link></li>
              <li><Link href="/categories/health" className="hover:text-primary-600 transition-colors">Health</Link></li>
              <li><Link href="/categories/construction" className="hover:text-primary-600 transition-colors">Construction</Link></li>
              <li><Link href="/categories/home-improvement" className="hover:text-primary-600 transition-colors">Home Improvement</Link></li>
              <li><Link href="/categories/utility" className="hover:text-primary-600 transition-colors">Utility</Link></li>
            </ul>
          </div>
          
          {/* Column 4 - Legal & Support */}
          <div>
            <h3 className="font-bold mb-6 text-foreground tracking-tight">Legal & Support</h3>
            <ul className="space-y-3 text-sm text-secondary-600 dark:text-secondary-400">
              <li><Link href="/about" className="hover:text-primary-600 transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="hover:text-primary-600 transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved.</p>
          <p className="font-medium text-secondary-400 dark:text-secondary-500">Built for accurate and reliable calculations.</p>
        </div>
      </div>
    </footer>
  );
}
