import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/private/',
        '/search',
        '/*?*', // Prevent crawling URLs with query parameters to save crawl budget
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
