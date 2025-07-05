'use client'
import React, { useState } from 'react';
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
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
                Interview <span className={"text-orange-500"}>
                    AI.
                </span>
            </h1>
            <ul className={"hidden md:flex items-center gap-8"}>
                {navLinks.map((link, index) => (
                    <li onClick={() => handleClick(link.name)} key={`nav-links-${index}`}>
                        <Link href={link.href}>
                            <p className={`${isActive === link.name ? "text-orange-500 font-semibold" : ""} font-medium text-base/8 duration-200 ease-linear hover:text-orange-500`}>{link.name}</p>
                        </Link>
                    </li>
                ))}
            </ul>
            <div className={"hidden md:flex items-center gap-2"}>
                <Link href={"/sign-up"}>
                    <Button className={"cursor-pointer"} variant={"link"}>
                        Sign Up
                    </Button>

                </Link>
                <Link href={"/sign-in"}>
                    <Button className={"cursor-pointer"} variant={"primary"}>
                        Sign In
                    </Button>
                </Link>
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
                </li>
            </motion.ul>}
        </nav>
    </motion.header>
}

export default Header;