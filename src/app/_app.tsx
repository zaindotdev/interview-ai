"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import AppProvider from "@/context/app-provider";
import { SpeedInsights } from "@vercel/speed-insights/next"
interface Props {
  children: React.ReactNode;
}
const Providers: React.FC<Props> = ({ children }) => {
  return (
    <SessionProvider>
      <AppProvider>{children}
        <SpeedInsights/>
      </AppProvider>
    </SessionProvider>
  );
};

export default Providers;
