import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/utils';
import { getAllDocumentSlugs, getDocumentModificationDate, getAllDocuments } from '@/lib/mdx';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/categories', '/search', '/about', '/contact'].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));



  const categorySlugs = getAllDocumentSlugs('categories');
  const categories = categorySlugs.map((slug) => ({
    url: absoluteUrl(`/categories/${slug}`),
    lastModified: getDocumentModificationDate('categories', slug),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const legalSlugs = getAllDocumentSlugs('legal');
  const legalPages = legalSlugs.map((slug) => ({
    url: absoluteUrl(`/${slug}`),
    lastModified: getDocumentModificationDate('legal', slug),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // Fetch calculators to get their category for the URL /[category]/[slug]
  const calculators = getAllDocuments('calculators').map((doc) => {
    const category = doc.frontmatter.category ? doc.frontmatter.category.toLowerCase() : 'calc';
    return {
      url: absoluteUrl(`/${category}/${doc.slug}`),
      lastModified: getDocumentModificationDate('calculators', doc.slug),
      changeFrequency: 'monthly' as const,
      priority: 0.9, // Calculators are the main product
    };
  });

  return [...routes, ...categories, ...calculators, ...legalPages];
}
