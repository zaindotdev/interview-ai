'use client'
import React from 'react'
import { SessionProvider } from "next-auth/react"
import { SocketProvider } from '@/context/socket-provider'
interface Props {
    children: React.ReactNode
}
const Providers: React.FC<Props> = ({ children }) => {
    return (
        <SocketProvider>
            <SessionProvider>{children}</SessionProvider>
        </SocketProvider>
    )
}

export default Providers