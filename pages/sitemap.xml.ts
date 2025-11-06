import type { GetServerSideProps } from 'next'
import { buildSitemapXml } from '../src/utils/sitemapBuilder'

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = buildSitemapXml()

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')
  res.write(sitemap)
  res.end()

  return { props: {} }
}

export default function SitemapXml() {
  return null
}
