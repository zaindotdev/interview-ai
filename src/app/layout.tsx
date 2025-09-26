import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./_app";
import { Toaster } from "sonner";
import 'remixicon/fonts/remixicon.css'

const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Interview AI",
  description: "Ace Your Next Interview with AI Powered Precision",
    icons:{
      icon:"/favicon.ico",
    }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
    <body
        className={`${dmSans.variable} ${dmSans.className} antialiased`}
        suppressHydrationWarning
    >
    <Providers>
      {children}
      <Toaster position="top-right"/>
    </Providers>
    </body>
    </html>
  );
}
