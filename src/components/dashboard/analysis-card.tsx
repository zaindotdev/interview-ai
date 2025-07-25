"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { UploadCloud, Badge, CheckCircle, Loader, Loader2 } from "lucide-react";
import { Badge as BadgeComp } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { ResumeScore } from "@/lib/types";
import { toast } from "sonner";
import axios from "axios";
import { ChartData } from "@/lib/types";
import { Button } from "../ui/button";
import Link from "next/link";

interface AnalysisCardProps {
  handleResumeScore: React.Dispatch<React.SetStateAction<ResumeScore | null>>;
}

type MockJobs = {
  jobTitle: string;
  jobDescription: string;
};

const mockJobs: MockJobs[] = [
  {
    jobTitle: "Frontend Developer",
    jobDescription:
      "Design and implement user interfaces using modern JavaScript frameworks like React or Vue. Ensure responsive design, cross-browser compatibility, and accessibility across all devices.",
  },
  {
    jobTitle: "Backend Developer",
    jobDescription:
      "Build and maintain robust server-side logic, APIs, and database interactions using Node.js, Express, and PostgreSQL or MongoDB. Ensure high performance and responsiveness to requests from the frontend.",
  },
  {
    jobTitle: "Full Stack Developer",
    jobDescription:
      "Work across the entire technology stack to build scalable web applications. Integrate frontend and backend components, manage databases, and deploy applications using cloud platforms like Vercel or AWS.",
  },
  {
    jobTitle: "DevOps Engineer",
    jobDescription:
      "Automate and manage infrastructure, CI/CD pipelines, and deployment workflows. Monitor system performance, optimize resource usage, and ensure application availability using tools like Docker, Kubernetes, and Jenkins.",
  },
  {
    jobTitle: "Mobile App Developer",
    jobDescription:
      "Create cross-platform mobile applications using React Native or Flutter. Integrate APIs, optimize performance, and ensure a smooth user experience across Android and iOS platforms.",
  },
  {
    jobTitle: "UI/UX Designer",
    jobDescription:
      "Design intuitive, user-centric interfaces using tools like Figma or Adobe XD. Conduct user research, create wireframes and prototypes, and ensure design consistency throughout the product lifecycle.",
  },
  {
    jobTitle: "Data Analyst",
    jobDescription:
      "Interpret complex datasets to provide actionable insights using SQL, Python, and visualization tools like Tableau or Power BI. Collaborate with teams to support decision-making and improve business performance.",
  },
  {
    jobTitle: "Machine Learning Engineer",
    jobDescription:
      "Design and deploy machine learning models to solve real-world problems. Work with large datasets, preprocess data, and use frameworks like TensorFlow or PyTorch to train and evaluate models.",
  },
  {
    jobTitle: "QA Engineer",
    jobDescription:
      "Develop and execute test plans, identify bugs, and ensure the delivery of high-quality software. Use automated and manual testing strategies to verify functionality, performance, and security.",
  },
  {
    jobTitle: "Cloud Solutions Architect",
    jobDescription:
      "Design scalable and secure cloud infrastructures tailored to business needs using platforms like AWS, Azure, or Google Cloud. Lead architectural reviews, optimize cloud resources, and ensure compliance with best practices.",
  },
];

