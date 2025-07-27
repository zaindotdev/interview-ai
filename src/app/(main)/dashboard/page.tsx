"use client";
import React, { useCallback, useEffect, useState } from "react";
import AnalysisCard from "@/components/dashboard/analysis-card";
import MockInterviews from "@/components/dashboard/mock-interviews";
import { ResumeScore } from "@/lib/types";
import axios from "axios";
import { toast } from "sonner";
import { PracticeInterview } from "@/lib/types";

const Dashboard = () => {
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null)
  const [practiceInterview, setPracticeInterview] = useState<PracticeInterview[] | null>(null)

  const fetchPracticeInterviews = useCallback(async () => {
    try {
      const response = await axios.get("/api/interview/mock/get");
      if (response.status !== 200) {
        toast.error("Something went wrong", {
          description: response.data.message
        });
      }
      setPracticeInterview(response.data.data)
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => { fetchPracticeInterviews() }, [fetchPracticeInterviews])

  return (
    <main className="container mx-auto">
      <AnalysisCard handleResumeScore={setResumeScore} fetchPracticeInterviews={fetchPracticeInterviews} />
      <MockInterviews weaknessess={resumeScore?.missingSkills} practiceInterview={practiceInterview} />
    </main>
  );
};

export default Dashboard;

