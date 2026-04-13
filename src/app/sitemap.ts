import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.dylanvdven.xyz';
const LAST_MODIFIED = new Date().toISOString(); // Real-time date or hardcoded

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Add your main sub-pages here
    {
      url: `${SITE_URL}/projects`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}