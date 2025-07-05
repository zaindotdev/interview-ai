"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface FooterLink {
    name: string;
    href: string;
}

/* Primary navigation (product & company) */
export const primaryFooterLinks: FooterLink[] = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
];

/* Support & legal */
export const secondaryFooterLinks: FooterLink[] = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
];

const Footer = () => {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "linear" }}
            className="w-full border-t border-gray-200/70 bg-white"
        >
            <div className="container mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
                {/* ───────── Brand / CTA ───────── */}
                <div className="flex flex-col gap-2">
                    <Link
                        href="/"
                        className="text-2xl font-semibold italic leading-tight"
                    >
                        Interview <span className="text-orange-600">AI.</span>
                    </Link>
                    <p className="text-sm text-gray-500">
                        Made with <span role="img" aria-label="heart">❤️</span> by Zain
                    </p>
                </div>

                {/* ───────── Primary links ───────── */}
                <ul className="grid grid-cols-2 gap-2">
                    {primaryFooterLinks.map((link, idx) => (
                        <li key={`primary-${idx}`}>
                            <Link
                                href={link.href}
                                className="text-sm font-medium text-gray-600 transition-colors hover:text-orange-600"
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* ───────── Secondary links ───────── */}
                <ul className="flex flex-col gap-2">
                    {secondaryFooterLinks.map((link, idx) => (
                        <li key={`secondary-${idx}`}>
                            <Link
                                href={link.href}
                                className="text-sm font-medium text-gray-600 transition-colors hover:text-orange-600"
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </motion.footer>
    );
};

export default Footer;
