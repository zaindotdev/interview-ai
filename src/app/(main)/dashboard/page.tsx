"use client";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Badge, CheckCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import AnalysisCard from "@/components/dashboard/analysis-card";
import ImprovementSection from "@/components/dashboard/mock-interviews";


const Dashboard = () => {
  const { data: session } = useSession();
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
      <AnalysisCard/>
      <ImprovementSection weaknessess={["Weakness 1", "Weakness 2", "Weakness 3"]}/>
    </main>
  );
};

export default Dashboard;
