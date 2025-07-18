import Image from 'next/image'
import React from 'react'

const AI = () => {
  return (
    <div className='rounded-xl overflow-hidden relative flex items-center justify-center h-full border-2 border-primary hover:ring-2 ring-primary duration-100 transition-all ease-linear md:aspect-video w-full min-h-60'>
      <div className='image relative w-32 h-32 flex items-center justify-center bg-white overflow-hidden rounded-full'>
        <Image src={"/images/interviewer.jpg"} width={100} height={100} alt='interview-assitant' objectFit='cover' />
      </div>
    </div>
  )
}

export default AI