const AnalysisCard: React.FC<AnalysisCardProps> = ({ handleResumeScore }) => {
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [percentageProgress, setPercentageProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [chartData, setChartData] = useState<ChartData[] | null>(null);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetProgressRef = useRef<number>(0);

  const animateProgress = useCallback((targetProgress: number) => {
    targetProgressRef.current = targetProgress;

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setPercentageProgress((currentProgress) => {
        const diff = targetProgressRef.current - currentProgress;

        if (Math.abs(diff) < 1) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          return targetProgressRef.current;
        }

        const increment =
          diff > 0
            ? Math.max(1, Math.ceil(diff * 0.1))
            : Math.min(-1, Math.floor(diff * 0.1));
        return currentProgress + increment;
      });
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleResumeAnalysis = async (e: any) => {
    setLoading(true);
    setPercentageProgress(0);

    try {
      if (!selectedJob) {
        toast.error("Please select a job description");
        return;
      }

      const formData = new FormData();
      const f = e.target.files[0];
      setFile(f);

      formData.append("resume", f);
      formData.append("jobDescription", selectedJob);

      animateProgress(5);

      const response = await axios.post("/api/resume/analysis", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent && progressEvent.loaded && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            const adjustedProgress = Math.min(percentCompleted * 0.7, 70);
            animateProgress(adjustedProgress);
          }
        },
      });

      animateProgress(85);

      const data = await response.data;

      if (data.status !== 200) {
        toast.error("Something went wrong", {
          description: "Something went wrong while analyzing your resume",
        });
        return;
      }

      animateProgress(100);

      setTimeout(() => {
        setResumeScore(data.data);
        handleResumeScore(data.data);
      }, 500);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong", {
        description: "Something went wrong while analyzing your resume",
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
        setPercentageProgress(0);
      }, 1000);
    }
  };

  const fetchResumeScore = useCallback(async () => {
    setLoading(true);
    setPercentageProgress(0);

    try {
      animateProgress(10);

      const response = await axios.get("/api/resume/report", {
        onDownloadProgress: (progressEvent) => {
          if (progressEvent && progressEvent.loaded && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            animateProgress(percentCompleted);
          }
        },
      });

      if (response.status !== 200) {
        toast.error("Something went wrong", {
          description: "Something went wrong while fetching your resume score",
        });
        return;
      }

      animateProgress(100);

      setTimeout(() => {
        setResumeScore(response.data.data.parsedJson);
        handleResumeScore(response.data.data.parsedJson);
      }, 300);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setPercentageProgress(0);
      }, 500);
    }
  }, [animateProgress]);

  useEffect(() => {
    fetchResumeScore();
  }, [fetchResumeScore]);

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 relative">
      <Card className="w-full p-4 shadow-md rounded-2xl bg-white">
        <div className="card-title">
          <h2 className="text-lg md:text-xl font-semibold text-primary">
            Resume Analysis
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            An overview of your resume's performance and highlights key
            strengths.
          </p>
          <div className="mt-4 w-full flex items-center gap-2">
            {resumeScore && (
              <div className="ml-auto w-full">
                <Label className="mb-2 text-gray-400">Upload New Resume</Label>
                <Input type="file" onChange={handleResumeAnalysis} />
              </div>
            )}
            <div className="w-full">
              <Label className="mb-2 text-gray-400">Choose a Job Role</Label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Job" />
                </SelectTrigger>
                <SelectContent>
                  {mockJobs.map((job, idx) => (
                    <SelectItem key={`job-${idx}`} value={job.jobDescription}>
                      {job.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {!resumeScore ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center p-4">
            {loading ? (
              <div className="w-full flex items-center justify-center flex-col">
                <div className="w-full max-w-xs">
                  <Progress value={percentageProgress} className="mb-2" />
                  <p className="text-sm font-semibold text-center text-gray-400">
                    {percentageProgress}%
                  </p>
                  <p className="text-xs text-center text-gray-400 mt-2">
                    {percentageProgress < 10
                      ? "Starting analysis..."
                      : percentageProgress < 70
                        ? "Uploading resume..."
                        : percentageProgress < 90
                          ? "Processing data..."
                          : "Finalizing results..."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <p className="text-gray-500 text-sm md:text-base mb-2">
                  {!file ? "Upload your resume to get started" : file.name}
                </p>
                <div className="border-2 border-dashed border-primary  w-full h-[200px] rounded-xl relative">
                  <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-col">
                    <UploadCloud size={54} className="text-primary" />
                    <p className="text-xl font-medium text-gray-500">
                      Upload Resume
                    </p>
                  </div>
                  <Input
                    value={file?.name || ""}
                    onChange={handleResumeAnalysis}
                    accept="application/pdf"
                    type="file"
                    className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="card-content">
              <div className="mb-4">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Badge size={24} className="text-primary mb-2" />
                    <p className="text-gray-500 text-sm md:text-base">
                      {resumeScore?.score}%
                    </p>
                  </div>
                  <BadgeComp variant={"outline"}>
                    {resumeScore?.matchLevel}
                  </BadgeComp>
                </div>
                <Progress value={resumeScore?.score} />
              </div>
              <div className="strengths">
                <p className="text-gray-500 text-sm md:text-base">Strengths:</p>
                <ul className="max-h-[200px] overflow-y-auto scroll-smooth ">
                  {resumeScore &&
                    resumeScore.strengths &&
                    resumeScore?.strengths.map((strength, index) => (
                      <li className="flex items-center gap-2 mt-2" key={index}>
                        <CheckCircle size={20} className="text-primary" />
                        <p className="text-sm md:tex-base text-gray-500">
                          {strength}
                        </p>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Card>
      <Card className="w-full p-4 shadow-md rounded-2xl bg-white">
        <div className="card-title">
          <h2 className="text-lg md:text-xl font-semibold text-primary">
            Interview Analysis
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            An overview of your interview's performance and highlights key
            strengths.
          </p>
        </div>
        <div className="min-h-[250px] flex items-center justify-center">
          {chartData ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="session" />
                <PolarRadiusAxis />
                <Radar
                  name="Behavioral"
                  dataKey="Behavioral"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Technical"
                  dataKey="Technical"
                  stroke="var(--chart-2)"
                  fill="var(--chart-2)"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Communication"
                  dataKey="Communication"
                  stroke="var(--chart-3)"
                  fill="var(--chart-3)"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full flex items-center justify-center flex-col">
              <p className="text-sm font-semibold my-2 text-gray-400">
                No interviews Yet
              </p>
              <Button variant={"outline"}>
                <Link href="/dashboard#interview">View Interviews</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
};

export default AnalysisCard;
