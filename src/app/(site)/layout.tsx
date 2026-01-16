"use client";
import React from "react";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const pathname = usePathname();

  return (
    <main className="min-h-screen w-full bg-zinc-100 dark:bg-zinc-900">
      {pathname.includes("onboarding") || pathname.includes("subscription") ? null : <Header />}
      {children}
      {pathname.includes("onboarding") || pathname.includes("subscription") ? null : <Footer />}
    </main>
  );
};

export default Layout;
