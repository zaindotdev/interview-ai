import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import AnalyticsView from "./analytics-view";

export const metadata = { title: "Performance Analytics | Interview AI" };

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in");

  const userId = (session.user as { id: string }).id;

  // Fetch both sources in parallel
  const [reports, history] = await Promise.all([
    db.mockInterviewsReport.findMany({
      where: { candidateId: userId },
      orderBy: { createdAt: "asc" },
    }),
    db.mockInterviewsHistory.findMany({
      where: { candidateId: userId },
      include: {
        mockInterview: { select: { topic: true, difficulty: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // ── Parse reports ──────────────────────────────────────────────────────────
  const parsedReports = reports.map((r) => {
    const report = JSON.parse(r.report);
    const metaData = JSON.parse(r.metaData);
    return {
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      topic: (metaData.topic as string) ?? "Interview",
      overallScore: (report.overallScore as number) ?? 0,
      communication:
        (report.detailedFeedback?.communication?.score as number) ?? 0,
      technicalKnowledge:
        (report.detailedFeedback?.technicalKnowledge?.score as number) ?? 0,
      problemSolving:
        (report.detailedFeedback?.problemSolving?.score as number) ?? 0,
      culturalFit:
        (report.detailedFeedback?.culturalFit?.score as number) ?? 0,
    };
  });

  // ── Aggregate stats ────────────────────────────────────────────────────────
  const completedHistory = history.filter((h) => h.status === "completed");

  // duration in history is stored in seconds
  const totalMinutes = Math.round(
    completedHistory.reduce((acc, h) => acc + (h.duration ?? 0), 0) / 60,
  );

  const avgScore =
    parsedReports.length > 0
      ? Math.round(
          (parsedReports.reduce((acc, r) => acc + r.overallScore, 0) /
            parsedReports.length) *
            10,
        ) / 10
      : 0;

  const bestScore =
    parsedReports.length > 0
      ? Math.max(...parsedReports.map((r) => r.overallScore))
      : 0;

  // ── Chart data ─────────────────────────────────────────────────────────────

  // Score trend — one point per report (chronological)
  const scoreTrend = parsedReports.map((r, i) => ({
    label:
      new Date(r.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) + (parsedReports.filter((x) => x.createdAt.slice(0, 10) === r.createdAt.slice(0, 10)).length > 1 ? ` #${i + 1}` : ""),
    topic: r.topic,
    overall: r.overallScore,
    communication: r.communication,
    technical: r.technicalKnowledge,
    problemSolving: r.problemSolving,
    culturalFit: r.culturalFit,
  }));

  // Category averages for radar + bar
  const avg = (key: keyof (typeof parsedReports)[0]) =>
    parsedReports.length > 0
      ? Math.round(
          (parsedReports.reduce((a, r) => a + (r[key] as number), 0) /
            parsedReports.length) *
            10,
        ) / 10
      : 0;

  const categoryAverages = [
    { category: "Communication", score: avg("communication"), fullMark: 10 },
    { category: "Technical", score: avg("technicalKnowledge"), fullMark: 10 },
    {
      category: "Problem Solving",
      score: avg("problemSolving"),
      fullMark: 10,
    },
    { category: "Cultural Fit", score: avg("culturalFit"), fullMark: 10 },
  ];

  return (
    <AnalyticsView
      stats={{
        totalInterviews: history.length,
        completedInterviews: completedHistory.length,
        avgScore,
        totalMinutes,
        bestScore,
      }}
      scoreTrend={scoreTrend}
      categoryAverages={categoryAverages}
      hasData={parsedReports.length > 0}
    />
  );
}