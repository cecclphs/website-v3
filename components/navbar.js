import Image from 'next/image';
import Link from 'next/link';
import cecLogo from '../public/cec-logo-gradient-no-text.png';

const NavbarLink = ({href, label}) => (
    <Link href={href}> 
        <a className="text-gray-800 hover:text-gray-900 text-lg">{label}</a>
    </Link>
)

const Navbar = () => {
    return <nav className="sticky h-16 flex flex-row justify-between w-full">
        <div className="py-4 w-24">
            <Image src={cecLogo} className="object-fill"/>
        </div>
        <div className="p-4 w-32"></div>
    </nav>
}

export default Navbar;