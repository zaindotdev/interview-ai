"use client";
import React, { useState } from "react";
import AnalysisCard from "@/components/dashboard/analysis-card";
import MockInterviews from "@/components/dashboard/mock-interviews";
import { ResumeScore } from "@/lib/types";


const Dashboard = () => {
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null)
  
  return (
    <main className="container mx-auto">
      <AnalysisCard handleResumeScore={setResumeScore} />
      <MockInterviews weaknessess={resumeScore?.missingSkills} />
    </main>
  );
};

export default Dashboard;
