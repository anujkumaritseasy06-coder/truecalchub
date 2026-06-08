import { notFound } from "next/navigation";
import Link from "next/link";
import { getDocumentBySlug, getAllDocumentSlugs, getAllDocuments } from "@/lib/mdx";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbSchema } from "@/components/seo/Schema";
import { Calculator, ArrowRight } from "lucide-react";

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = getAllDocumentSlugs("categories");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const doc = getDocumentBySlug("categories", params.slug);
  if (!doc) return {};

  return constructMetadata({
    title: `${doc.frontmatter.title} Calculators`,
    description: doc.frontmatter.description,
    url: doc.frontmatter.canonicalUrl || `/categories/${doc.slug}`,
  });
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const doc = getDocumentBySlug("categories", params.slug);
  
  if (!doc) {
    notFound();
  }

  // Find all calculators associated with this category
  const allCalculators = getAllDocuments("calculators");
  const categoryCalculators = allCalculators.filter(
    (calc) => calc.frontmatter.category && calc.frontmatter.category.toLowerCase() === params.slug.toLowerCase()
  );



  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Categories", url: "/categories" },
        { name: doc.frontmatter.title, url: `/categories/${doc.slug}` }
      ]} />
      <Breadcrumbs items={[
        { name: "Categories", url: "/categories" },
        { name: doc.frontmatter.title, url: `/categories/${doc.slug}` }
      ]} />
      
      <header className="mb-12 border-b border-border pb-8 mt-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{doc.frontmatter.title}</h1>
        <p className="text-xl text-secondary-600 dark:text-secondary-400">
          {doc.frontmatter.description}
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-foreground">
          <Calculator className="h-6 w-6 text-primary-600" />
          Calculators in {doc.frontmatter.title}
        </h2>
        
        {categoryCalculators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryCalculators.map((calc) => (
              <Link 
                key={calc.slug}
                href={`/${params.slug}/${calc.slug}`}
                className="group flex flex-col justify-between p-6 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all"
              >
                <div>
                  <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary-600 transition-colors">
                    {calc.frontmatter.title}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-3">
                    {calc.frontmatter.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center text-primary-600 text-sm font-medium">
                  Use Calculator <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-secondary-500 bg-secondary-50 dark:bg-secondary-900 rounded-xl border border-dashed border-border col-span-full">
            <p className="text-lg font-medium">Calculators coming soon.</p>
            <p className="text-sm mt-2">We are currently building tools for this category.</p>
          </div>
        )}
      </section>


    </div>
  );
}

