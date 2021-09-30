import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../components/navbar'
import PISF from '../public/images/activities/2019pisf.JPG';
import HandNotGataiButDissapointed from '../public/images/activities/hand_no_gatai_but_dissapointed.jpg';
import Activity2016 from '../public/images/activities/2016activity.jpg';

const SectionHeader = ({ title, subtitle }) => (
  <div className="flex flex-row justify-center">
    <div className="flex flex-col space-y-2 text-center py-12">
      <h2 className="text-blue-500 font-bold text-lg">{title}</h2>
      <h1 className="text-gray-700 font-bold text-4xl max-w-xl">{subtitle}</h1>
    </div>
  </div>
)

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
        <header className=""> {/*  Header Section */}
          <div className="flex flex-col md:flex-row pt-12 pb-5 space-y-8 md:space-y-0 md:space-x-12 mb-8">
            <div className="flex-1 space-y-5">
              <h1 className="text-5xl font-bold text-blue-900 leading-tight">
                Creative <br/> Electronics <br/>Club
              </h1>
              <h3 className="text-xl font-bold text-gray-500">
                @Chung Ling Private High School
              </h3>
            </div>
            <h4 className="text-xl font-medium pt-3 flex-1 text-blue-900 leading-relaxed">
              We are a <span className="font-bold">student led club</span> empowered by passion and curiosity since 2014. Coached by passionate professional parents.
            </h4>
          </div>
          <div className="relative overflow-hidden rounded-xl w-full">
            <Image 
              src={PISF} 
              alt="Penang International Science Fair 2019" 
              className="object-cover" 
              width={1140} 
              height={610} />
          </div>
        </header>
        <section> {/*  What We Do Section */}
          <SectionHeader title="WHAT WE DO" subtitle="We Teach Students??? Yea something like that"/>
          <div className="space-y-6">
            <div className="flex flex-row space-x-10">
              <div className="relative flex-1">
                <Image 
                  src={HandNotGataiButDissapointed} 
                  alt="Coach Mr Boon Advising Students" 
                  className="w-full h-full object-cover overflow-hidden rounded-xl" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-gray-700 font-bold text-3xl">Learning Through Self-Discovery</h2>
                <p className="text-gray-600 font-normal text-xl">We guide students while they explore themselves. I dont know what to say here so please save me :P</p>
              </div>
            </div>
            <div className="flex flex-row space-x-10">
              <div className="flex-1 space-y-3">
                <h2 className="text-gray-700 font-bold text-3xl">Learning Through Self-Discovery</h2>
                <p className="text-gray-600 font-normal text-xl">We guide students while they explore themselves. I dont know what to say here so please save me :P</p>
              </div>
              
              <div className="relative flex-1">
                <Image 
                  src={Activity2016} 
                  alt="Students Making their Own Power Supply" 
                  className="object-cover overflow-hidden rounded-xl" />
              </div>
            </div>
          </div>
        </section>
        <section> {/*  What We Do Section */}
          <SectionHeader title="OUR PROJECTS" subtitle="Check out some of the amazing projects we’ve done so far"/>
          <div className="grid grid-cols-4">
          </div>
        </section>
      </main>
    </div>
  )
}
