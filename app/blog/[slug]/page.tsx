import { notFound } from "next/navigation";
import Link from "next/link";
import { getDocumentBySlug, getAllDocumentSlugs } from "@/lib/mdx";
import { constructMetadata } from "@/lib/seo";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/Schema";
import { AdPlacement } from "@/components/ads/AdPlacement";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllDocumentSlugs("blog");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const doc = getDocumentBySlug("blog", params.slug);
  if (!doc) return {};

  return constructMetadata({
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    url: `/blog/${doc.slug}`,
    type: "article",
    publishedAt: doc.frontmatter.date,
    keywords: doc.frontmatter.tags,
  });
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const doc = getDocumentBySlug("blog", params.slug);

  if (!doc || doc.frontmatter.published === false) {
    notFound();
  }

  const readTime = estimateReadTime(doc.content);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ArticleSchema
        title={doc.frontmatter.title}
        description={doc.frontmatter.description}
        url={`/blog/${doc.slug}`}
        publishedAt={doc.frontmatter.date || new Date().toISOString()}
        authorName={(doc.frontmatter as any).author || "TrueCalcHub Editorial Team"}
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: doc.frontmatter.title, url: `/blog/${doc.slug}` },
      ]} />

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Main Content */}
        <article className="flex-1 min-w-0">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-secondary-500 hover:text-primary-600 transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-8 pb-8 border-b border-border">
            {doc.frontmatter.category && (
              <span className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 capitalize">
                {doc.frontmatter.category.replace("-", " & ")}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground leading-tight">
              {doc.frontmatter.title}
            </h1>
            <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-4 leading-relaxed">
              {doc.frontmatter.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-500">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {(doc.frontmatter as any).author || "TrueCalcHub Editorial Team"}
              </span>
              {doc.frontmatter.date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(doc.frontmatter.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {readTime} min read
              </span>
            </div>
          </header>

          {/* Top Ad */}
          <AdPlacement slotId="blog-top-banner" className="mb-8 w-full min-h-[90px]" />

          {/* Article Body */}
          <section className="prose prose-slate dark:prose-invert prose-primary max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-a:text-primary-600 hover:prose-a:text-primary-700
            prose-img:rounded-xl prose-img:shadow-md
            prose-table:text-sm prose-th:bg-secondary-50 dark:prose-th:bg-secondary-900
            prose-blockquote:border-primary-500 prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-950 prose-blockquote:rounded-r-lg prose-blockquote:py-0.5">
            <MDXRemote source={doc.content} />
          </section>

          {/* Mid Content Ad */}
          <AdPlacement slotId="blog-in-article" className="my-10 w-full min-h-[250px]" />

          {/* Tags */}
          {doc.frontmatter.tags && doc.frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-border">
              <span className="text-sm font-semibold text-secondary-500 mr-1">Tags:</span>
              {doc.frontmatter.tags.map((tag) => (
                <span key={tag} className="text-xs bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 rounded-full px-3 py-1">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Ad */}
          <AdPlacement slotId="blog-bottom" className="mt-10 w-full min-h-[90px]" />
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <AdPlacement slotId="sidebar-sticky" className="w-full h-[600px]" />

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-bold text-base mb-3 text-primary-600">Related Calculators</h3>
              <ul className="space-y-2 text-sm text-secondary-600 dark:text-secondary-400">
                {doc.frontmatter.category === "finance" && (
                  <>
                    <li><Link href="/finance/mortgage-calculator" className="hover:text-primary-600 hover:underline transition">🏠 Mortgage Calculator</Link></li>
                    <li><Link href="/finance/loan-calculator" className="hover:text-primary-600 hover:underline transition">💰 Loan Calculator</Link></li>
                    <li><Link href="/finance/compound-interest-calculator" className="hover:text-primary-600 hover:underline transition">📈 Compound Interest</Link></li>
                  </>
                )}
                {doc.frontmatter.category === "construction" && (
                  <>
                    <li><Link href="/construction/concrete-calculator" className="hover:text-primary-600 hover:underline transition">🏗️ Concrete Calculator</Link></li>
                    <li><Link href="/construction/roofing-calculator" className="hover:text-primary-600 hover:underline transition">🏠 Roofing Calculator</Link></li>
                    <li><Link href="/construction/gravel-calculator" className="hover:text-primary-600 hover:underline transition">🪨 Gravel Calculator</Link></li>
                  </>
                )}
                <li><Link href="/categories" className="text-primary-600 hover:underline font-semibold transition">Browse all calculators →</Link></li>
              </ul>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 p-5 text-white text-center">
              <p className="font-bold text-lg mb-2">Free Calculators</p>
              <p className="text-primary-100 text-sm mb-4">45+ professional-grade tools. No signup needed.</p>
              <Link
                href="/categories"
                className="block bg-white text-primary-700 font-bold py-2 px-4 rounded-lg text-sm hover:bg-primary-50 transition"
              >
                Explore Tools
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
