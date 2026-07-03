import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/store', '/auctions'],
      disallow: ['/admin/', '/account/', '/api/', '/_next/', '/store?page='],
    },
    sitemap: 'https://nova-sphere.com/sitemap.xml',
  };
}
