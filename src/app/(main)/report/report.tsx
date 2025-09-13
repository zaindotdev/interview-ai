"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  User,
  FileText,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ReportData {
  id: string;
  callId: string;
  candidateId: string;
  report: {
    summary: string;
    overallScore: number;
    strengths: string[];
    areasForImprovement: string[];
    detailedFeedback: {
      communication: { score: number; feedback: string };
      technicalKnowledge: { score: number; feedback: string };
      problemSolving: { score: number; feedback: string };
      culturalFit: { score: number; feedback: string };
    };
    recommendations: string[];
    nextSteps: string[];
    redFlags: string[];
  };
  metaData: {
    focusedSkills: string[];
    topic: string;
    duration: number;
    confidence: number;
    chartConfig: {
      chartData: Array<{
        category: string;
        score: number;
        benchmark: number;
      }>;
    };
    processingNotes: string[];
    generatedAt: string;
  };
  createdAt: string;
}

const Report = () => {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/mock-interview/report?id=${reportId}`);
      if (res.status !== 200) {
        toast.error(res?.data?.message, {
          description: "An error occurred, please try again.",
          icon: "🚨",
        });
      } else {
        setReportData(res.data.data.report);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error("Something went wrong", {
          description: error?.message,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [fetchReport, reportId]);

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-green-600";
    if (score >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (
    score: number,
  ): "default" | "secondary" | "destructive" => {
    if (score >= 7) return "default";
    if (score >= 4) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto flex max-w-6xl flex-col rounded-xl md:p-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        </section>
      </main>
    );
  }

  if (!reportData) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto flex max-w-6xl flex-col rounded-xl md:p-8">
          <div className="py-12 text-center">
            <h2 className="mb-2 text-xl font-semibold">Report not found</h2>
            <p className="text-muted-foreground">
              The requested interview report could not be found.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
  };

  return (
    <main className="bg-background min-h-screen">
      <section className="mx-auto flex max-w-6xl flex-col rounded-xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 border-b pb-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
                Interview Report
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
                Comprehensive analysis of the mock interview performance
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDuration(reportData.metaData.duration)}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Topic:</span>
              <span className="text-muted-foreground text-sm">
                {reportData.metaData.topic}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Overall Score:</span>
              <Badge
                variant={getScoreBadgeVariant(reportData.report.overallScore)}
              >
                {reportData.report.overallScore}/10
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Confidence:</span>
              <span className="text-muted-foreground text-sm">
                {reportData.metaData.confidence}/10
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Summary and Performance */}
          <div className="space-y-6 lg:col-span-2">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {reportData.report.summary}
                </p>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  Performance Analysis
                </CardTitle>
                <CardDescription>
                  Comparison of candidate performance vs. benchmark scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      defaultShowTooltip={true}
                      data={reportData.metaData.chartConfig.chartData}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={false}
                      />
                      <Radar
                        name="Candidate Score"
                        dataKey="score"
                        stroke="var(--color-primary)"
                        fill="var(--color-primary)"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Benchmark"
                        dataKey="benchmark"
                        stroke="var(--color-foreground)"
                        fill="transparent"
                        strokeWidth={2}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  Detailed Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(reportData.report.detailedFeedback).map(
                  ([category, feedback]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold capitalize">
                          {category.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                        <Badge variant={getScoreBadgeVariant(feedback.score)}>
                          {feedback.score}/10
                        </Badge>
                      </div>
                      <Progress value={feedback.score * 10} className="h-2" />
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feedback.feedback}
                      </p>
                      {category !==
                        Object.keys(
                          reportData.report.detailedFeedback,
                        ).pop() && <Separator className="mt-4" />}
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Strengths, Areas for Improvement, etc. */}
          <div className="space-y-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reportData.report.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reportData.report.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reportData.report.recommendations.map(
                    (recommendation, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <span>{recommendation}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reportData.report.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="bg-primary text-primary-foreground mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {index + 1}
                      </div>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Interview Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Interview Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {reportData.metaData.focusedSkills.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Processing Notes */}
        {reportData.metaData.processingNotes.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Processing Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.metaData.processingNotes.map((note, index) => (
                <p key={index} className="text-muted-foreground text-xs italic">
                  {note}
                </p>
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
};

export default Report;
