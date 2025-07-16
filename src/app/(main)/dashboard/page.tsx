"use client";
import { Separator } from "@/components/ui/separator";
import React, { useCallback, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import AnalysisCard from "@/components/dashboard/analysis-card";
import ImprovementSection from "@/components/dashboard/mock-interviews";
import { ResumeScore } from "@/lib/types";
import axios from "axios";


const Dashboard = () => {
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null)
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
      <header className="mb-8 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
              Welcome <span className="text-primary">{user?.name}</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              You are logged in as{" "}
              <span className="text-primary text-sm md:text-base">{user?.email}</span>
            </p>
          </div>
          <div>
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
        <Separator className="my-4" />
      </header>
      <AnalysisCard handleResumeScore={setResumeScore} />
      <ImprovementSection weaknessess={resumeScore?.missingSkills} />
    </main>
  );
};

export default Dashboard;
