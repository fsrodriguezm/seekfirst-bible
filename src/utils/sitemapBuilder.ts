import bookMetadata from '../../data/resources/book-metadata.json'
import { getSlugForLanguage } from './bookSlugNormalizer'
import { VERSION_INFOS } from './versionMap'

const SITE_URL = 'https://seekfirstbible.com'
const BIBLE_BOOKS = Object.keys(bookMetadata)
const REPRESENTATIVE_VERSIONS = ['kjv', 'akjv', 'web', 'rvr1960']

export function buildSitemapXml(): string {
  const urls: string[] = []

  urls.push(`  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>`)

  const staticPages = ['about', 'license', 'privacy', 'terms']
  staticPages.forEach((page) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/${page}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>`)
  })

  BIBLE_BOOKS.forEach((book) => {
    const metadata = bookMetadata[book as keyof typeof bookMetadata]
    const chapters = metadata.chapters

    REPRESENTATIVE_VERSIONS.forEach((versionSlug) => {
      const versionInfo = VERSION_INFOS.find((v) => v.slug === versionSlug)
      if (!versionInfo) return

      const lang = versionInfo.language
      const bookSlug = getSlugForLanguage(book, lang)
      if (!bookSlug) return

      for (let chapter = 1; chapter <= chapters; chapter++) {
        urls.push(`  <url>
    <loc>${SITE_URL}/${lang}/${versionSlug}/${bookSlug}/${chapter}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>`)
      }
    })
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
}
