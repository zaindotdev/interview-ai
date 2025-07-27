"use client";

import React, { useEffect } from "react";
import { Meteors } from "@/components/magicui/meteors";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, UserCircle } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

type Props = { children: React.ReactNode };
const authPages = ["/sign-in", "/sign-up", "/verify"];

const RootLayout = ({ children }: Props) => {
  const { status, data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const onAuthPage = authPages.includes(pathname);
    if (status === "unauthenticated") {
      if (!onAuthPage) router.replace("/sign-in");
      return;
    }

    if (status === "authenticated" && onAuthPage) {
      router.replace("/dashboard");
    }
  }, [status, pathname, router]);

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: "/sign-in",
        redirect: true,
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong", {
        description: "Something went wrong while signing you out",
      });
    }
  };

  return (
    <main className="container mx-auto w-full min-h-screen overflow-hidden p-4">
      <Meteors number={20} />
      <header className="mb-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
              Welcome{" "}
              <span className="text-primary">{session?.user?.name}</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              You are logged in as{" "}
              <span className="text-primary text-sm md:text-base">
                {session?.user?.email}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href={`/profile/${session?.user?.name?.toLowerCase().split(" ").join("-")}`}
            >
              {session?.user?.image ? (
                <Image
                  src={session?.user?.image}
                  width={40}
                  height={40}
                  alt={session?.user?.name || "User"}
                />
              ) : (
                <UserCircle className="w-8 h-8" />
              )}
            </Link>
            <Button
              onClick={handleSignOut}
              className="cursor-pointer"
              variant={"primary"}
            >
              <LogOut />
              Logout
            </Button>
          </div>
        </div>
        <Separator className="my-4 border border-primary" />
      </header>
      <div className="min-h-screen w-full">
        {status !== "authenticated" ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </main>
  );
};

export default RootLayout;
