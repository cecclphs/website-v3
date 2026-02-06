import { Google } from '@mui/icons-material';
import { Button } from '@mui/material';
import CECLogo from '../components/CECLogo';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { initGoogleSignIn } = useAuth();
  return <div className="flex flex-col sm:flex-row w-screen h-screen sm:divide sm:divide-x divide-gray-300 divide-solid">
    <div className="flex-1 sm:flex-[2] grid place-items-center p-6 sm:p-8">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 text-gray-800">
          <span className="text-3xl sm:text-6xl font-bold">{"Welcome to "}</span>
          <CECLogo className="h-10 sm:h-14 object-contain"/>
        </div>
        <p>Are you a CEC Member? </p>
        <p className="text-sm text-gray-500">If you have issues logging in, make sure that you have 3rd party cookies turned on. </p>
        {/* Show sign-in button inline on mobile */}
        <div className="sm:hidden pt-4">
          <Button startIcon={<Google/> } onClick={initGoogleSignIn} size="large" variant="contained" fullWidth>Sign In with Google</Button>
        </div>
      </div>
    </div>
    <div className='flex-1 hidden sm:grid place-items-center'>
      <Button startIcon={<Google/> } onClick={initGoogleSignIn} size="large">Sign In with Google</Button>
    </div>
  </div>
}

export default Home;
