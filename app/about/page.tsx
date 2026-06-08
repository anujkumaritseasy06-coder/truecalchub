import { constructMetadata } from "@/lib/seo";
import { AboutPageSchema } from "@/components/seo/Schema";
import { ShieldCheck, Target, Users, Zap, Search, PenTool, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata = constructMetadata({
  title: "About TrueCalcHub | Professional Online Calculators",
  description: "Learn about TrueCalcHub, our mission, and our commitment to providing accurate online calculators.",
  url: "/about",
});

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center w-full bg-background">
      <AboutPageSchema />
      
      {/* Hero Section */}
      <section className="w-full bg-secondary-50 dark:bg-secondary-900/50 py-16 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={[{ name: "About Us", url: "/about" }]} />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mt-8 mb-6">
            About TrueCalcHub
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 leading-relaxed">
            TrueCalcHub provides accurate, easy-to-use online calculators for finance, construction, health, salary, tax, home improvement, and everyday calculations.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full max-w-4xl mx-auto py-16 px-4 space-y-16">
        
        {/* Our Mission */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <Target className="h-8 w-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
          </div>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed mb-4">
            Our mission is simple: to democratize access to professional-grade mathematical tools. We believe that whether you are a contractor estimating materials, a family planning a budget, or an individual tracking health metrics, you deserve instant access to accurate, reliable, and free calculators without being forced to create accounts or download apps.
          </p>
        </div>

        {/* Who We Serve */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <Users className="h-8 w-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-foreground">Who We Serve</h2>
          </div>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed mb-6">
            TrueCalcHub is built for everyone who needs precise numbers to make informed decisions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border p-5 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Professionals</h3>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm">Contractors, financial advisors, and healthcare workers who need quick validation of complex formulas on the job.</p>
            </div>
            <div className="bg-card border border-border p-5 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Individuals & Families</h3>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm">People planning their personal finances, managing diets, or undertaking DIY home improvement projects.</p>
            </div>
            <div className="bg-card border border-border p-5 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Students & Educators</h3>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm">Learners and teachers who require reliable mathematical models for educational purposes.</p>
            </div>
            <div className="bg-card border border-border p-5 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Small Business Owners</h3>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm">Entrepreneurs estimating payroll taxes, loan amortization, and operational material costs.</p>
            </div>
          </div>
        </div>

        {/* How We Build Calculators */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <PenTool className="h-8 w-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-foreground">How We Build Calculators</h2>
          </div>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed mb-4">
            Every calculator on TrueCalcHub undergoes a rigorous development process. We do not use "black box" solutions. Instead, we:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-lg text-secondary-600 dark:text-secondary-400">
            <li>Research industry-standard formulas (e.g., standard banking amortization, CDC health guidelines, standard construction waste percentages).</li>
            <li>Code the logic from scratch to ensure precision and prevent rounding errors.</li>
            <li>Design a minimalist, mobile-first interface so the tool works perfectly on any device.</li>
            <li>Process all calculations locally in your browser for maximum speed and absolute privacy.</li>
          </ul>
        </div>

        {/* Why Users Trust Us */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <ShieldCheck className="h-8 w-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-foreground">Why Users Trust TrueCalcHub</h2>
          </div>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed mb-6">
            Trust is the foundation of a calculation platform. We earn that trust through our core philosophy:
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1"><Zap className="h-5 w-5 text-green-500" /></div>
              <div className="ml-3">
                <h4 className="font-bold text-foreground">100% Client-Side Processing</h4>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm">Your financial numbers and health metrics never leave your device. We do not save your calculation data to our servers.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1"><Zap className="h-5 w-5 text-green-500" /></div>
              <div className="ml-3">
                <h4 className="font-bold text-foreground">No Registration Walls</h4>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm">We will never ask you to create an account or provide an email address to see your results.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1"><Zap className="h-5 w-5 text-green-500" /></div>
              <div className="ml-3">
                <h4 className="font-bold text-foreground">Transparent Formulas</h4>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm">Wherever possible, we document the exact formulas and assumptions our calculators use so you can verify the math.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Future Vision */}
        <div className="bg-primary-50 dark:bg-primary-900/20 p-8 rounded-2xl border border-primary-100 dark:border-primary-800/30">
          <div className="flex items-center space-x-3 mb-4">
            <Search className="h-7 w-7 text-primary-600" />
            <h2 className="text-2xl font-bold text-foreground">Our Future Vision</h2>
          </div>
          <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed mb-0">
            We are continuously expanding our library. Our vision is to scale TrueCalcHub into the internet's most comprehensive repository of specialized calculators, bridging the gap between complex mathematics and everyday utility.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-border">
          <h3 className="text-2xl font-bold mb-6">Ready to run the numbers?</h3>
          <div className="flex justify-center gap-4">
            <Link href="/categories" className="bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors shadow-sm flex items-center">
              <LayoutGrid className="mr-2 h-5 w-5" /> Explore Calculators
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
