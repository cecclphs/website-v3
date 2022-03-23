import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import cecLogo from '../../public/cec-logo-gradient-no-text.png';

const NavbarLink = ({href, label}:{href: string, label: string}) => (
    <Link href={href}> 
        <a className="text-gray-800 hover:text-gray-900 text-lg">{label}</a>
    </Link>
)

const Navbar = () => {
    const { initGoogleSignIn } = useAuth();
    return <nav className="sticky h-16 flex flex-row justify-between w-full">
        <div className="py-4 w-24">
            <Image src={cecLogo} className="object-fill"/>
        </div>
        <div className="p-4 w-32"></div>
        <div className="grid place-items-center">
            <button className="rounded-full text-base py-2 px-4 text-blue-50 appearance-none font-medium transition hover:scale-105 bg-gradient-to-br from-sky-400 to-indigo-900"
                onClick={e => initGoogleSignIn()}>Dashboard</button>
        </div>
    </nav>
}

export default Navbar;