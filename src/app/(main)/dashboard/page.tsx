'use client'
import React from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
const Dashboard = () => {

  return (
    <div>
      <Button onClick={()=>{
         signOut()
         redirect("/sign-in")
      }}>
        Sign Out 
      </Button>
    </div>
  )
}

export default Dashboard