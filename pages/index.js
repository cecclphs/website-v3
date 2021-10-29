import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../components/navbar'
import PISF from '../public/images/activities/2019pisf.JPG';
import HandNotGataiButDissapointed from '../public/images/activities/hand_no_gatai_but_dissapointed.jpg';
import Activity2016 from '../public/images/activities/2016activity.jpg';
import { Fade, Grow, Slide } from '@mui/material';
import SlideTransition from '../components/SlideTransition/SlideTransition';
import { TransitionGroup } from 'react-transition-group';
import { InView } from 'react-intersection-observer';

const SectionHeader = ({ title, subtitle }) => (
  <InView triggerOnce threshold={0.5}>
    {({ inView, ref, entry }) => (
      <div ref={ref}>
        <SlideTransition in={inView} timeout={150}>
          <div className="flex flex-row justify-center">
            <div className="flex flex-col space-y-2 text-center py-12">
              <h2 className="text-blue-500 font-bold text-lg">{title}</h2>
              <h1 className="text-gray-700 font-bold text-4xl max-w-xl">{subtitle}</h1>
            </div>
          </div>
        </SlideTransition>
      </div>
    )}
  </InView>
)

const AchievementStats = ({ stat, title }) => (
  <div className="flex flex-col space-y-1 items-center pb-2 flex-1">
    <div className="flex-1"></div>
    <h2 className="font-semibold text-5xl text-gray-700">{stat}</h2>
    <p className="font-medium text-gray-500 w-max">{title}</p>
  </div>
)

const projects = [
  {
    name: 'Crabtastic',
    description: 'Crabtastic is a wonderful leaded by Fong Wee Kun because he is a kid and I have nothing else to say :(',
    image: '/images/activities/crabtastic.jpg'
  },
  {
    name: 'oHelmet',
    description: 'oHelmet is a helmet but for kids who want to play in caves.',
    image: '/images/activities/crabtastic.jpg'
  },
  {
    name: 'Smart Parking System',
    description: 'Smart Parking System is a smart parking system for kids who want to park in the car park.',
    image: '/images/activities/crabtastic.jpg'
  },
  {
    name: 'Egg Cooker Assist',
    description: 'Egg Cooker Assist is a Egg cooker that is so easy to cook that you cannot possibly fuckup an egg',
    image: '/images/activities/crabtastic.jpg'
  }
]

