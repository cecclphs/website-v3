import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../components/navbar'
import Makerspace from '../public/images/activities/hand_no_gatai_but_dissapointed.jpg';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>Creative Electronics Club</title>
        <meta name="description" content="CEC on Next.js ??!! WIP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full">
        <Navbar />
        <header className="relative h-[610px]">
          <div className="absolute w-full h-full z-10 bg-black opacity-50"></div>
          <div className="absolute w-full h-full z-0 flex flex-col justify-center overflow-hidden">
            <Image src={Makerspace} className="h-full object-cover"/>
          </div>
          <div className="absolute w-full h-full z-20 px-4 py-10 flex flex-row">
            <div className="flex-1 flex flex-col justify-center px-24 space-y-4">
              <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Creative Electronics Club</h1>
              <h2 className="text-white font-semibold text-xl">@Chung Ling Private High School</h2>
            </div>
            <div className="flex-1"></div>
          </div>
        </header>
      </main>
    </div>
  )
}
