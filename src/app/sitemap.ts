import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://torquecare.in').replace(/\/$/, '');

  return [
    // Core Product & Landing
    {
      url: `${baseUrl}`,
      lastModified: '2026-10-20',
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: '2026-10-20',
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: '2026-10-21',
    },

    // High-Intent Free Utilities & Tools
    {
      url: `${baseUrl}/car-wash-payment-calculator`,
      lastModified: '2026-10-21',
    },
    {
      url: `${baseUrl}/car-wash-tracking`,
      lastModified: '2026-10-20',
    },
    {
      url: `${baseUrl}/car-wash-tracking-template`,
      lastModified: '2026-10-20',
    },

    // SEO Guides & Educational Cluster
    {
      url: `${baseUrl}/guides`,
      lastModified: '2026-10-21',
    },
    {
      url: `${baseUrl}/guides/car-washer-attendance-tracking`,
      lastModified: '2026-10-21',
    },
    {
      url: `${baseUrl}/guides/pay-for-missed-car-wash-days`,
      lastModified: '2026-10-21',
    },
    {
      url: `${baseUrl}/guides/monthly-car-wash-cost-india`,
      lastModified: '2026-10-21',
    },
    {
      url: `${baseUrl}/guides/missed-car-washes`,
      lastModified: '2026-10-20',
    },

    // Trust, Company & Legal Pages
    {
      url: `${baseUrl}/about`,
      lastModified: '2026-10-16',
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: '2026-10-11',
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: '2026-10-21',
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: '2026-10-21',
    },

    // User Onboarding Entry
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: '2026-10-18',
    },
  ];
}
