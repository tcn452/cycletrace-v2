import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cycletrace.co.za'
  return [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/search`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/organizations`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/register`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/login`, changeFrequency: 'monthly', priority: 0.4 },
  ]
}
