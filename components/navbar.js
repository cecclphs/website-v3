import Image from 'next/image';
import Link from 'next/link';
import cecLogo from '../public/cec-logo-gradient-no-text.png';

const NavbarLink = ({href, label}) => (
    <Link href={href}> 
        <a className="text-gray-800 hover:text-gray-900 text-lg">{label}</a>
    </Link>
)

const Navbar = () => {
    return <nav className="h-16 flex flex-row justify-between w-screen relative">
        <div className="p-4 w-32">
            <Image src={cecLogo} className="object-fill"/>
        </div>
        <div className="flex flex-row flex-1 items-center justify-center h-full space-x-6">
            <NavbarLink href="/" label="Home" />
            <NavbarLink href="/about" label="About" />
            <NavbarLink href="/achievements" label="Achievements" />
            <NavbarLink href="/Projects" label="Projects" />
            <NavbarLink href="/Lessons" label="Lessons" />
        </div>
        <div className="p-4 w-32"></div>
    </nav>
}

export default Navbar;