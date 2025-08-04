"use client";
import type React from "react";
import { useEffect } from "react";
import { Clock, Zap, Play, ArrowRight, Lightbulb } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/app-provider";

const MockInterviewPage: React.FC = () => {
  const { fetchMockInterviews, loading, mockInterviews } = useAppContext();

  useEffect(() => {
    fetchMockInterviews();
  }, [fetchMockInterviews]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  };

  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mock Interviews</h1>
        <p className="text-muted-foreground">
          Prepare for your next interview with our AI-powered mock sessions.
        </p>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex h-[calc(100vh-12rem)] w-full flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="border-primary/20 h-12 w-12 rounded-full border-4"></div>
            <div className="border-t-primary absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium">Loading mock interviews...</p>
            <p className="text-muted-foreground text-sm">
              Please wait a moment.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockInterviews && mockInterviews?.length > 0 ? (
            mockInterviews?.map((mockInterview) => (
              <Card
                key={mockInterview.id}
                className="group flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="text-primary text-xl font-semibold">
                    {mockInterview.topic}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {mockInterview.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Lightbulb className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground text-sm font-medium">
                      Focus Areas:
                    </span>
                    {mockInterview.focus.map((focus) => (
                      <Badge
                        key={focus}
                        variant="secondary"
                        className="text-xs"
                      >
                        {focus}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(mockInterview.estimated_time)}</span>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs font-medium",
                        getDifficultyBadgeClass(mockInterview.difficulty),
                      )}
                      variant="outline"
                    >
                      <Zap className="mr-1 h-3 w-3" />
                      {mockInterview.difficulty}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button
                    asChild
                    className="group-hover:bg-primary group-hover:text-primary-foreground w-full"
                  >
                    <Link
                      href={`/mock-interviews/session/?id=${mockInterview.id}`}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Interview
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                  <Lightbulb className="text-primary h-8 w-8" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-muted-foreground text-xl font-medium">
                  No mock interviews available yet
                </p>
                <p className="text-muted-foreground text-sm">
                  Check back later or upload your resume to generate
                  personalized interviews.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard#resume-analysis">Upload Resume</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default MockInterviewPage;
