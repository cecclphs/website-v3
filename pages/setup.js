import { Button } from "@mui/material";
import SlideTransition from "../components/SlideTransition/SlideTransition";

const Paper = ({children}) => (
    <SlideTransition in timeout={50}>
        <div className="bg-white opacity-85 shadow-lg border rounded-md max-w-[990px] p-6 m-4">
            {children}
        </div>
    </SlideTransition>
)

const MigrateUser = () => {
    return <Paper>
        <h1 className="text-2xl font-medium">Migrate User</h1>
        <h3 className="text-lg text-gray-500">We've found that you have a existing account on the old site, Please to see if we have your details correct.</h3>
        <div className="space-x-2 float-right">
            <Button variant="contained" color="primary">Edit</Button>
            <Button variant="contained" color="primary">Continue</Button>
        </div>
    </Paper>
}

const Setup = () => {
    return (
        <div className="w-screen h-screen background">
            <div className="w-full h-full grid place-items-center">
                <MigrateUser />
            </div>
            <style jsx>{`
                .background {
                    background-size: 100%;
                    background-image: radial-gradient(circle   at  85% 100%, #fff 20%, rgba(255, 255, 255, 0)), radial-gradient(80%  80% at  15% 100%, rgba(255, 170, 0, 0.1) 25%, rgba(255, 0, 170, 0.1) 50%, rgba(255, 0, 170, 0) 100%), linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0)), radial-gradient(60% 180% at 100%  15%, rgba(0, 255, 170, 0.3) 25%, rgba(0, 170, 255, 0.2) 50%, rgba(0, 170, 255, 0) 100%), linear-gradient(hsla(256, 100%, 50%, 0.2), hsla(256, 100%, 50%, 0.2))
                }
            `}</style>
        </div>
    );
}

export default Setup;
