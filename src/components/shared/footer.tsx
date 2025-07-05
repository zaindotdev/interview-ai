'use client'
import React from 'react'
import {motion} from "framer-motion"

const Footer = () => {
  return (
    <motion.footer initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.8, delay:0.4, ease:"linear"}} className='container mx-auto border-t-2 border-gray-300 p-4 md:p-8 flex items-center justify-center md:justify-between gap-4 flex-wrap'>
          <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.8, delay:0.6, ease:"linear"}} className={"text-sm md:text-base"}>Copyright &copy; All Rights Reserved - 2025</motion.p>
           <motion.p  initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.8, delay:0.8, ease:"linear"}} className={"text-sm md:text-base"}>Made with 🩷 by Zain</motion.p>
    </motion.footer>
  )
}

export default Footer