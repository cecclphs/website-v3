import { createTheme, ThemeProvider } from '@mui/material'
import { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css'
import { AuthProvider } from '../hooks/useAuth'
import DialogProvider from '../hooks/useDialog'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {

  const theme = createTheme({
    typography:{  
      fontFamily: "'Inter', sans-serif",
    }
  })
  return <AuthProvider>
    <ThemeProvider theme={theme}>
      <DialogProvider>
        <div className='flex flex-col w-full items-center'>
          <Component {...pageProps} />
        </div>
      </DialogProvider>
    </ThemeProvider>
  </AuthProvider>
}

export default MyApp
