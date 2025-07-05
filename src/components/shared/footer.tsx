'use client'
import React from 'react'
import {motion} from "framer-motion"

const Footer = () => {
  return (
    <motion.footer className='container mx-auto border-t-2 border-gray-300 p-4 md:p-8 flex items-center justify-between'>
      <p className='text-center text-sm text-gray-500'>Copyright © 2023. All rights reserved.</p>
      <p>Made with <span className='text-orange-600'>❤️</span> by <span className='text-orange-600'>Zain</span></p>
    </motion.footer>
  )
}

export default Footer