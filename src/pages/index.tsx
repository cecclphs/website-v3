import { Google } from '@mui/icons-material';
import { Button } from '@mui/material';
import CECLogo from '../components/CECLogo';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { initGoogleSignIn } = useAuth();
  return <div className="flex flex-row w-screen h-screen divide divide-x divide-gray-300 divide-solid">
    <div className="flex-1 grid place-items-center">
      <div className="flex flex-col space-y-2">
        <CECLogo className="h-10 object-contain"/>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to CEC
        </h1>
      </div>
    </div>
    <div className='flex-1 grid place-items-center'>
      <Button startIcon={<Google/> } onClick={initGoogleSignIn}>Sign In with Google</Button>
    </div>
  </div>
}

export default Home;