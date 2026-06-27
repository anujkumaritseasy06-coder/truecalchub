import { getAllDocuments } from "@/lib/mdx";
import { constructMetadata } from "@/lib/seo";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

export const metadata = constructMetadata({
  title: "Calculator Guides & Financial Tips — Blog",
  description: "Expert guides on mortgages, construction costs, health calculations, taxes, and personal finance. Learn how to use our free online calculators to make better financial decisions.",
  url: "/blog",
  keywords: ["mortgage guide", "construction calculator guide", "personal finance tips", "tax calculator guide", "financial calculators"],
});

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const categoryColors: Record<string, string> = {
  finance: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  construction: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  health: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "salary-tax": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  utility: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default async function BlogPage() {
  const posts = getAllDocuments("blog").filter((p) => p.frontmatter.published !== false);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Page Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
          <BookOpen className="h-4 w-4" />
          Calculator Guides & Tips
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">
          Learn. Calculate. <span className="text-primary-600">Decide Better.</span>
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
          Expert guides on using calculators to make smarter financial, construction, and health decisions.
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16 text-secondary-500">
          <p className="text-xl">No posts published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {posts.map((post, index) => {
            const readTime = estimateReadTime(post.content);
            const category = post.frontmatter.category || "utility";
            const categoryClass = categoryColors[category] || categoryColors.utility;

            return (
              <article
                key={post.slug}
                className={`group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 ${
                  index === 0 && posts.length > 1 ? "md:col-span-2" : ""
                }`}
              >
                {/* Card Image Placeholder — shows gradient based on category */}
                <div className={`h-3 w-full bg-gradient-to-r ${
                  category === "finance" ? "from-blue-500 to-indigo-600" :
                  category === "construction" ? "from-orange-500 to-amber-600" :
                  category === "health" ? "from-green-500 to-emerald-600" :
                  "from-primary-500 to-primary-600"
                }`} />

                <div className="p-6 flex flex-col flex-1">
                  {/* Meta */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${categoryClass}`}>
                      {category.replace("-", " & ")}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-secondary-500">
                      <Calendar className="h-3 w-3" />
                      {post.frontmatter.date ? new Date(post.frontmatter.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-secondary-500">
                      <Clock className="h-3 w-3" />
                      {readTime} min read
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary-600 transition-colors leading-tight">
                    <Link href={`/blog/${post.slug}`}>
                      {post.frontmatter.title}
                    </Link>
                  </h2>
                  <p className="text-secondary-600 dark:text-secondary-400 text-sm leading-relaxed flex-1 mb-4">
                    {post.frontmatter.description}
                  </p>

                  {/* Tags */}
                  {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.frontmatter.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-xs bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 rounded px-2 py-0.5">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read More */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:gap-2.5 transition-all"
                  >
                    Read Full Guide <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to Calculate?</h2>
        <p className="text-primary-100 mb-4">Access 45+ free online calculators for finance, construction, health, and more.</p>
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition"
        >
          Browse All Calculators <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
