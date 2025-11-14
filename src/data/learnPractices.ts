export type RenewPractice = {
  id: string
  title: string
  path: string
  summary: string | string[]
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
  // {
  //   id: 'study',
  //   title: 'Read',
  //   path: '/learn/renew/study',
  //   summary:
  //     'All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness, that the man of God may be complete, equipped for every good work. - 2 Timothy 3:16-17',
  //   practices: [
  //     'Pair each passage with historical and literary notes before journaling.',
  //     'Trace cross references to see how Scripture interprets Scripture.',
  //     'Capture prayer prompts and takeaways after every session.',
  //   ],
  // },
  {
    id: 'memorization',
    title: 'Memorization',
    path: '/learn/renew/memorization',
    summary: [
      'Scripture memorization is a disciplined way to strengthen the mind and train the will. Jesus responded to temptation with spoken Scripture (Matthew 4:1-11), showing us to confront thoughts with God\'s words rather than our own reasoning.',
      'Believers are called to let the word of Christ dwell richly within them (Colossians 3:16) and to renew their minds through truth (Romans 12:2). Memorization enables rapid recall so the right verse is present for temptation, decision-making, teaching, or correction.',
      '"I have stored up your word in my heart, that I might not sin against you." - Psalm 119:11',
    ],
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
