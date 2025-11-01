import { GetServerSideProps } from 'next'
import Head from 'next/head'
import App from '../../../../../src/App'
import { normalizeBookSlug, getSlugForLanguage, parseVerseRange } from '../../../../../src/utils/bookSlugNormalizer'
import { resolveVersionBySlug, resolveVersionById, getVersionLanguage, isSpanishVersion } from '../../../../../src/utils/versionMap'
import { ENGLISH_TO_SPANISH_BOOKS } from '../../../../../src/utils/bookNameMappings'

interface BiblePageProps {
  lang: string
  version: string
  book: string
  chapter: number
  verses?: string
}

export default function BiblePage({ version, book, chapter, verses }: BiblePageProps) {
  const title = verses
    ? `${book} ${chapter}:${verses} - ${version.toUpperCase()}`
    : `${book} ${chapter} - ${version.toUpperCase()}`
  
  const description = `Read ${book} chapter ${chapter}${verses ? ` verses ${verses}` : ''} in the ${version.toUpperCase()} translation`

  return (
    <>
      <Head>
        <title>{`${title} | SeekFirst`}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <App 
        initialBook={book}
        initialChapter={chapter}
        initialVersion={version.toUpperCase()}
        initialVerses={verses}
      />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { lang, version, book, chapter, verses } = context.params as {
    lang: string
    version: string
    book: string
    chapter: string
    verses?: string[]
  }

  // Handle colon format in chapter: "24:3-5" -> redirect to "24/3-5"
  if (chapter.includes(':')) {
    const colonMatch = chapter.match(/^(\d+):(.+)$/)
    if (colonMatch) {
      const [, chapterNum, versesPart] = colonMatch
      
      // Normalize book and version for redirect
      const normalizedBook = normalizeBookSlug(book)
      if (!normalizedBook) {
        return { notFound: true }
      }
      
      const versionInfo = resolveVersionBySlug(version.toLowerCase())
      if (!versionInfo) {
        return { notFound: true }
      }
      
      // Use version language for book slug, not URL language
      const versionLang = getVersionLanguage(versionInfo.id) ?? 'en'
      const bookSlug = getSlugForLanguage(normalizedBook, versionLang)
      if (!bookSlug) {
        return { notFound: true }
      }
      
      return {
        redirect: {
          destination: `/${lang}/${versionInfo.slug}/${bookSlug}/${chapterNum}/${versesPart}`,
          permanent: true,
        },
      }
    }
  }

  // Validate language (currently supporting 'en' and 'es')
  if (lang !== 'en' && lang !== 'es') {
    return {
      notFound: true,
    }
  }

  // Normalize and validate version
  const versionInfo = resolveVersionBySlug(version.toLowerCase())
  if (!versionInfo) {
    return {
      notFound: true,
    }
  }

  const countryHeader = context.req.headers['x-vercel-ip-country']
    ?? context.req.headers['cf-ipcountry']
    ?? context.req.headers['x-country-code']
  const countryCode = Array.isArray(countryHeader) ? countryHeader[0] : countryHeader
  const isUkVisitor = countryCode?.toUpperCase() === 'GB'

  if (isUkVisitor && versionInfo.id === 'KJV') {
    const altVersion = resolveVersionById('AKJV')
    if (altVersion) {
      const normalizedBookForRedirect = normalizeBookSlug(book)
      if (!normalizedBookForRedirect) {
        return { notFound: true }
      }
      const altVersionLang = getVersionLanguage(altVersion.id) ?? 'en'
      const altBookSlug = getSlugForLanguage(normalizedBookForRedirect, altVersionLang)
      if (!altBookSlug) {
        return { notFound: true }
      }
      const versePath = verses && verses.length > 0 ? `/${verses.join('/')}` : ''

      return {
        redirect: {
          destination: `/${lang}/${altVersion.slug}/${altBookSlug}/${chapter}${versePath}`,
          permanent: false,
        },
      }
    }
  }

  // Check if version slug needs normalization (redirect to canonical)
  const canonicalVersionSlug = versionInfo.slug
  if (version.toLowerCase() !== canonicalVersionSlug) {
    const canonicalBook = normalizeBookSlug(book)
    if (!canonicalBook) {
      return { notFound: true }
    }
    
    // Use version language for book slug, not URL language
    const versionLang = getVersionLanguage(versionInfo.id) ?? 'en'
    const bookSlug = getSlugForLanguage(canonicalBook, versionLang)
    if (!bookSlug) {
      return { notFound: true }
    }

    const versePath = verses && verses.length > 0 ? `/${verses.join('/')}` : ''
    
    return {
      redirect: {
        destination: `/${lang}/${canonicalVersionSlug}/${bookSlug}/${chapter}${versePath}`,
        permanent: true,
      },
    }
  }

  // Normalize and validate book
  const normalizedBook = normalizeBookSlug(book)
  if (!normalizedBook) {
    return {
      notFound: true,
    }
  }

  // Check if book slug needs normalization (redirect to canonical)
  // Use version language for book slug, not URL language
  const versionLang = getVersionLanguage(versionInfo.id) ?? 'en'
  const canonicalBookSlug = getSlugForLanguage(normalizedBook, versionLang)
  if (!canonicalBookSlug) {
    return {
      notFound: true,
    }
  }

  if (book.toLowerCase() !== canonicalBookSlug) {
    const versePath = verses && verses.length > 0 ? `/${verses.join('/')}` : ''
    
    return {
      redirect: {
        destination: `/${lang}/${canonicalVersionSlug}/${canonicalBookSlug}/${chapter}${versePath}`,
        permanent: true,
      },
    }
  }

  // Validate chapter
  const chapterNum = parseInt(chapter, 10)
  if (isNaN(chapterNum) || chapterNum < 1) {
    return {
      notFound: true,
    }
  }

  // Handle verse parameter
  let verseStr: string | undefined
  
  if (verses && verses.length > 0) {
    // Join verse parts (shouldn't be multiple parts with proper routing)
    verseStr = verses.join('-')
    
    // Validate verse range format
    const verseRange = parseVerseRange(verseStr)
    if (!verseRange) {
      return {
        notFound: true,
      }
    }
  }

  // Determine the book name to pass based on the Bible version language
  const bookNameForBible = isSpanishVersion(versionInfo.id)
    ? (ENGLISH_TO_SPANISH_BOOKS[normalizedBook] || normalizedBook)
    : normalizedBook

  return {
    props: {
      lang,
      version: versionInfo.id,
      book: bookNameForBible,
      chapter: chapterNum,
      ...(verseStr ? { verses: verseStr } : {}), // Only include verses if it exists
    },
  }
}
