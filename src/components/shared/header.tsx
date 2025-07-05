'use client'
import { useScroll, useTransform, motion } from 'framer-motion'
import Link from 'next/link';
import React from 'react'
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';


const Header = () => {
    const { scrollY } = useScroll();
    const backgroundColor = useTransform(
        scrollY,
        [0, 200],
        ['transparent', 'var(--color-orange-100)'],
        { clamp: false }
    );
    const shadows = useTransform(
        scrollY,
        [0, 200],
        ['0px 0px 0px 0px', '0px 0px 10px 0px rgba(0, 0, 0, 0.5)'],
        { clamp: false }
    );

    const navLinks = [
        {
            name: "Home",
            href: "/"
        },
        {
            name: "How it works",
            href: "#how-it-works"
        }, {
            name: "Features",
            href: "#features"
        }, {
            name: "Pricing",
            href: "#pricing"
        },
        {
            name: "Contact",
            href: "/contact"
        }
    ]

    return (
        <motion.header
            className='w-full p-4 fixed z-10'
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: backgroundColor, boxShadow: shadows }}
        >
            <nav className='flex items-center justify-between'>
                <div>
                    <h1 className='text-xl font-bold italic'>Interview <span className='text-orange-500'>AI.</span></h1>
                </div>
                <div className='flex items-center gap-8'>
                    {navLinks.map((links, index) => (
                        <Link key={index} href={links.href}>
                            <p>{links.name}</p>
                        </Link>
                    ))}
                </div>
                <div className='flex items-center gap-6'>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease: "easeInOut" }}>
                        <Button variant={"primary"}>
                            Sign Up
                        </Button>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, ease: "easeInOut" }}>
                        <Button variant={"secondary"}>
                            Sign In
                        </Button>
                    </motion.div>
                </div>
            </nav>
        </motion.header>
    )
}

export default Header