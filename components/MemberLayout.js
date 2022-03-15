import { AccountCircle, Home } from "@mui/icons-material";
import Head from "next/head";
import SlideTransition from "./SlideTransition/SlideTransition";
import Link from 'next/link';
import { useRouter } from 'next/router';

const MemberLayout =  ({ children }) => {
    const router = useRouter();

    const links = [
        { href: "/dashboard", label: "Dashboard", Icon: Home },
        { href: "/profile", label: "Profile", Icon: AccountCircle },
    ]

    return <div className="min-h-screen flex flex-row w-screen">
        <Head>
            <title>Member</title>
        </Head>
        <div className="flex flex-col w-48 space-y-1 p-3">
            {links.map(({ href, label, Icon }) => <Link href={href}>
                <div className={`px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex flex-row items-center text-sm font-medium space-x-2 ${router.asPath == href ? 'bg-blue-100 text-blue-600': 'text-neutral-700'}`}>
                    <Icon className="w-5 h-5"/> <span>{label}</span>
                </div>
            </Link>)}
        </div>
        <SlideTransition in timeout={150}>
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </SlideTransition>
    </div>
}

export default MemberLayout;