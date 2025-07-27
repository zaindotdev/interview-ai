'use client'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'
import React from 'react'

const Report = () => {
    const router = useRouter();
    return (
        <div className='w-full h-full flex items-center justify-center flex-col gap-4'>
            <p className='text-muted-foreground text-sm md:text-base'>Feature Coming Soon!</p>
            <Button onClick={() => router.push("/dashboard")} className='cursor-pointer'>
                Back to Dashboard
            </Button>
        </div>
    )
}

export default Report