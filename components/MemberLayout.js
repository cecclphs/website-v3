import { AccountCircle, Home, LogoutRounded } from "@mui/icons-material";
import Head from "next/head";
import SlideTransition from "./SlideTransition/SlideTransition";
import Link from 'next/link';
import { useRouter } from 'next/router';
import CECLogo from "./CECLogo";
import { IconButton, Tooltip } from "@mui/material";

const MemberLayout =  ({ children }) => {
    const router = useRouter();

    const links = [
        { href: "/dashboard", label: "Dashboard", Icon: Home },
        { href: "/profile", label: "Profile", Icon: AccountCircle },
    ]

    return <div className="min-h-screen w-screen grid grid-cols-[13rem_1fr] gap-1 max-w-[84rem] px-4">
        <Head>
            <title>Member</title>
        </Head>
        <aside className="flex flex-col max-h-screen pt-8 sticky top-0">
            <header className="flex flex-row justify-between">
                <CECLogo className="h-10 py-2"/>
                <div className="flex flex-row space-y-2">
                    <Tooltip title="Logout">
                        <IconButton>
                            <LogoutRounded />
                        </IconButton>
                    </Tooltip>
                </div>
            </header>
            <h1 className="text-2xl font-semibold">Creative Electronics Club</h1>
            <div className="flex flex-col w-48 space-y-1 py-3">
                {links.map(({ href, label, Icon }) => <Link href={href} key={href}>
                    <div className={`px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex flex-row items-center text-sm font-medium space-x-2 ${router.asPath == href ? 'bg-blue-100 text-blue-600': 'text-neutral-700'}`}>
                        <Icon className="w-5 h-5"/> <span>{label}</span>
                    </div>
                </Link>)}
            </div>
        </aside>
        <SlideTransition in timeout={150}>
            <div className="flex flex-col">
                {children}
            </div>
        </SlideTransition>
    </div>
}

export default MemberLayout;