const achievements = [
  {
    name: 'APICTA 2019 Hanoi',
    prizes: ['Winner'],
    image: '/images/activities/2019apictahanoi.jpg'
  },
  {
    name: 'International Youth UAV Science Camp and Competition',
    prizes: ['First Place'],
    image: '/images/activities/2019iyuavscc.JPG'
  },
  {
    name: 'Tan Kah Kee Young Inventors Competition',
    prizes: ['5th Year Continuous Overall Winners'],
    image: '/images/activities/2019iyuavscc.JPG'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-50 landing-page">
      <Head>
        <title>Creative Electronics Club</title>
        <meta name="description" content="CEC on Next.js ??!! WIP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full max-w-[1140px] px-4 md:px-12">
        <Navbar />
        <SlideTransition in timeout={150}>
          <header className=""> {/*  Header Section */}
            <div className="flex flex-col md:flex-row pt-12 pb-5 space-y-8 md:space-y-0 md:space-x-12 mb-8">
              <div className="flex-1 space-y-5">
                <h1 className="text-5xl font-bold text-blue-900 leading-tight">
                  Creative <br /> Electronics <br />Club
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
        </SlideTransition>
        <section className="py-8"> {/*  What We Do Section */}
          <SectionHeader title="WHAT WE DO" subtitle="We Teach Students??? Yea something like that" />
          <div className="space-y-6">
            <InView triggerOnce>
              {({ inView, ref, entry }) => (
                <div ref={ref}>
                  <SlideTransition in={inView} timeout={150}>
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
                  </SlideTransition>
                </div>)}
            </InView>
            <InView triggerOnce>
              {({ inView, ref, entry }) => (
                <div ref={ref}>
                  <SlideTransition in={inView} timeout={150}>
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
                  </SlideTransition>
                </div>)}
            </InView>
          </div>
        </section>
        <section className="py-8"> {/*  Our Projects */}
          <SectionHeader title="OUR PROJECTS" subtitle="Check out some of the amazing projects we’ve done so far" />
          <InView triggerOnce>
            {({ inView, ref, entry }) => (
              <div ref={ref}  className="grid grid-cols-4 space-x-4">
                {projects.map(({ name, description, image }) =>
                  <SlideTransition in={inView} timeout={150} key={name}>
                    <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
                      <div className="flex-1 relative">
                        <Image className="object-cover" src={image} width="400" height="200" />
                      </div>
                      <div className="flex-1 px-4 py-3">
                        <h3 className="font-bold text-xl text-blue-900">{name}</h3>
                        <h3 className="font-normal text-normal text-gray-500 break-words">{description}</h3>
                      </div>
                    </div>
                  </SlideTransition>)}
              </div>)}
          </InView>
        </section>
        <section className="py-8"> {/*  Our Achievements */}
          <div className="flex flex-col lg:flex-row justify-between py-12">
            <div className="flex flex-col space-y-2 text-left">
              <h2 className="text-blue-500 font-bold text-lg">OUR ACHIEVEMENTS</h2>
              <h1 className="text-gray-700 font-bold text-4xl max-w-xl">We're proud of all our achievements</h1>
            </div>
            <div className="flex flex-row flex-1 pt-8 lg:pt-0">
              <AchievementStats stat="80+" title="Prizes Won"/>
              <AchievementStats stat="20+" title="Top 3 Prizes"/>
              <AchievementStats stat="30+" title="Competitions Joined"/>
            </div>
          </div>
          <InView triggerOnce>
            {({ inView, ref, entry }) => (
              <div className="grid grid-cols-3 space-x-4" ref={ref}>
                {achievements.map(({ name, prizes, image }) =>
                  <SlideTransition in={inView} timeout={150} key={name}>
                    <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
                      <div className="flex-1 relative h-96">
                        <Image className="object-cover h-full" src={image} width="400" height="200" />
                      </div>
                      <div className="flex-1 px-4 py-3">
                        <h3 className="font-bold text-xl text-blue-900">{name}</h3>
                        {prizes.map( prize => <h3 className="font-semibold text-xl text-gray-500 break-words" key={prize}>{prize}</h3> )}
                      </div>
                    </div>
                  </SlideTransition>)}
              </div>)}
          </InView>
        </section>
        <section className="py-8"> {/*  Our Activites */}
          <SectionHeader title="OUR ACTIVITES" subtitle="Sadly, Life isn't just about Electronics :(" />
          <InView triggerOnce>
            {({ inView, ref, entry }) => (
              <div ref={ref}   className="grid grid-cols-4 space-x-4">
                {projects.map(({ name, description, image }) =>
                  <SlideTransition in={inView} timeout={150} key={name}>
                    <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
                      <div className="flex-1 relative">
                        <Image className="object-cover" src={image} width="400" height="200" />
                      </div>
                      <div className="flex-1 px-4 py-3">
                        <h3 className="font-bold text-xl text-blue-900">{name}</h3>
                        <h3 className="font-normal text-normal text-gray-500 break-words">{description}</h3>
                      </div>
                    </div>
                  </SlideTransition>)}
              </div>)}
          </InView>
        </section>
        <div className="h-12"></div> {/*  Spacecr */}
      </main>
      <footer className="bg-white px-4 py-12 w-screen flex flex-row justify-center">
        <div className="flex flex-col space-y-4  max-w-[1140px]">
          <div className="flex flex-row space-x-4">
            <div className="flex flex-col space-y-2">
              <h3 className="text-gray-700 font-bold text-lg">Contact Us</h3>
              <p className="text-gray-600 font-normal text-xl">
                <a target="_blank" href="mailto:cec@clphs.edu.my" className="text-blue-500">cec@clphs.edu.my </a>
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-gray-700 font-bold text-lg">Follow Us</h3>
              <p className="text-gray-600 font-normal text-xl">
                <a target="_blank" href="https://www.facebook.com/clphscec" className="text-blue-500">Facebook</a>
              </p>
              <p className="text-gray-600 font-normal text-xl">
                <a target="_blank" href="https://www.instagram.com/cec_clphs" className="text-blue-500">Instagram</a>
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <h3 className="text-gray-700 font-bold text-lg">About Us</h3>
            <p className="text-gray-600 font-normal text-xl">
              We are a <span className="font-bold">student led club</span> empowered by passion and curiosity since 2014. Coached by passionate professional parents.
            </p>
          </div>
        </div>
      </footer>
      <style jsx>
        {`
          .landing-page {
	          font-family: 'THICCCBOI','Inter', 'Roboto', sans-serif;
          }
        `}
      </style>
    </div>
  )
}
