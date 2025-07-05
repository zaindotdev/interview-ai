'use client';

import React, { useEffect } from 'react';
import { Meteors } from '@/components/magicui/meteors';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

type Props = { children: React.ReactNode };
const authPages = ['/sign-in', '/sign-up', '/verify'];

const RootLayout = ({ children }: Props) => {
  const { status } = useSession();      
  const pathname  = usePathname();      
  const router    = useRouter();

  useEffect(() => {
    if (status === 'loading') return;   

    const onAuthPage = authPages.includes(pathname);
    if (status === 'unauthenticated') {
      if (!onAuthPage) router.replace('/sign-in');
      return;
    }

    if (status === 'authenticated' && onAuthPage) {
      router.replace('/dashboard');
    }
  }, [status, pathname, router]);

  return (
    <main className="container mx-auto w-full min-h-screen overflow-hidden">
      <Meteors number={10} />
      <div className="flex min-h-screen w-full items-center justify-center">
        {children}
      </div>
    </main>
  );
};

export default RootLayout;
