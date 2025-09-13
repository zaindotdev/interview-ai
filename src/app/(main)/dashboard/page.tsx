"use client";
import React, { useEffect, useState } from "react";
import AnalysisCard from "@/components/dashboard/analysis-card";
import MockInterview from "@/components/dashboard/mock-interviews";
import StatsOverview from "@/components/dashboard/stats-overview";
import { ResumeScore } from "@/lib/types";
import type { MockInterviews } from "@/lib/types";
import { useAppContext } from "@/context/app-provider";

const Dashboard = () => {
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null);
  const [practiceInterview] = useState<
    MockInterviews[] | null
  >(null);
  const {mockInterviews,fetchMockInterviews, fetchResumeData, loading } = useAppContext();

  useEffect(() => {
    fetchResumeData();
    fetchMockInterviews();
  }, [fetchResumeData,fetchMockInterviews]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="border-primary/20 h-12 w-12 rounded-full border-4"></div>
            <div className="border-t-primary absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium">Loading your dashboard</p>
            <p className="text-muted-foreground text-sm">
              Please wait while we fetch your data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl/8  font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-lg">
          Track your interview preparation progress and improve your skills.
        </p>
      </div>

      <StatsOverview
        resumeScore={resumeScore}
        practiceInterview={mockInterviews}
      />

      <AnalysisCard
        handleResumeScore={setResumeScore}
        fetchMockInterviewss={fetchResumeData}
      />

      <MockInterview
        weaknessess={resumeScore?.missingSkills}
        practiceInterview={mockInterviews}
      />
    </div>
  );
};

export default Dashboard;
