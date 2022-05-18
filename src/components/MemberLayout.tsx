import React, { Component, FC, PropsWithChildren, PropsWithoutRef, ReactChildren, ReactElement, useState } from 'react';
import { AccountCircle, AdminPanelSettingsRounded, AppRegistrationTwoTone, AppShortcutTwoTone, AppsTwoTone, CardMembershipRounded, ClassRounded, DesignServicesTwoTone, Home, LinkRounded, LogoutRounded, PrecisionManufacturingTwoTone } from "@mui/icons-material";
import Head from "next/head";
import SlideTransition from "./SlideTransition/SlideTransition";
import Link from 'next/link';
import { useRouter } from 'next/router';
import CECLogo from "./CECLogo";
import { Collapse, IconButton, Tooltip } from "@mui/material";
import { useAuth } from '../hooks/useAuth';
import UserToken from '../types/UserToken';
import AccountBalanceTwoToneIcon from '@mui/icons-material/AccountBalanceTwoTone';

type LinkData = {
    href?: string, 
    label: string, 
    children?: LinkData[], 
    Icon: FC<{className:  string}>, 
    permission?: string[]
}

const LinkItem = ({ href, label, children, Icon, permission = ['isStudent'] }: LinkData) => {
    const router = useRouter();
    const [extended, setExtended] = useState(router.asPath.startsWith(href));
    const { userToken } = useAuth();
    // check if userToken has any one of permission
    const hasPermission = permission.some((p) => userToken?.[p as keyof UserToken] == true);
    if(!hasPermission) return <></>
    if(children) {
        return <div key={href} className="flex flex-col">
            <div onClick={() => setExtended(!extended)} className={`cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex sm:flex-row flex-col items-center text-sm font-medium sm:space-x-2`}>
                <Icon className="w-5 h-5 text-sm sm:text-base"/> <span>{label}</span>
            </div>
            <Collapse in={extended}>
                <div className="flex flex-col sm:pl-4">
                    {children.map((props) => <LinkItem key={props.href} {...props}/>)}
                </div>
            </Collapse>
        </div>
    }
    return <Link href={href} key={href}>
        <div className={`cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex sm:flex-row flex-col items-center text-sm font-medium sm:space-x-2 ${router.asPath == href ? 'bg-blue-100 text-blue-600': 'text-neutral-700'}`}>
            <Icon className="w-5 h-5 text-sm sm:text-base"/> <span>{label}</span>
        </div>
    </Link>
}

const MemberLayout: FC<{children: React.ReactChild | React.ReactChildren}>  =  ({ children }) => {
    const router = useRouter();
    const { user, userToken, signOut } = useAuth();

    const links = [
        { href: "/dashboard", label: "Dashboard", Icon: Home },
        { href: "/profile", label: "Profile", Icon: AccountCircle },
        { href: "/facility", label: "Facility", Icon: PrecisionManufacturingTwoTone },
        { label: "Admin", href: "/admin", permission: ['isAdmin'], children: [
            { href: "/admin/links", label: "Links", Icon: LinkRounded },
            { href: "/admin/fabrication", label: "Fabrication", Icon: DesignServicesTwoTone },
            { href: "/admin/cards", label: "Cards", Icon: CardMembershipRounded },
        ], Icon: AdminPanelSettingsRounded },
        { href: "/students", label: "Students", permission: ['isAdmin'], Icon: ClassRounded },
        { href: "/attendance/view", permission: ['isAdmin'], label: "Attendance", Icon: AppsTwoTone},
        { href: "/finance", permission: ['isAdmin'], label: "Finance", Icon: AccountBalanceTwoToneIcon },
        { href: "/inventory", permission: ['isAdmin'], label: "Inventory", Icon: AppsTwoTone},
    ]

    return <div className="min-h-screen w-screen pb-12 sm:pb-0 sm:grid grid-cols-[14rem_1fr] gap-1 max-w-[84rem] sm:px-4">
        <Head>
            <title>Member</title>
        </Head>
        <aside className="flex flex-col w-screen fixed sm:w-auto sm:max-h-screen sm:pt-8 sm:sticky bottom-0 top-auto sm:top-0 sm:bottom-auto print:hidden shadow-lg z-50 sm:px-4">
            <header className="flex-row justify-between items-center sm:flex hidden">
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
            <h1 className="text-2xl font-semibold sm:block hidden">Creative Electronics Club</h1>
            <div className="flex sm:flex-col flex-row space-x-1 sm:space-x-0 w-screen sm:w-48 sm:space-y-1 sm:py-3 bg-white/80 backdrop-blur overflow-hidden">
                {links.map((props) => <LinkItem key={props.href} {...props}/>)}
            </div>
        </aside>
        <SlideTransition in timeout={150}>
            <div className="flex flex-col overflow-hidden">
                {children}
            </div>
        </SlideTransition>
    </div>
}

export default MemberLayout;