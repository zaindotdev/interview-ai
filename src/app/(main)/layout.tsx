"use client";

import React from "react";
import { Meteors } from "@/components/magicui/meteors";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type Props = { children: React.ReactNode };

const RootLayout = ({ children }: Props) => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: "/sign-in",
        redirect: true,
      });
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Something went wrong while signing you out",
      });
    }
  };

  return (
    <main className="container mx-auto min-h-screen w-full overflow-hidden p-4">
      <Meteors number={20} />
      {pathname !== "/onboarding" && (
        <header className="mb-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold sm:text-2xl md:text-3xl">
                Welcome{" "}
                <span className="text-primary">{session?.user?.name}</span>
              </h1>
              <p className="text-sm text-gray-500 md:text-base">
                You are logged in as{" "}
                <span className="text-primary text-sm md:text-base">
                  {session?.user?.email}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
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
                  <UserCircle className="h-8 w-8" />
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
          <Separator className="border-primary my-4 border" />
        </header>
      )}
      <div className="min-h-screen w-full">{children}</div>
    </main>
  );
};

export default RootLayout;
