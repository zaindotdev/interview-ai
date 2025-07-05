import React from 'react'
import Header from '@/components/shared/header';
import Footer from '@/components/shared/footer';

type Props = {
    children:React.ReactNode
}

const Layout = ({children}: Props) => {
  return (
    <main className='w-full min-h-screen dark:bg-zinc-900 bg-zinc-100'>
        <Header/>
            {children}
        <Footer/>
    </main>
  )
}

export default Layout