import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../components/navbar'
import PISF from '../public/images/activities/2019pisf.JPG';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-row justify-center bg-blue-50">
      <Head>
        <title>Creative Electronics Club</title>
        <meta name="description" content="CEC on Next.js ??!! WIP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full max-w-[1140px] px-4 md:px-12">
        <Navbar />
        <header className="">
          <div className="flex flex-col md:flex-row pt-12 pb-5 space-y-8 md:space-y-0 md:space-x-12 mb-8">
            <div className="flex-1 space-y-5">
              <h1 className="text-5xl font-bold text-blue-900 leading-tight">Creative <br/> Electronics <br/>Club</h1>
              <h3 className="text-xl font-bold text-gray-500">@Chung Ling Private High School</h3>
            </div>
            <h4 className="text-xl text-medium pt-3 flex-1 text-blue-900 leading-relaxed">We are a <span className="font-bold">student led club</span> empowered by passion and curiosity since 2014. Coached by passionate professional parents.</h4>
          </div>
          <div className="relative overflow-hidden rounded-xl w-full">
            <Image src={PISF} alt="Penang International Science Fair 2019" className="object-cover" width={1140} height={610} />
          </div>
        </header>
      </main>
    </div>
  )
}
