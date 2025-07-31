'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import axios from 'axios'

const VerifyPage = () => {
    const email = useSearchParams().get("email");
    const router = useRouter();

    const verifyUser = useCallback(async () => {
    try {
        const response = await axios.patch("/api/user/verify", { email });
        if (response.status !== 200) {
            toast.error("We cannot verify your email", {
                description: "Try again later"
            });
            return;
        } else {
            toast.success("Email verified successfully");
            setTimeout(() => {
                router.replace("/dashboard");
            }, 1500); // Wait 1.5 seconds for toast
        }
    } catch (error) {
        console.error(error);
        toast.error("We cannot verify your email", {
            description: "There was an error verifying your email. Please try again later."
        });
    }
}, [email, router]);

    useEffect(() => {
        if(!email){
            router.replace("/sign-in")
            return
        }
        verifyUser()
    }, [email, verifyUser])
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