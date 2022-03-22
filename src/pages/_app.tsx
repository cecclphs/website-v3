import { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css'
import { AuthProvider } from '../hooks/useAuth'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return <AuthProvider>
    <div className='flex flex-col w-full items-center'>
      <Component {...pageProps} />
    </div>
  </AuthProvider>
}

export default MyApp
