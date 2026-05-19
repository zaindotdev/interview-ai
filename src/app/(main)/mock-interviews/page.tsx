"use client";
import type React from "react";
import { useEffect } from "react";
import { Clock, Zap, Play, ArrowRight, Lightbulb, CheckCircle2, RotateCcw } from "lucide-react";
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
      case "easy":   return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":   return "bg-red-100 text-red-800 border-red-200";
      default:       return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const available  = mockInterviews?.filter((i) => !i.markAsCompleted) ?? [];
  const completed  = mockInterviews?.filter((i) => i.markAsCompleted)  ?? [];
  const allDone    = (mockInterviews?.length ?? 0) > 0 && available.length === 0;

  return (
    <section className="min-h-[calc(100vh-4rem)] space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl/8">
          Mock Interviews
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg">
          Prepare for your next interview with our AI-powered mock sessions.
        </p>
      </div>

      {loading ? (
        <div className="flex h-[calc(100vh-12rem)] w-full flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="border-primary/20 h-12 w-12 rounded-full border-4" />
            <div className="border-t-primary absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium">Loading mock interviews...</p>
            <p className="text-muted-foreground text-sm">Please wait a moment.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-10">

          {/* ── All-done banner ── */}
          {allDone && (
            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="text-primary h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold">All interviews completed!</h2>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-sm">
                You&apos;ve finished every interview in your current quota. Upload your
                resume again to generate a fresh set of personalised sessions.
              </p>
              <Button asChild className="mt-6 gap-2">
                <Link href="/dashboard#resume-analysis">
                  <RotateCcw className="h-4 w-4" />
                  Analyse Resume Again
                </Link>
              </Button>
            </div>
          )}

          {/* ── Available interviews ── */}
          {available.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">
                Available{" "}
                <span className="text-muted-foreground font-normal">
                  ({available.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((mockInterview) => (
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
                          <Badge key={focus} variant="secondary" className="text-xs">
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
                          className={cn("text-xs font-medium", getDifficultyBadgeClass(mockInterview.difficulty))}
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
                        <Link href={`/mock-interviews/session/?id=${mockInterview.id}`}>
                          <Play className="mr-2 h-4 w-4" />
                          Start Interview
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── Completed interviews ── */}
          {completed.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">
                Completed{" "}
                <span className="text-muted-foreground font-normal">
                  ({completed.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((mockInterview) => (
                  <Card
                    key={mockInterview.id}
                    className="flex flex-col justify-between overflow-hidden opacity-60 grayscale transition-all duration-300 hover:opacity-80 hover:grayscale-0"
                  >
                    <CardHeader className="space-y-2 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-foreground text-xl font-semibold">
                          {mockInterview.topic}
                        </CardTitle>
                        <Badge className="shrink-0 gap-1 bg-green-100 text-green-700 border-green-200 text-xs">
                          <CheckCircle2 className="h-3 w-3" />
                          Done
                        </Badge>
                      </div>
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
                          <Badge key={focus} variant="secondary" className="text-xs">
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
                          className={cn("text-xs font-medium", getDifficultyBadgeClass(mockInterview.difficulty))}
                          variant="outline"
                        >
                          <Zap className="mr-1 h-3 w-3" />
                          {mockInterview.difficulty}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4">
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                        Completed
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── Truly empty state ── */}
          {!allDone && available.length === 0 && completed.length === 0 && (
            <div className="col-span-full flex h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4">
              <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                <Lightbulb className="text-primary h-8 w-8" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-muted-foreground text-xl font-medium">
                  No mock interviews available yet
                </p>
                <p className="text-muted-foreground text-sm">
                  Upload your resume to generate personalised interview sessions.
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