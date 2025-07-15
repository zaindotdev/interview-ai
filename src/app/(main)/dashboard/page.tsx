"use client";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Crown } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { data: session } = useSession();
  const [resumeScore, setResumeScore] = useState(75);
  const user = session?.user;

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
    <main className="container mx-auto py-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
              Welcome <span className="text-primary">{user?.name}</span>
            </h1>
            <p className="text-gray-500">
              You are logged in as{" "}
              <span className="text-primary">{user?.email}</span>
            </p>
          </div>
          <div>
            <Button
              onClick={handleSignOut}
              className="cursor-pointer"
              size={"icon"}
              variant={"primary"}
            >
              <LogOut />
            </Button>
          </div>
        </div>
        <Separator className="my-4" />
      </header>
      <section className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="border border-orange-100  p-4 rounded-xl ring-2 ring-orange-500">
          <h2 className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
            Resume Score
          </h2>
          <div className="mt-4 flex items-center">
            <Crown className="size-5 mr-2" />
            <p className="text-gray-600">{resumeScore}%</p>
          </div>
          <Progress value={resumeScore} color="orange" />
        </div>
        <div className="border border-orange-100  p-4 rounded-xl ring-2 ring-orange-500">
          <h2 className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
            Interview Score
          </h2>
          <div className="mt-4 flex items-center">
            <Crown className="size-5 mr-2" />
            <p className="text-gray-600">{resumeScore}%</p>
          </div>
          <Progress value={resumeScore} color="orange" />
        </div>
      </section>
      <section className="">
        <h2 className="text-xl md:text-2xl relative font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600  w-fit before:content-[''] before:w-0 before:h-[1.5px] before:bg-orange-500 before:absolute before:bottom-0 before:left-0 hover:before:w-full duration-200 transition-all">
          Latest Jobs
        </h2>
      </section>
    </main>
  );
};

export default Dashboard;
