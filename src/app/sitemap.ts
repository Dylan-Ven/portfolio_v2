import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.dylanvdven.xyz';
const LAST_MODIFIED = '2026-03-30T00:00:00.000Z';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}