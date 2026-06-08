import { getAllDocuments, getAllDocumentSlugs } from './lib/mdx';
import { siteConfig } from './lib/config';
import fs from 'fs';
import path from 'path';

const report = {
  routes: [] as string[],
  calculators: [] as any[],
  seo: [] as any[],
  content: [] as any[],
  adsense: [] as any[],
  security: [] as any[]
};

// Phase 1: Route Discovery
const staticRoutes = ['', '/categories', '/search', '/about', '/contact', '/privacy', '/terms', '/disclaimer'];
const categorySlugs = getAllDocumentSlugs('categories');
const legalSlugs = getAllDocumentSlugs('legal');
const calculators = getAllDocuments('calculators');

report.routes = [
  ...staticRoutes,
  ...categorySlugs.map(s => `/categories/${s}`),
  ...legalSlugs.map(s => `/${s}`),
  ...calculators.map(c => `/${(c.frontmatter as any).category?.toLowerCase() || 'calc'}/${c.slug}`)
];

// Phase 2: Calculator Discovery
report.calculators = calculators.map(c => ({
  name: c.frontmatter.title,
  slug: c.slug,
  category: (c.frontmatter as any).category || 'Unknown',
  url: `/${(c.frontmatter as any).category?.toLowerCase() || 'calc'}/${c.slug}`
}));

// Phases 5-8: SEO & Content
const allDocs = [...calculators, ...getAllDocuments('categories'), ...getAllDocuments('legal')];

allDocs.forEach(doc => {
  const fm: any = doc.frontmatter;
  const content = doc.content;
  const wordCount = content.split(/\s+/).length;
  
  // SEO
  report.seo.push({
    slug: doc.slug,
    title: fm.title || 'MISSING',
    titleLength: fm.title?.length || 0,
    description: fm.description || 'MISSING',
    descLength: fm.description?.length || 0,
    hasH1: content.includes('# ') || content.includes('<h1>'),
    hasCanonical: !!fm.canonicalUrl
  });

  // Content
  report.content.push({
    slug: doc.slug,
    wordCount,
    hasFaqs: fm.faqs?.length > 0 || content.includes('## FAQ') || content.includes('## Frequently Asked Questions'),
    hasFormulas: content.includes('Formula') || content.includes('Math')
  });
});

// Phases 13: AdSense
const requiredLegal = ['privacy', 'terms', 'contact', 'about'];
const missingLegal = requiredLegal.filter(r => !report.routes.includes(`/${r}`));
report.adsense.push({
  missingPages: missingLegal,
  ready: missingLegal.length === 0
});

// Output
fs.writeFileSync('audit_results_part1.json', JSON.stringify(report, null, 2));
console.log('Part 1 audit complete.');
