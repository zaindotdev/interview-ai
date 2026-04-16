"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const allowedPaths = ["/sign-in", "/sign-up", "/verify"];

    if (status === "loading") return;

    if (status === "unauthenticated" && !allowedPaths.includes(pathname)) {
      router.replace("/sign-in");
    } else if (status === "authenticated" && allowedPaths.includes(pathname)) {
      router.replace("/dashboard");
    }
  }, [status, pathname, router]);

  return (
    <main
      className={
        "relative container mx-auto min-h-screen w-full overflow-hidden"
      }
    >
      <AuthHeader path={pathname} />
      <div className={"flex min-h-screen w-full items-center justify-center"}>
        {children}
      </div>
    </main>
  );
};

const AuthHeader = ({ path }: { path: string }) => {
  return (
    <header className={"flex w-full items-center justify-end py-4"}>
      {path === "/sign-in" && (
        <p>
          Don't have an Account?{" "}
          <Link href="/sign-up">
            <Button className="p-0" variant={"link"}>
              Sign Up
            </Button>
          </Link>
        </p>
      )}
      {path === "/sign-up" && (
        <p>
          Already have an Account?{" "}
          <Link href="/sign-in">
            <Button className="p-0" variant={"link"}>
              Sign In
            </Button>
          </Link>
        </p>
      )}
      {path === "/verify" && (
        <p>
          Go back to{" "}
          <Link href="/sign-in">
            <Button className="p-0" variant={"link"}>
              Sign In
            </Button>
          </Link>
        </p>
      )}
    </header>
  );
};

export default Layout;
