import { notFound } from "next/navigation";
import { getDocumentBySlug, getAllDocumentSlugs } from "@/lib/mdx";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MDXRemote } from "next-mdx-remote/rsc";
import { WebPageSchema } from "@/components/seo/Schema";

export const dynamicParams = false; // Legal pages are known at build time

export async function generateStaticParams() {
  const slugs = getAllDocumentSlugs("legal");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const doc = getDocumentBySlug("legal", params.slug);
  if (!doc) return {};

  return constructMetadata({
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    url: doc.frontmatter.canonicalUrl || `/${doc.slug}`,
  });
}

export default async function LegalPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const doc = getDocumentBySlug("legal", params.slug);
  
  if (!doc) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <WebPageSchema name={doc.frontmatter.title} description={doc.frontmatter.description || ""} url={`/${doc.slug}`} />
      <Breadcrumbs items={[{ name: doc.frontmatter.title, url: `/${doc.slug}` }]} />
      
      <article className="prose prose-slate dark:prose-invert prose-primary max-w-none bg-card p-8 rounded-xl shadow-sm border border-border">
        <h1 className="text-4xl font-bold mb-8">{doc.frontmatter.title}</h1>
        {doc.frontmatter.date && (
          <p className="text-sm text-secondary-500 mb-8 pb-8 border-b border-border">
            Last Updated: {doc.frontmatter.date}
          </p>
        )}
        <MDXRemote source={doc.content} />
      </article>
    </div>
  );
}
