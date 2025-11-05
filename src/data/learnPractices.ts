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
    title: 'Study',
    path: '/learn/renew/study',
    summary:
      'Guided readings with contextual notes, timelines, and cross-references so you can build a whole-Bible view of each passage.',
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
  {
    id: 'silence',
    title: 'Silence',
    path: '/learn/renew/silence',
    summary:
      'Lectio divina inspired pauses that create space to listen for the Spirit’s gentle guidance and conviction.',
    practices: [
      'Set a timer for five minutes of quiet after reading; notice what the Spirit highlights.',
      'Hold a single verse in silence, letting each phrase breathe before moving on.',
      'Close with gratitude, naming specific gifts you received in the stillness.',
    ],
  },
  {
    id: 'rest',
    title: 'Rest',
    path: '/learn/renew/rest',
    summary:
      'Sabbath-shaped rhythms that protect margin, restore delight, and keep Jesus at the center of every pursuit.',
    practices: [
      'Block a weekly Sabbath window and guard it like any vital meeting.',
      'Plan restorative practices: a slow walk, worship playlist, or family meal.',
      'End the day by surrendering upcoming work back to the Lord in prayer.',
    ],
  },
]

export const learnNavItems: LearnNavEntry[] = [
  {
    id: 'renew',
    label: 'Renew the Mind',
    description:
      'Scripture-first journeys that help you meditate on truth, build rhythms of reflection, and let the Word reshape your thinking each day.',
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
