'use client'
import React, { useState } from 'react';
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from 'next-auth/react';

const Header: React.FC = () => {
    const { status } = useSession();
    const [isActive, setIsActive] = useState("Home");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const backgroundColor = useTransform(scrollYProgress, [0, 1], ["transparent", "#fff"]);
    const navLinks = [{
        name: "Home",
        href: "/",
    }, {
        name: "How It Works",
        href: "#how-it-works",

    }, {
        name: "Features",
        href: "#features",
    }, {
        name: "Pricing",
        href: "#pricing",
    }]

    const handleClick = (element: string) => {
        setIsActive(element);
    }
    return <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeIn" }} className={"p-4 fixed w-full top-0 left-0 z-[2]"} style={{ backgroundColor: backgroundColor }}>
        <nav className={"flex items-center justify-between md:justify-around mx-auto container"}>
            <h1 className={"text-lg md:text-xl font-medium italic text-pretty"}>
                Interview <span className={"text-primary"}>
                    AI.
                </span>
            </h1>
            <ul className={"hidden md:flex items-center gap-8"}>
                {navLinks.map((link, index) => (
                    <li onClick={() => handleClick(link.name)} key={`nav-links-${index}`}>
                        <Link href={link.href}>
                            <p className={`${isActive === link.name ? "text-primary font-semibold" : ""} font-medium text-base/8 duration-200 ease-linear hover:text-primary`}>{link.name}</p>
                        </Link>
                    </li>
                ))}
            </ul>
            <div className={"hidden md:flex items-center gap-2"}>
                {status === "unauthenticated" ? (
                    <>
                        <Link href={"/sign-up"}>
                            <Button className={"cursor-pointer text-white"} variant={"link"}>
                                Sign Up
                            </Button>

                        </Link>
                        <Link href={"/sign-in"}>
                            <Button className={"cursor-pointer "} variant={"primary"}>
                                Sign In
                            </Button>
                        </Link>
                    </>
                ) : (
                    <Link href={"/dashboard"}>
                        <Button>
                            Dashboard
                        </Button>
                    </Link>
                )}
            </div>

            <div className={"md:hidden block"}>
                <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant={"link"} size={"icon"}>
                    {isMenuOpen ? <X /> : <Menu />}
                </Button>
            </div>

            {isMenuOpen && <motion.ul initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "backInOut" }} className={"absolute top-16 right-0 p-4 w-full h-[calc(100vh-64px)] bg-orange-400"}>
                {navLinks.map((link, index) => (
                    <motion.li key={`nav-links-${index}`}>
                        <Link href={link.href}>
                            <p className={`font-medium text-base/8 text-white`}>{link.name}</p>
                        </Link>
                    </motion.li>
                ))}
                <li className={""}>
                    {status === "authenticated" ? (
                        <>
                            <Link href={"/sign-up"}>
                                <Button className={"cursor-pointer text-white"} variant={"link"}>
                                    Sign Up
                                </Button>

                            </Link>
                            <Link href={"/sign-in"}>
                                <Button className={"cursor-pointer "} variant={"primary"}>
                                    Sign In
                                </Button>
                            </Link></>
                    ) : (
                        <Link href={"/dashboard"}>
                            <Button>
                                Dashboard
                            </Button>
                        </Link>
                    )}
                </li>
            </motion.ul>}
        </nav>
    </motion.header>
}

export default Header;