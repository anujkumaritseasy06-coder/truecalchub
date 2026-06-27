import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/private/',
          '/api/',
          '/_next/',
        ],
      },
      {
        // Allow Google to crawl all public content for maximum indexation
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/private/',
          '/api/',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl(''),
  };
}
