import Head from 'next/head';
import React, { PropsWithChildren } from 'react';

export default function Page ({children, title}:{children:React.ReactNode, title:string}) {
    return <div className='px-4 py-8'>
        <Head>
            <title>{title} - CEC</title>
        </Head>
        <h1 className='text-3xl font-bold py-2 sm:py-4 print:hidden'>{title}</h1>
        {children}
    </div>
}