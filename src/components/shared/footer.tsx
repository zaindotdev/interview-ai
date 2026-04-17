"use client";
import React from "react";
import Logo from "./logo";
import Link from "next/link";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import {motion} from "motion/react"

interface FooterLink {
  name: string;
  href: string;
}

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export const primaryFooterLinks: FooterLink[] = [
  { name: "Home", href: "/" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "About Us", href: "/about" },
  { name: "Blog", href: "/blog" },
];

export const secondaryFooterLinks: FooterLink[] = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Help Center", href: "/help" },
  { name: "Contact Us", href: "/contact" },
];

const Footer = () => {
    const {handleSubmit, register, formState: { errors }} = useForm<NewsletterFormData>({
        resolver: zodResolver(newsletterSchema),
        defaultValues:{
            email: "",
        }
    });

    const onSubmit = (data: NewsletterFormData) => {
        console.log("Subscribed with email:", data.email);
    }

  return (
    <footer className="from-bacground via-secondary to-muted mt-16 bg-linear-to-b py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 space-y-8">
          <div className="">
            <div className="flex items-center font-serif font-semibold">
              <Logo /> Interview AI.
            </div>
            <p className="mt-2 text-sm">
              Build with <span>❤️</span> by Muhammad Zain
            </p>
            <div className="mt-8 md:mr-24">
              <h2 className="mb-4 text-lg font-semibold">
                Subscribe to our Newsletter
              </h2>
              <form className="flex items-center justify-center gap-2" onSubmit={handleSubmit(onSubmit)}>
                <Input
                  type="email"
                  placeholder="Your email address"
                  aria-invalid={!!errors.email}
                  className={cn(
                    "border-input flex-1 border-2",
                    errors.email &&
                      "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50",
                  )}
                  {...register("email")}
                />
                <Button type="submit">Subscribe</Button>
              </form>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="">
            <h1 className="text-primary text-xl font-semibold">Product</h1>
            {primaryFooterLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-muted-foreground block w-fit relative after:absolute after:bottom-0 after:left-0 after:content-[''] after:w-0 hover:after:w-full after:bg-primary after:h-px  after:transition-all after:duration-300 after:rounded-xl">
                {link.name}
              </Link>
            ))}
          </div>
          <div className="">
            <h1 className="text-primary text-xl font-semibold">Legal</h1>
            {secondaryFooterLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-muted-foreground block w-fit relative after:absolute after:bottom-0 after:left-0 after:content-[''] after:w-0 hover:after:w-full after:bg-primary after:h-px  after:transition-all after:duration-300 after:rounded-xl">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        <p className="text-primary text-center text-sm">
          &copy; {new Date().getFullYear()} Interview AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
