"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type Props = { children: React.ReactNode };

const NAV_LINKS: Record<string, { text: string; label: string; href: string }> =
  {
    "/sign-in": {
      text: "Don't have an account?",
      label: "Sign Up",
      href: "/sign-up",
    },
    "/sign-up": {
      text: "Already have an account?",
      label: "Sign In",
      href: "/sign-in",
    },
    "/verify": { text: "Wrong email?", label: "Start over", href: "/sign-up" },
  };

/** Rotating quotes shown on the left brand panel */
const QUOTES = [
  {
    body: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    body: "Opportunities don't happen. You create them.",
    author: "Chris Grosser",
  },
  { body: "Success is where preparation meets opportunity.", author: "Seneca" },
];

const Layout = ({ children }: Props) => {
  const { status, data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const allowedPaths = ["/sign-in", "/sign-up", "/verify"];
    if (status === "loading") return;

    if (status === "unauthenticated" && !allowedPaths.includes(pathname)) {
      router.replace("/sign-in");
    } else if (status === "authenticated" && allowedPaths.includes(pathname)) {
      if (pathname.startsWith("/verify")) return;
      const hasOnboarded = session?.user?.hasOnboarded;
      router.replace(hasOnboarded ? "/dashboard" : "/onboarding");
    }
  }, [status, pathname, router, session]);

  const nav = NAV_LINKS[pathname];
  // Cycle quote based on path
  const quote =
    QUOTES[Object.keys(NAV_LINKS).indexOf(pathname) ?? 0] ?? QUOTES[0];

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left brand panel (hidden on mobile) ── */}
      <aside className="bg-primary text-primary-foreground hidden flex-col justify-between p-10 lg:flex lg:w-[42%] xl:w-[38%] xl:p-14">
        {/* Logo */}
        <div>
          <span className="font-serif text-xl font-medium tracking-tight opacity-90">
            Interview AI
          </span>
        </div>

        {/* Central decorative block */}
        <div className="space-y-8">
          {/* Decorative rule */}
          <div className="flex items-center gap-4">
            <div className="bg-primary-foreground/20 h-px flex-1" />
            <div className="bg-primary-foreground/40 h-1.5 w-1.5 rounded-full" />
          </div>

          <blockquote className="space-y-4">
            <p className="text-primary-foreground/90 font-serif text-2xl leading-snug font-light xl:text-3xl">
              &ldquo;{quote.body}&rdquo;
            </p>
            <footer className="text-primary-foreground/50 text-xs tracking-widest uppercase">
              — {quote.author}
            </footer>
          </blockquote>

          <div className="flex items-center gap-4">
            <div className="bg-primary-foreground/20 h-px flex-1" />
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-primary-foreground/40 text-[11px] tracking-widest uppercase">
          Prepare. Practice. Succeed.
        </p>
      </aside>

      {/* ── Right content panel ── */}
      <main className="flex min-h-screen flex-1 flex-col">
        {/* Top nav */}
        {nav && (
          <header className="flex items-center justify-between px-6 py-5 md:px-10">
            {/* Mobile-only logo */}
            <span className="text-primary font-serif text-lg font-medium lg:hidden">
              Interview AI
            </span>

            <div className="text-muted-foreground ml-auto flex items-center gap-2 text-sm">
              <span>{nav.text}</span>
              <Link
                href={nav.href}
                className="text-primary font-medium underline-offset-4 transition-colors hover:underline"
              >
                {nav.label}
              </Link>
            </div>
          </header>
        )}
        <div className="flex flex-1 items-center justify-center px-6 py-8 md:px-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
