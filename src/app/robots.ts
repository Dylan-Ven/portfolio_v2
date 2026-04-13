import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.dylanvdven.xyz';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // 1. General rules for helpful bots (Google, Bing, etc.)
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',       // Don't index your backend routes
          '/_next/',     // Don't index internal Next.js files
          '/admin/',     // If you have a private route
          '/*.json$',    // Don't index manifest or metadata files
        ],
        crawlDelay: 1,   // Asks polite bots to pace themselves
      },
      {
        // 2. Firm "No" to aggressive SEO scrapers
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot'],
        disallow: '/',
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}