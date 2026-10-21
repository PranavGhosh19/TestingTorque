import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://torquecare.in').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/owner/',
          '/washer/',
          '/api/',
          '/auth/verify',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
