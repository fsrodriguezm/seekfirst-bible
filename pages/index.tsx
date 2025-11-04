import Head from 'next/head'
import type { NextPage } from 'next'
import App from '../src/App'

type NextPageWithOptions = NextPage & {
  showFloatingThemeToggle?: boolean
}

const HomePage: NextPageWithOptions = () => {
  return (
    <>
      <Head>
        <title>SeekFirst</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <App />
    </>
  )
}

HomePage.showFloatingThemeToggle = false

export default HomePage
