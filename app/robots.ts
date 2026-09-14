import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cycletrace.co.za'
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/settings', '/billing', '/api/'] },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
