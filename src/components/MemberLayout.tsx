import React, { FC, useState } from 'react';
import { AccountCircle, AdminPanelSettingsRounded, AppsTwoTone, CardMembershipRounded, ClassRounded, Home, LinkRounded, LogoutRounded, MenuRounded, CloseRounded } from "@mui/icons-material";
import Head from "next/head";
import SlideTransition from "./SlideTransition/SlideTransition";
import Link from 'next/link';
import { useRouter } from 'next/router';
import CECLogo from "./CECLogo";
import { Collapse, Drawer, IconButton, Tooltip } from "@mui/material";
import { useAuth } from '../hooks/useAuth';
import UserToken from '../types/UserToken';

type LinkData = {
    href?: string,
    label: string,
    children?: LinkData[],
    Icon: FC<{className:  string}>,
    permission?: string[]
}

const LinkItem = ({ href, label, children, Icon, permission = ['isStudent'], onNavigate }: LinkData & { onNavigate?: () => void }) => {
    const router = useRouter();
    const [extended, setExtended] = useState(router.asPath.startsWith(href));
    const { userToken } = useAuth();
    const hasPermission = permission.some((p) => userToken?.[p as keyof UserToken] === true);
    if(!hasPermission) return <></>
    if(children) {
        return <div key={href} className="flex flex-col">
            <div onClick={() => setExtended(!extended)} className={`cursor-pointer px-4 py-3 sm:py-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors flex flex-row items-center text-sm font-medium space-x-2`}>
                <Icon className="w-5 h-5"/> <span>{label}</span>
            </div>
            <Collapse in={extended}>
                <div className="flex flex-col pl-4">
                    {children.map((props) => <LinkItem key={props.href} {...props} onNavigate={onNavigate} />)}
                </div>
            </Collapse>
        </div>
    }
    return <Link href={href} key={href}>
        <div
            onClick={onNavigate}
            className={`cursor-pointer px-4 py-3 sm:py-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors flex flex-row items-center text-sm font-medium space-x-2 ${router.asPath === href ? 'bg-blue-100 text-blue-600': 'text-neutral-700'}`}
        >
            <Icon className="w-5 h-5"/> <span>{label}</span>
        </div>
    </Link>
}

// Bottom navigation for mobile - shows only top-level items
const BottomNavItem = ({ href, label, Icon, permission = ['isStudent'] }: LinkData) => {
    const router = useRouter();
    const { userToken } = useAuth();
    const hasPermission = permission.some((p) => userToken?.[p as keyof UserToken] === true);
    if(!hasPermission) return null;
    const isActive = router.asPath === href || router.asPath.startsWith(href + '/');
    return <Link href={href || '#'}>
        <div className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] ${isActive ? 'text-blue-600' : 'text-neutral-500'}`}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-tight">{label}</span>
        </div>
    </Link>
}

const MemberLayout: FC<{children: React.ReactChild | React.ReactChildren}>  =  ({ children }) => {
    const router = useRouter();
    const { user, userToken, signOut } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const links: LinkData[] = [
        { href: "/dashboard", label: "Dashboard", Icon: Home },
        { href: "/profile", label: "Profile", Icon: AccountCircle },
        { label: "Admin", href: "/admin", permission: ['isAdmin'], children: [
            { href: "/admin/links", label: "Links", Icon: LinkRounded },
            { href: "/admin/cards", label: "Cards", Icon: CardMembershipRounded },
        ], Icon: AdminPanelSettingsRounded },
        { href: "/students", label: "Students", permission: ['isAdmin'], Icon: ClassRounded },
        { href: "/attendance/view", permission: ['isAdmin'], label: "Attendance", Icon: AppsTwoTone},
    ]

    return <div className="min-h-screen w-screen pb-14 sm:pb-0 sm:grid grid-cols-[14rem_1fr] gap-1 max-w-[84rem] sm:px-4">
        <Head>
            <title>Member</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </Head>

        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden sm:flex flex-col w-auto max-h-screen pt-8 sticky top-0 print:hidden px-4">
            <header className="flex flex-row justify-between items-center">
                <CECLogo className="h-10 py-2"/>
                <div className="flex flex-row space-x-2 items-center">
                    <Tooltip title={`${userToken?.englishName} ${userToken?.chineseName}`}>
                        <img src={user?.photoURL+'?'+Date.now()} className="w-10 h-10 rounded-full object-cover" alt="User Profile"/>
                    </Tooltip>
                    <Tooltip title="Logout">
                        <IconButton onClick={signOut}>
                            <LogoutRounded />
                        </IconButton>
                    </Tooltip>
                </div>
            </header>
            <h1 className="text-2xl font-semibold">Creative Electronics Club</h1>
            <div className="flex flex-col w-48 space-y-1 py-3">
                {links.map((props) => <LinkItem key={props.href} {...props}/>)}
            </div>
        </aside>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-t border-gray-200 print:hidden">
            <div className="flex flex-row justify-around items-center px-1 pb-[env(safe-area-inset-bottom)]">
                {links.filter(l => !l.children).map((props) => <BottomNavItem key={props.href} {...props}/>)}
                <div
                    onClick={() => setDrawerOpen(true)}
                    className="flex flex-col items-center justify-center py-1 px-2 min-w-[56px] text-neutral-500 cursor-pointer"
                >
                    <MenuRounded className="w-5 h-5" />
                    <span className="text-[10px] mt-0.5 leading-tight">More</span>
                </div>
            </div>
        </nav>

        {/* Mobile Drawer for full navigation */}
        <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{ sx: { width: '75vw', maxWidth: 300 } }}
        >
            <div className="flex flex-col h-full">
                <div className="flex flex-row items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex flex-row items-center space-x-2">
                        <img src={user?.photoURL+'?'+Date.now()} className="w-10 h-10 rounded-full object-cover" alt="User Profile"/>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{userToken?.englishName}</span>
                            <span className="text-xs text-gray-500">{userToken?.chineseName}</span>
                        </div>
                    </div>
                    <IconButton onClick={() => setDrawerOpen(false)} size="small">
                        <CloseRounded />
                    </IconButton>
                </div>
                <div className="flex flex-col flex-1 p-2 space-y-1 overflow-y-auto">
                    {links.map((props) => <LinkItem key={props.href} {...props} onNavigate={() => setDrawerOpen(false)} />)}
                </div>
                <div className="p-4 border-t border-gray-200">
                    <div
                        onClick={() => { signOut(); setDrawerOpen(false); }}
                        className="cursor-pointer px-4 py-3 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors flex flex-row items-center text-sm font-medium space-x-2 text-red-600"
                    >
                        <LogoutRounded className="w-5 h-5" /> <span>Logout</span>
                    </div>
                </div>
            </div>
        </Drawer>

        {/* Main Content */}
        <SlideTransition in timeout={150}>
            <div className="flex flex-col overflow-hidden">
                {children}
            </div>
        </SlideTransition>
    </div>
}

export default MemberLayout;
