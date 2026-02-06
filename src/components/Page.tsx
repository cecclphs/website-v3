import Head from 'next/head';
import React from 'react';

export default function Page ({children, title}:{children:React.ReactNode, title:string}) {
    return <div className='px-3 sm:px-4 py-4 sm:py-8 min-h-screen'>
        <Head>
            <title>{title} - CEC</title>
        </Head>
        <h1 className='text-2xl sm:text-3xl font-bold py-2 sm:py-4 print:hidden'>{title}</h1>
        {children}
    </div>
}