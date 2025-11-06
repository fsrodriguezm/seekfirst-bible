import type { NextApiRequest, NextApiResponse } from 'next'
import { buildSitemapXml } from '../../src/utils/sitemapBuilder'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const sitemap = buildSitemapXml()
  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')
  res.status(200).send(sitemap)
}
