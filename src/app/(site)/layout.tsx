import React from 'react'
import Background from "@/components/shared/background";
import Header from '@/components/shared/header';
import Footer from '@/components/shared/footer';

type Props = {
    children:React.ReactNode
}

const Layout = ({children}: Props) => {
  return (
    <main className='w-full min-h-screen dark:bg-zinc-900 bg-zinc-100'>
      <Header/>
        <Background/>
        <div className='container mx-auto flex flex-col items-center justify-center min-h-screen z-[1]'>
            {children}
        </div>
        <Footer/>
    </main>
  )
}

export default Layout