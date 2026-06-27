import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/utils';
import { getAllDocumentSlugs, getDocumentModificationDate, getAllDocuments } from '@/lib/mdx';

export default function sitemap(): MetadataRoute.Sitemap {
  // Core static routes
  const routes = ['', '/categories', '/about', '/contact', '/blog'].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.8,
  }));

  // Category pages
  const categorySlugs = getAllDocumentSlugs('categories');
  const categories = categorySlugs.map((slug) => ({
    url: absoluteUrl(`/categories/${slug}`),
    lastModified: getDocumentModificationDate('categories', slug),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Legal pages
  const legalSlugs = getAllDocumentSlugs('legal');
  const legalPages = legalSlugs.map((slug) => ({
    url: absoluteUrl(`/${slug}`),
    lastModified: getDocumentModificationDate('legal', slug),
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  }));

  // Calculator pages — highest priority, they are the main product
  const calculators = getAllDocuments('calculators').map((doc) => {
    const category = doc.frontmatter.category ? doc.frontmatter.category.toLowerCase() : 'calc';
    const urlPath = doc.frontmatter.canonicalUrl || `/${category}/${doc.slug}`;
    return {
      url: absoluteUrl(urlPath),
      lastModified: getDocumentModificationDate('calculators', doc.slug),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    };
  });

  // Blog posts
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const blogSlugs = getAllDocumentSlugs('blog');
    blogPosts = blogSlugs.map((slug) => ({
      url: absoluteUrl(`/blog/${slug}`),
      lastModified: getDocumentModificationDate('blog', slug),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // Blog directory may not exist yet
  }

  return [...routes, ...categories, ...calculators, ...blogPosts, ...legalPages];
}
