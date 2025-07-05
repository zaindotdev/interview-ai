'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect } from 'react'
import { useSession } from "next-auth/react"
import { redirect, useSearchParams } from 'next/navigation'

const VerifyPage = () => {
    const { data: session } = useSession();
    const email = useSearchParams().get("email");

    useEffect(() => {
        if (email === session?.user?.email) {
            redirect("/dashboard");
        } else {
            redirect("/sign-in")
        }
    }, [email, session])
    return (
        <section className='w-full min-h-screen flex items-center justify-center'>
            <Card className='max-w-lg w-full'>
                <CardHeader>
                    <CardTitle>
                        <h1 className='text-xl md:text-2xl/8 text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-center'>Verify Your Email</h1>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        <p className='text-center'>We have sent a verification link to your email address. Please check your inbox and follow the instructions to verify your account.</p>
                    </CardDescription>
                </CardContent>
            </Card>
        </section>
    )
}

export default VerifyPage