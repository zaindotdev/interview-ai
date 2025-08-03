"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import AppProvider from "@/context/app-provider";
interface Props {
  children: React.ReactNode;
}
const Providers: React.FC<Props> = ({ children }) => {
  return (
    <SessionProvider>
      <AppProvider>{children}</AppProvider>
    </SessionProvider>
  );
};

export default Providers;
