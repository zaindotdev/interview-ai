'use client'
import React, { useEffect } from 'react'
import { Meteors } from "@/components/magicui/meteors";
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

type Props = {
    children: React.ReactNode
}

const Layout = ({ children }: Props) => {
    const { status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const allowedPaths = ["/sign-in", "/sign-up", "/verify"];

        if (status === "loading") return;

        if (status === "unauthenticated" && !allowedPaths.includes(pathname)) {
            router.replace("/sign-in");
        } else if (status === "authenticated" && allowedPaths.includes(pathname)) {
            router.replace("/dashboard");
        }
    }, [status, pathname, router])

    return (
        <main className={"relative container w-full min-h-screen mx-auto overflow-hidden"}>
            <Meteors number={10} className='z-[-1]' />
            <div className={"w-full min-h-screen flex items-center justify-center"}>
                {children}
            </div>
        </main>
    )
}

export default Layout
