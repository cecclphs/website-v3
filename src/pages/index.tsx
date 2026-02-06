import { Google } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import CECLogo from "../components/CECLogo";
import { useAuth } from "../hooks/useAuth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";

const Home = () => {
  const { initGoogleSignIn } = useAuth();
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex w-screen h-screen items-center justify-center">
        <CircularProgress size={60} />
      </div>
    );
  }

  return (
    <div className="flex flex-row w-screen h-screen divide divide-x divide-gray-300 divide-solid">
      <div className="flex-[2] grid place-items-center">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-row space-x-3 text-gray-800">
            <span className="text-6xl font-bold">{"Welcome to "}</span>
            <CECLogo className="h-14 object-contain" />
          </div>
          <p>Are you a CEC Member? </p>
          <p className="text-sm text-gray-500">
            If you have issues logging in, make sure that you have 3rd party
            cookies turned on.{" "}
          </p>
        </div>
      </div>
      <div className="flex-1 grid place-items-center">
        <Button startIcon={<Google />} onClick={initGoogleSignIn} size="large">
          Sign In with Google
        </Button>
      </div>
    </div>
  );
};

export default Home;
