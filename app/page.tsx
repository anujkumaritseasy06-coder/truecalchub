import Link from "next/link";
import { ArrowRight, Calculator, BarChart3, HeartPulse, Hammer, ShieldCheck, Zap, Smartphone, CheckCircle, Search, LayoutGrid, FileText } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { constructMetadata } from "@/lib/seo";
import { getAllDocuments } from "@/lib/mdx";
import { AdPlacement } from "@/components/ads/AdPlacement";
import { WebSiteSchema, OrganizationSchema, FAQSchema } from "@/components/seo/Schema";
import { HeroSearch } from "@/components/ui/HeroSearch";

export const metadata = constructMetadata({
  title: "Professional Online Calculators Built for Accuracy",
  description: "100+ Free online calculators for finance, construction, health, salary, and more. Accurate formulas, fast results, no registration required.",
});

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('finance') || name.includes('money')) return <BarChart3 className="h-6 w-6 text-primary-600" />;
  if (name.includes('health') || name.includes('fitness')) return <HeartPulse className="h-6 w-6 text-primary-600" />;
  if (name.includes('construction') || name.includes('build') || name.includes('improvement')) return <Hammer className="h-6 w-6 text-primary-600" />;
  if (name.includes('salary') || name.includes('tax')) return <BarChart3 className="h-6 w-6 text-primary-600" />;
  return <LayoutGrid className="h-6 w-6 text-primary-600" />;
};

const faqs = [
  { question: "What is TrueCalcHub?", answer: "TrueCalcHub is a comprehensive directory of professional-grade online calculators designed to provide accurate and instant results for finance, construction, health, and everyday calculations." },
  { question: "Are all calculators completely free?", answer: "Yes, all calculators on TrueCalcHub are 100% free to use. There are no subscriptions, paywalls, or hidden fees." },
  { question: "Do I need to create an account to use the tools?", answer: "No registration is required. You can use any of our calculators instantly without providing any personal information or signing up." },
  { question: "How accurate are the calculators?", answer: "Our calculators use industry-standard formulas and are regularly tested to ensure precision. They are built for professionals and individuals who need reliable numbers." },
  { question: "Can I use TrueCalcHub on my mobile phone?", answer: "Absolutely. Our platform is fully responsive and optimized for mobile devices, allowing you to run complex calculations on the go." },
  { question: "How often are the formulas updated?", answer: "We review and update our formulas regularly to align with current industry standards, tax laws, and scientific guidelines." },
  { question: "What types of calculators do you offer?", answer: "We offer a wide range of tools across multiple categories including Finance (mortgages, loans, interest), Construction (concrete, roofing, materials), Health (BMI, calories), and Salary & Tax." },
  { question: "Is my data secure when using these tools?", answer: "Yes. All calculations are performed directly in your browser. We do not store or transmit the sensitive financial or health data you input into our calculators." }
];

