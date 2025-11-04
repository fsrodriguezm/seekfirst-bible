import type { NextApiRequest, NextApiResponse } from 'next'
import bookMetadata from '../../data/resources/book-metadata.json'
import { getSlugForLanguage } from '../../src/utils/bookSlugNormalizer'
import { VERSION_INFOS } from '../../src/utils/versionMap'

const SITE_URL = 'https://seekfirstbible.com'

// Get all Bible books in order
const BIBLE_BOOKS = Object.keys(bookMetadata)

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Generate URLs for all Bible books and chapters
  const urls: string[] = []

  // Add homepage
  urls.push(`  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>`)

  // Add static pages
  const staticPages = ['about', 'license', 'privacy', 'terms']
  staticPages.forEach((page) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/${page}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>`)
  })

  // Get representative versions for sitemap (to avoid bloat)
  const representativeVersions = ['kjv', 'akjv', 'web', 'rvr1960']

  // Generate URLs for each book/chapter combination
  BIBLE_BOOKS.forEach((book) => {
    const metadata = bookMetadata[book as keyof typeof bookMetadata]
    const chapters = metadata.chapters

    representativeVersions.forEach((versionSlug) => {
      // Find version info to get language
      const versionInfo = VERSION_INFOS.find(v => v.slug === versionSlug)
      if (!versionInfo) return

      const lang = versionInfo.language
      const bookSlug = getSlugForLanguage(book, lang)
      if (!bookSlug) return

      // Add URL for each chapter
      for (let chapter = 1; chapter <= chapters; chapter++) {
        urls.push(`  <url>
    <loc>${SITE_URL}/${lang}/${versionSlug}/${bookSlug}/${chapter}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>`)
      }
    })
  })

  // Build the XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  // Set proper headers
  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')
  res.status(200).send(sitemap)
}
