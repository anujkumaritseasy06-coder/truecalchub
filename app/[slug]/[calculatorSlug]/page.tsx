import { notFound } from "next/navigation";
import Link from "next/link";
import { getDocumentBySlug, getAllDocuments } from "@/lib/mdx";
import { constructMetadata } from "@/lib/seo";
import { BreadcrumbSchema, WebApplicationSchema, FAQSchema } from "@/components/seo/Schema";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AdPlacement } from "@/components/ads/AdPlacement";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getCalculatorComponent } from "@/components/calculators/CalculatorRegistry";
import { FAQSection } from "@/components/calculator/FAQSection";

export const dynamicParams = true;

export async function generateStaticParams() {
  const calculators = getAllDocuments("calculators");
  return calculators.map((calc) => ({
    slug: calc.frontmatter.category ? calc.frontmatter.category.toLowerCase() : 'calc',
    calculatorSlug: calc.slug,
  }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string, calculatorSlug: string }> }) {
  const params = await props.params;
  const doc = getDocumentBySlug("calculators", params.calculatorSlug);
  if (!doc) return {};

  return constructMetadata({
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    url: doc.frontmatter.canonicalUrl || `/${params.slug}/${doc.slug}`,
  });
}

export default async function CalculatorPage(props: { params: Promise<{ slug: string, calculatorSlug: string }> }) {
  const params = await props.params;
  // Make sure the slug exists and matches the category in our content
  const doc = getDocumentBySlug("calculators", params.calculatorSlug);
  
  if (!doc) {
    notFound();
  }

  const expectedCategory = doc.frontmatter.category ? doc.frontmatter.category.toLowerCase() : 'calc';
  if (expectedCategory !== params.slug.toLowerCase()) {
    // If the category in URL doesn't match the calculator's actual category, 404 to avoid duplicate content
    notFound();
  }

  const CalculatorWidget = getCalculatorComponent(doc.slug);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col lg:flex-row gap-8 lg:gap-12">
      <WebApplicationSchema 
        name={doc.frontmatter.title}
        description={doc.frontmatter.description}
        url={`/${params.slug}/${doc.slug}`}
      />
      {doc.frontmatter.faqs && doc.frontmatter.faqs.length > 0 && (
        <FAQSchema faqs={doc.frontmatter.faqs} />
      )}
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Categories", url: "/categories" },
        { name: doc.frontmatter.category || "Calculators", url: `/categories/${expectedCategory}` },
        { name: doc.frontmatter.title, url: `/${params.slug}/${doc.slug}` }
      ]} />
      
      <article className="flex-1 min-w-0">
        <Breadcrumbs items={[
          { name: "Categories", url: "/categories" },
          { name: doc.frontmatter.category || "Calculators", url: `/categories/${expectedCategory}` },
          { name: doc.frontmatter.title, url: `/${params.slug}/${doc.slug}` }
        ]} />
        
        <header className="mb-8 border-b border-border pb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">{doc.frontmatter.title}</h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400">
            {doc.frontmatter.description}
          </p>
        </header>

        <AdPlacement slotId="in-calc-top" className="mb-8 w-full h-auto min-h-[90px]" />

        {/* Calculator Interactive Section */}
        <section className="mb-12">
          {CalculatorWidget ? (
            <CalculatorWidget />
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center py-12 text-secondary-500">
              <p>Calculator interface under construction.</p>
              <p className="text-sm mt-2">Component: {doc.slug}</p>
            </div>
          )}
        </section>

        <AdPlacement slotId="in-calc-middle" className="mb-12 w-full h-auto min-h-[90px]" />

        {/* SEO Content Section */}
        <section className="prose prose-slate dark:prose-invert prose-emerald max-w-none 
                        prose-headings:font-bold prose-a:text-primary-600 hover:prose-a:text-primary-700">
          <MDXRemote source={doc.content} />
        </section>

        {doc.frontmatter.faqs && doc.frontmatter.faqs.length > 0 && (
          <FAQSection faqs={doc.frontmatter.faqs} />
        )}

        <AdPlacement slotId="in-calc-bottom" className="mt-16 w-full h-auto min-h-[90px]" />
      </article>

      {/* Sidebar for Ads and related content */}
      <aside className="w-full lg:w-80 flex-shrink-0 space-y-8">
        <div className="sticky top-24 space-y-8">
          <AdPlacement slotId="sidebar-sticky" className="w-full h-[600px] bg-secondary-50" />
          
          <div className="p-6 border border-border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-primary-600 border-b border-border pb-2">Related {doc.frontmatter.category} Calculators</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href={`/categories/${expectedCategory}`} className="text-secondary-600 hover:text-primary-600 hover:underline transition-colors">View all in {doc.frontmatter.category}</Link></li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

