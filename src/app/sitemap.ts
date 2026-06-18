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
    {
      url: `${SITE_URL}/terminal`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}