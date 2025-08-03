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
      {pathname.includes("onboarding") ? null : <Header />}
      {children}
      <Footer />
    </main>
  );
};

export default Layout;
