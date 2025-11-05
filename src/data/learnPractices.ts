export type RenewPractice = {
  id: string
  title: string
  path: string
  summary: string
  practices: string[]
}

export type LearnNavEntry = {
  id: string
  label: string
  description: string
  path?: string
  comingSoon?: boolean
}

export const renewPractices: RenewPractice[] = [
  {
    id: 'study',
    title: 'Read',
    path: '/learn/renew/study',
    summary:
      'Guided reading plans with context notes, timelines, and cross-references so you can build a whole-Bible view of each passage.',
    practices: [
      'Pair each passage with historical and literary notes before journaling.',
      'Trace cross references to see how Scripture interprets Scripture.',
      'Capture prayer prompts and takeaways after every session.',
    ],
  },
  {
    id: 'memorization',
    title: 'Memorization',
    path: '/learn/renew/memorization',
    summary:
      'Simple repetition rhythms that move verses from short-term recall toward deep, Spirit-led meditation.',
    practices: [
      'Review a verse morning and evening using spaced repetition prompts.',
      'Rewrite the verse in your own words, then check against the original.',
      'Pray the verse back to God, asking for alignment with its truth.',
    ],
  },
]

export const learnNavItems: LearnNavEntry[] = [
  {
    id: 'renew',
    label: 'Study Tools',
    description:
      'Scripture-first tools that help you engage passages deeply, stay rooted in the Word, and build rhythms of reflection.',
    path: '/learn',
  },
  {
    id: 'walk',
    label: 'Walk With The Lord',
    description:
      'Practice abiding prayer, Scripture meditation, and Spirit-led obedience in daily life.',
    comingSoon: true,
  },
  {
    id: 'character',
    label: 'Grow in Character',
    description:
      'Formation journeys that cultivate the fruit of the Spirit with real-life application.',
    comingSoon: true,
  },
  {
    id: 'serve',
    label: 'Serve Others',
    description:
      'Frameworks for blessing your church, neighbors, and community with the love of Christ.',
    comingSoon: true,
  },
]
