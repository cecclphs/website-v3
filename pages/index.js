import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="h-screen grid place-items-center">
      <Head>
        <title>Creative Electronics Club</title>
        <meta name="description" content="CEC on Next.js ??!! WIP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col space-y-3 px-6 py-2">
        <h1 className="text-5xl font-bold">
          Welcome to CEC v3 <span className="text-xs">i think?</span>
        </h1>
        <p className="text-xl"> Doesn&apost matter. </p>
        <p className="text-xl"> We&aposll try to do it properly this time. </p>
        <h3 className="font-semibold text-2xl">Roadmap </h3>
        <ul className="list-inside list-disc text-gray-500">
          <li className="animate-pulse text-blue-900">Design Homepage UI ← We're here</li>
          <li>Complete Homepage</li>
          <li>Link Redirects</li>
          <li>Implement Auth</li>
          <li>Migrate users to School Accounts</li>
        </ul>
      </main>
    </div>
  )
}
