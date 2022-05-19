import { createTheme, ThemeProvider } from '@mui/material'
import { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css'
import { AuthProvider } from '../hooks/useAuth'
import DialogProvider from '../hooks/useDialog'
import { SnackbarProvider } from 'notistack';
import '../styles/globals.css'
import { LocalizationProvider } from '@mui/lab'
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import SuperJSON from 'superjson';

function MyApp({ Component, pageProps }: AppProps) {

  const theme = createTheme({
    typography:{  
      fontFamily: "'Inter', sans-serif",
    },
    palette: {
      primary: {
        //main should be dark navy blue
        main: '#004080',
      }
    }
  })
  return <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AuthProvider>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <DialogProvider>
            <div className='flex flex-col w-full items-center'>
              <Component {...pageProps} />
            </div>
          </DialogProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </AuthProvider>
  </LocalizationProvider>
}

export default MyApp
