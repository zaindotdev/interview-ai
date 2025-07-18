'use client';

import React, { useEffect } from 'react';
import { Meteors } from '@/components/magicui/meteors';
import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import { toast } from 'sonner';

type Props = { children: React.ReactNode };
const authPages = ['/sign-in', '/sign-up', '/verify'];

const RootLayout = ({ children }: Props) => {
  const { status,data:session } = useSession();      
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

  

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: "/sign-in",
        redirect: true,
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong", {
        description: "Something went wrong while signing you out",
      });
    }
  };


  return (
    
    <main className="container mx-auto w-full min-h-screen overflow-hidden p-4">
      <Meteors number={20} />
      <header className="mb-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
              Welcome <span className="text-primary">{session?.user?.name}</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              You are logged in as{" "}
              <span className="text-primary text-sm md:text-base">{session?.user?.email}</span>
            </p>
          </div>
          <div>
            <Button
              onClick={handleSignOut}
              className="cursor-pointer"
              variant={"primary"}
            >
              <LogOut/>
              Logout
            </Button>
          </div>
        </div>
        <Separator className="my-4 border border-primary" />
      </header>
      <div className="min-h-screen w-full">
        {children}
      </div>
    </main>
  );
};

export default RootLayout;
