import Link from "next/link";
import { getAllDocuments } from "@/lib/mdx";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata = constructMetadata({
  title: "Categories",
  description: "Browse all calculator categories and financial tools.",
  url: "/categories",
});

export default function CategoriesIndexPage() {
  const categories = getAllDocuments("categories");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumbs items={[{ name: "Categories", url: "/categories" }]} />
      
      <h1 className="text-4xl font-bold mb-4">Calculator Categories</h1>
      <p className="text-secondary-600 dark:text-secondary-400 mb-10 text-lg">
        Explore our comprehensive collection of calculators organized by category.
      </p>
      
      {categories.length === 0 ? (
        <div className="text-secondary-500 py-10 border border-dashed border-border rounded-lg text-center">
          Categories will appear here once added.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.slug} 
              href={`/categories/${cat.slug}`}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary-300 transition-all"
            >
              <h2 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                {cat.frontmatter.title}
              </h2>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                {cat.frontmatter.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