export default async function Home() {
  const allCategories = getAllDocuments("categories");
  const allCalculators = getAllDocuments("calculators");

  // Dynamic counts for categories
  const categoriesWithCounts = allCategories.map(cat => {
    const calcCount = allCalculators.filter(c => c.frontmatter.category?.toLowerCase() === cat.slug.toLowerCase()).length;
    return { ...cat, count: calcCount };
  }).sort((a, b) => b.count - a.count); // Sort by most calculators first

  const totalCalculators = allCalculators.length;

  const searchableCalculators = allCalculators.map(c => ({
    title: c.frontmatter.title,
    description: c.frontmatter.description || "",
    url: `/${c.frontmatter.category?.toLowerCase() || 'calc'}/${c.slug}`,
  }));

  // 1. Featured Calculators (Handpicked or just top ones)
  const featuredSlugs = ["mortgage-calculator", "concrete-calculator", "bmi-calculator", "salary-calculator", "compound-interest-calculator", "roofing-calculator", "drywall-calculator", "loan-calculator"];
  const featuredCalculators = allCalculators.filter(c => featuredSlugs.includes(c.slug));

  // 2. Most Popular Calculators (Next batch)
  const popularSlugs = ["paycheck-calculator", "bmr-calculator", "calorie-calculator", "body-fat-calculator", "concrete-slab-calculator", "gravel-calculator", "fence-calculator", "paint-calculator", "auto-loan-calculator", "inflation-calculator", "concrete-bag-calculator", "deck-material-calculator", "asphalt-calculator", "sand-calculator", "mulch-calculator"];
  const popularCalculators = allCalculators.filter(c => popularSlugs.includes(c.slug)).slice(0, 15);

  return (
    <div className="flex flex-col items-center w-full">
      <WebSiteSchema />
      <OrganizationSchema />
      <FAQSchema faqs={faqs} />

      {/* SECTION 1: HERO REBUILD */}
      <section className="w-full bg-secondary-50 dark:bg-secondary-900 pt-20 pb-24 px-4 text-center border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-800 mb-8 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2"></span>
            {totalCalculators}+ Calculators • {categoriesWithCounts.length} Categories
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Professional Online Calculators <br className="hidden md:block"/>
            <span className="text-primary-600">Built for Accuracy</span>
          </h1>
          
          <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Instant, professional-grade tools for finance, construction, health, and more. 
          </p>

          {/* Search Box inside Hero */}
          <HeroSearch calculators={searchableCalculators} />

          {/* Popular Chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <span className="text-sm text-secondary-500 py-1.5 mr-2">Popular:</span>
            {featuredSlugs.slice(0, 5).map(slug => {
              const calc = featuredCalculators.find(c => c.slug === slug);
              if (!calc) return null;
              return (
                <Link key={slug} href={`/${calc.frontmatter.category?.toLowerCase() || 'calc'}/${slug}`} className="text-sm bg-background border border-border px-3 py-1.5 rounded-full hover:border-primary-300 hover:text-primary-600 transition-colors shadow-sm text-secondary-700 dark:text-secondary-300">
                  {calc.frontmatter.title}
                </Link>
              );
            })}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-10">
            <span className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1.5"/> Free Forever</span>
            <span className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1.5"/> No Registration</span>
            <span className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1.5"/> Instant Results</span>
            <span className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1.5"/> Mobile Friendly</span>
          </div>
          
          <div className="flex justify-center">
            <Link 
              href="/categories"
              className="inline-flex items-center justify-center rounded-lg text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg h-14 px-10"
            >
              Explore {totalCalculators}+ Calculators
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: TOP CALCULATOR CATEGORIES */}
      <section className="w-full max-w-7xl mx-auto py-20 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground tracking-tight">Top Calculator Categories</h2>
          <p className="text-secondary-600 dark:text-secondary-400 text-lg max-w-2xl mx-auto">
            Browse our comprehensive collection of professional tools by category.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCounts.map((category) => (
            <Link 
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group flex flex-col justify-between p-8 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-14 w-14 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                    {getCategoryIcon(category.frontmatter.title)}
                  </div>
                  <span className="bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 text-xs font-bold px-3 py-1 rounded-full">
                    {category.count} Calculators
                  </span>
                </div>
                <h3 className="font-bold text-2xl mb-3 text-card-foreground group-hover:text-primary-600 transition-colors">
                  {category.frontmatter.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed mb-6">
                  {category.frontmatter.description}
                </p>
              </div>
              <div className="text-primary-600 text-sm font-bold flex items-center">
                Explore {category.frontmatter.title} <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3: FEATURED CALCULATORS */}
      <section className="w-full bg-secondary-50 dark:bg-secondary-900/50 py-20 px-4 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Featured Calculators</h2>
              <p className="text-secondary-600 dark:text-secondary-400 text-lg">Our most precise and frequently used tools.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCalculators.map((calc) => (
              <Link 
                key={calc.slug}
                href={`/${calc.frontmatter.category?.toLowerCase() || 'calc'}/${calc.slug}`}
                className="group flex flex-col bg-background rounded-xl border border-border p-6 hover:shadow-md hover:border-primary-200 transition-all"
              >
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">
                  {calc.frontmatter.category || 'Calculator'}
                </span>
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary-600 transition-colors">
                  {calc.frontmatter.title}
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2 mb-4 flex-grow">
                  {calc.frontmatter.description}
                </p>
                <div className="text-primary-600 text-sm font-semibold flex items-center">
                  Use Tool <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AD PLACEHOLDER 1 */}
      <div className="w-full max-w-7xl mx-auto py-8 px-4">
        <AdPlacement slotId="homepage-after-featured" className="w-full h-[120px] rounded-lg" />
      </div>

      {/* SECTION 4: TRUST & AUTHORITY */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Why Use TrueCalcHub?</h2>
          <p className="text-secondary-600 dark:text-secondary-400 text-lg">Built for precision, designed for simplicity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6 text-primary-600">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Accurate Formulas</h3>
            <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">All calculations are built and verified using industry-standard mathematical formulas.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6 text-primary-600">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Results</h3>
            <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">Experience real-time calculations directly in your browser. No page reloads needed.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6 text-primary-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Free Forever</h3>
            <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">We believe professional tools should be accessible. No subscriptions or hidden fees.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6 text-primary-600">
              <Smartphone className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Mobile Friendly</h3>
            <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">Optimized layouts ensure you can run complex calculations perfectly on any smartphone or tablet.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6 text-primary-600">
              <Hammer className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Professional Grade</h3>
            <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">Robust tools built specifically for finance, health, construction, and business needs.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6 text-primary-600">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">No Registration</h3>
            <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">Your privacy matters. Use all of our tools instantly without creating an account or signing in.</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: MOST POPULAR CALCULATORS */}
      <section className="w-full bg-secondary-50 dark:bg-secondary-900/50 py-20 px-4 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">Most Popular Calculators</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularCalculators.map((calc) => (
              <Link 
                key={calc.slug}
                href={`/${calc.frontmatter.category?.toLowerCase() || 'calc'}/${calc.slug}`}
                className="bg-background border border-border p-4 rounded-lg hover:shadow-md hover:border-primary-300 transition-all text-center"
              >
                <h4 className="font-semibold text-sm text-foreground hover:text-primary-600">{calc.frontmatter.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CATEGORY PREVIEW BLOCKS */}
      <section className="w-full max-w-7xl mx-auto py-20 px-4 space-y-16">
        {categoriesWithCounts.slice(0, 4).map((category) => {
          // Get top 4 calculators for this category
          const topCategoryCalcs = allCalculators
            .filter(c => c.frontmatter.category?.toLowerCase() === category.slug.toLowerCase())
            .slice(0, 4);

          return (
            <div key={category.slug} className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              <div className="w-full lg:w-1/3">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="mr-3 text-primary-600">{getCategoryIcon(category.frontmatter.title)}</span>
                  {category.frontmatter.title} Calculators
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                  {category.frontmatter.description}
                </p>
                <Link href={`/categories/${category.slug}`} className="text-primary-600 font-bold hover:underline flex items-center">
                  Explore {category.frontmatter.title} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topCategoryCalcs.map(calc => (
                  <Link 
                    key={calc.slug}
                    href={`/${category.slug}/${calc.slug}`}
                    className="p-5 border border-border rounded-xl bg-card hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-bold text-foreground mb-1 group-hover:text-primary-600">{calc.frontmatter.title}</h4>
                    <p className="text-xs text-secondary-500 line-clamp-2">{calc.frontmatter.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* AD PLACEHOLDER 2 */}
      <div className="w-full max-w-7xl mx-auto py-8 px-4 border-t border-border">
        <AdPlacement slotId="homepage-after-categories" className="w-full h-[90px] rounded-lg" />
      </div>

      {/* SECTION 7: SEO CONTENT */}
      <section className="w-full max-w-4xl mx-auto py-16 px-4 prose prose-slate dark:prose-invert prose-emerald">
        <h2 className="text-3xl font-bold text-center mb-8">Professional Calculators for Every Need</h2>
        
        <p>
          Welcome to <strong>TrueCalcHub</strong>, the internet's premier destination for professional-grade, highly accurate online calculators. Whether you are estimating the material costs for a major construction project, analyzing compound interest on a long-term investment, or tracking your daily caloric intake, our platform provides instant, reliable answers without the hassle of registrations or paywalls.
        </p>

        <h3>Why Choose Our Online Calculators?</h3>
        <p>
          Accuracy is the foundation of any good calculator. At TrueCalcHub, we ensure that every tool is built using vetted, industry-standard mathematical formulas. Our <strong>finance calculators</strong> align with standard banking practices, while our <strong>construction calculators</strong> utilize proven estimating guidelines used by contractors worldwide.
        </p>
        <p>
          Beyond accuracy, we prioritize user experience. The internet is filled with cluttered, slow, and ad-heavy calculator websites that make finding a simple answer frustrating. We built TrueCalcHub to be the exact opposite. Our interface is clean, lightning-fast, and designed to work seamlessly on both desktop monitors and mobile screens. You can calculate on the go directly from your job site or smartphone.
        </p>

        <h3>Our Core Calculator Categories</h3>
        <p>
          We have organized our extensive library of over {totalCalculators} calculators into intuitive categories to help you find exactly what you need:
        </p>
        <ul>
          <li><strong>Finance & Money:</strong> Take control of your financial future. Use our tools to calculate mortgage payments, auto loans, compound interest growth, and debt payoff strategies.</li>
          <li><strong>Construction & Materials:</strong> Eliminate guesswork on the job site. Accurately estimate concrete volume, roofing shingles, drywall sheets, and landscaping materials to save time and reduce waste.</li>
          <li><strong>Health & Fitness:</strong> Track your wellness journey. Calculate your Body Mass Index (BMI), Basal Metabolic Rate (BMR), and daily caloric needs based on scientifically backed formulas.</li>
          <li><strong>Salary & Tax:</strong> Plan your budget effectively. Determine your take-home pay, calculate time-and-a-half overtime, and estimate inflation adjustments.</li>
        </ul>

        <h3>A Commitment to Privacy and Free Access</h3>
        <p>
          We strongly believe that access to basic mathematical tools should be free and private. TrueCalcHub requires <strong>no account creation</strong>, <strong>no app downloads</strong>, and <strong>no subscription fees</strong>. Furthermore, because all calculations are performed directly within your web browser, your sensitive financial numbers and personal health metrics remain completely private and are never sent to our servers.
        </p>
        <p>
          Explore our directory today and discover why thousands of professionals and individuals trust TrueCalcHub for their daily calculations.
        </p>
      </section>

      {/* SECTION 8: FAQ */}
      <section className="w-full bg-secondary-50 dark:bg-secondary-900/50 py-20 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-secondary-600 dark:text-secondary-400">Everything you need to know about TrueCalcHub.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AD PLACEHOLDER 3 */}
      <div className="w-full py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <AdPlacement slotId="homepage-before-footer" className="w-full h-[90px] rounded-lg" />
        </div>
      </div>

    </div>
  );
}
