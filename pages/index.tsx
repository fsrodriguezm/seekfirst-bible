import Head from 'next/head'
import type { NextPage } from 'next'
import App from '../src/App'

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>SeekFirst Bible - Read and Study Scripture</title>
        <meta name="description" content="Read and study the Bible with cross-references, context, and multiple translations. SeekFirst Bible helps you explore Scripture deeply with powerful tools for biblical study." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="canonical" href="https://seekfirstbible.com/" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <App />
    </>
  )
}

export default HomePage
