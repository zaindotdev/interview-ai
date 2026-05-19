"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
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
    chartConfig?: {
      chartData: Array<{ category: string; score: number; benchmark: number }>;
    };
    processingNotes: string[];
    generatedAt: string;
  };
  createdAt: string;
}

// ── Utilities ──────────────────────────────────────────────────────────────────

const scoreText = (s: number) =>
  s >= 7 ? "text-chart-3" : s >= 4 ? "text-primary" : "text-destructive";

const scoreBg = (s: number) =>
  s >= 7
    ? "bg-chart-3/10 text-chart-3 border-chart-3/25"
    : s >= 4
      ? "bg-primary/10 text-primary border-primary/25"
      : "bg-destructive/10 text-destructive border-destructive/25";

const scoreBarClass = (s: number) =>
  s >= 7 ? "bg-chart-3" : s >= 4 ? "bg-primary" : "bg-destructive";

const scoreLabel = (s: number) =>
  s >= 7 ? "Strong" : s >= 5 ? "Fair" : s >= 3 ? "Weak" : "Poor";

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  return m === 0 ? "< 1 min" : m === 1 ? "1 min" : `${m} mins`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const humanizeKey = (key: string) => key.replace(/([A-Z])/g, " $1").trim();

// ── Primitives ─────────────────────────────────────────────────────────────────

const Eyebrow = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p
    className={`text-muted-foreground font-mono text-[9px] tracking-[0.18em] uppercase ${className}`}
  >
    {children}
  </p>
);

const SectionLabel = ({
  n,
  children,
}: {
  n: string;
  children: React.ReactNode;
}) => (
  <div className="mb-5 flex items-center gap-3">
    <span className="text-muted-foreground border-border rounded border px-1.5 py-0.5 font-mono text-[10px] leading-none">
      {n}
    </span>
    <span className="text-muted-foreground font-mono text-[9px] tracking-[0.16em] uppercase">
      {children}
    </span>
    <div className="bg-border h-px flex-1" />
  </div>
);

// ── States ─────────────────────────────────────────────────────────────────────

const LoadingState = () => (
  <main className="bg-background flex min-h-screen items-center justify-center">
    <div className="border-border border-t-primary size-7 animate-spin rounded-full border-2" />
  </main>
);

const EmptyState = () => (
  <main className="bg-background flex min-h-screen flex-col items-center justify-center gap-2">
    <p className="text-foreground font-serif text-xl font-bold">
      Report not found
    </p>
    <p className="text-muted-foreground text-sm">
      The requested interview report could not be located.
    </p>
  </main>
);

// ── Main ───────────────────────────────────────────────────────────────────────

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
        });
      } else {
        const raw = res.data.data.report;
        setReportData({
          ...raw,
          report: {
            ...raw.report,
            redFlags: raw.report.redFlags ?? [],
            nextSteps: raw.report.nextSteps ?? [],
            recommendations: raw.report.recommendations ?? [],
            strengths: raw.report.strengths ?? [],
            areasForImprovement: raw.report.areasForImprovement ?? [],
          },
          metaData: {
            ...raw.metaData,
            processingNotes: raw.metaData.processingNotes ?? [],
            focusedSkills: raw.metaData.focusedSkills ?? [],
            // chartConfig intentionally left as-is (may be undefined for free tier)
          },
        });
      }
    } catch (error) {
      if (error instanceof Error)
        toast.error("Something went wrong", { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) fetchReport();
  }, [fetchReport, reportId]);

  if (loading) return <LoadingState />;
  if (!reportData) return <EmptyState />;

  const { report, metaData } = reportData;

  const categories = Object.entries(report.detailedFeedback) as Array<
    [string, { score: number; feedback: string }]
  >;

  /**
   * Chart data strategy:
   * - Premium users: use AI-generated chartConfig with benchmark values
   * - Free users: derive from detailedFeedback scores (always available),
   *   use a static benchmark of 7 as baseline
   */
  const chartData =
    (metaData.chartConfig?.chartData ?? []).length > 0
      ? metaData.chartConfig!.chartData
      : categories.map(([key, val]) => ({
          category: humanizeKey(key),
          score: val.score,
          benchmark: 7,
        }));

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 pb-28">
        {/* ── Red flags banner (conditional) ────────────────────────────── */}
        {report.redFlags.length > 0 && (
          <div className="border-destructive/20 bg-destructive/5 -mx-6 mb-0 flex items-center gap-3 border-b px-6 py-3">
            <span className="text-destructive font-mono text-[9px] font-bold tracking-widest uppercase">
              {report.redFlags.length} red flag
              {report.redFlags.length > 1 ? "s" : ""} detected
            </span>
            <div className="bg-destructive/15 h-px flex-1" />
            <span className="text-destructive/70 text-xs font-medium">
              {report.redFlags[0]}
              {report.redFlags.length > 1 &&
                ` +${report.redFlags.length - 1} more`}
            </span>
          </div>
        )}

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <header className="border-border mb-10 border-b">
          <div className="flex min-h-55 items-stretch">
            {/* Score panel */}
            <div className="border-border flex min-w-45 shrink-0 flex-col justify-between border-r py-10 pr-10">
              <Eyebrow>Overall score</Eyebrow>
              <div>
                <div
                  className={`font-serif text-[100px] leading-none font-black tracking-tighter ${scoreText(report.overallScore)}`}
                >
                  {report.overallScore}
                </div>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="bg-muted h-0.75 flex-1 overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full ${scoreBarClass(report.overallScore)}`}
                      style={{ width: `${report.overallScore * 10}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                    / 10
                  </span>
                </div>
                <p
                  className={`mt-1.5 font-mono text-[10px] tracking-widest uppercase ${scoreText(report.overallScore)}`}
                >
                  {scoreLabel(report.overallScore)}
                </p>
              </div>
            </div>

            {/* Title + meta panel */}
            <div className="flex flex-1 flex-col justify-between py-10 pl-10">
              <div>
                <Eyebrow>
                  Interview Report · {formatDate(metaData.generatedAt)}
                </Eyebrow>
                <h1 className="text-foreground mt-2 font-serif text-[34px] leading-tight font-black tracking-tight">
                  {metaData.topic}
                </h1>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex gap-10">
                  {[
                    ["Duration", formatDuration(metaData.duration)],
                    [
                      "Confidence",
                      `${(metaData.confidence / 10).toFixed(1)}/10`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <Eyebrow className="mb-1">{label}</Eyebrow>
                      <span className="text-foreground text-sm font-medium">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Focused skills */}
                <div className="flex max-w-xs flex-wrap justify-end gap-1.5">
                  {metaData.focusedSkills.slice(0, 5).map((t, i) => (
                    <span
                      key={i}
                      className="text-muted-foreground border-border bg-secondary rounded-md border px-2 py-0.5 font-mono text-[10px]"
                    >
                      {t}
                    </span>
                  ))}
                  {metaData.focusedSkills.length > 5 && (
                    <span className="text-muted-foreground px-2 py-0.5 font-mono text-[10px]">
                      +{metaData.focusedSkills.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Category strip ────────────────────────────────────────────── */}
        <div className="border-border mb-10 grid grid-cols-4 overflow-hidden rounded-xl border">
          {categories.map(([key, val], i) => (
            <div
              key={key}
              className={`bg-card relative overflow-hidden px-6 pt-5 pb-4 ${i > 0 ? "border-border border-l" : ""}`}
            >
              <span
                className={`pointer-events-none absolute -right-1 -bottom-3 font-serif text-[72px] leading-none font-black opacity-[0.06] select-none ${scoreText(val.score)}`}
              >
                {val.score}
              </span>
              <div
                className={`font-serif text-4xl leading-none font-black ${scoreText(val.score)} relative z-10`}
              >
                {val.score}
              </div>
              <div className="bg-muted mt-3 h-0.75 overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full ${scoreBarClass(val.score)}`}
                  style={{ width: `${val.score * 10}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-muted-foreground relative z-10 font-mono text-[9px] tracking-wider uppercase">
                  {humanizeKey(key)}
                </p>
                <span
                  className={`font-mono text-[9px] tracking-wide uppercase ${scoreText(val.score)}`}
                >
                  {scoreLabel(val.score)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Body grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-[1fr_300px] items-start gap-8">
          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-10">
            {/* 01 · Summary */}
            <section>
              <SectionLabel n="01">Executive summary</SectionLabel>
              <div className="border-primary border-l-2 pl-5">
                <p className="text-foreground text-sm leading-[1.85]">
                  {report.summary}
                </p>
              </div>
            </section>

            {/* 02 · Detailed assessment */}
            <section>
              <SectionLabel n="02">Detailed assessment</SectionLabel>
              <div className="flex flex-col">
                {categories.map(([key, val], i) => (
                  <div
                    key={key}
                    className={`grid grid-cols-[140px_1fr] gap-8 py-5 ${i < categories.length - 1 ? "border-border border-b" : ""}`}
                  >
                    <div>
                      <div
                        className={`font-serif text-3xl leading-none font-black ${scoreText(val.score)}`}
                      >
                        {val.score}
                        <span className="text-muted-foreground ml-1 font-sans text-base font-normal">
                          /10
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-2 font-mono text-[9px] leading-snug tracking-wider uppercase">
                        {humanizeKey(key)}
                      </p>
                      <div className="bg-muted mt-2.5 h-0.75 overflow-hidden rounded-full">
                        <div
                          className={`h-full rounded-full ${scoreBarClass(val.score)}`}
                          style={{ width: `${val.score * 10}%` }}
                        />
                      </div>
                      <span
                        className={`mt-2 inline-block rounded border px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase ${scoreBg(val.score)}`}
                      >
                        {scoreLabel(val.score)}
                      </span>
                    </div>
                    <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
                      {val.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 03 · Performance chart — always rendered, data derived for free tier */}
            <section>
              <SectionLabel n="03">Performance vs. benchmark</SectionLabel>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={chartData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{
                        fill: "var(--muted-foreground)",
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                      }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 10]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Candidate"
                      dataKey="score"
                      stroke="var(--primary)"
                      fill="var(--primary)"
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Benchmark"
                      dataKey="benchmark"
                      stroke="var(--muted-foreground)"
                      fill="transparent"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                        color: "var(--muted-foreground)",
                        paddingTop: 8,
                      }}
                    />
                    <Tooltip
                      labelClassName="text-sm uppercase"
                      wrapperClassName="rounded-xl bg-linear-to-b from-primary/10 via-transparent to-primary/5"
                      contentStyle={{
                        fontSize: "14px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-8">
            {/* Strengths */}
            <section>
              <SectionLabel n="A">Strengths</SectionLabel>
              {report.strengths.length === 0 ? (
                <p className="text-muted-foreground text-xs italic">
                  No strengths recorded.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {report.strengths.map((s, i) => (
                    <div
                      key={i}
                      className="border-border flex items-start gap-3 border-b py-2 last:border-0"
                    >
                      <span className="bg-chart-3/15 border-chart-3/30 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border">
                        <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                          <path
                            d="M1 3.5L3 5.5L6 1.5"
                            stroke="var(--color-chart-3, #4caf50)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="text-foreground text-xs leading-snug">
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Areas for improvement */}
            <section>
              <SectionLabel n="B">Improvement areas</SectionLabel>
              <div className="flex flex-col">
                {report.areasForImprovement.map((a, i) => (
                  <div
                    key={i}
                    className="border-border flex items-start gap-3 border-b py-2.5 last:border-0"
                  >
                    <span className="text-muted-foreground mt-0.5 w-5 shrink-0 text-right font-mono text-[10px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-foreground text-xs leading-snug">
                      {a}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Red flags (full detail) */}
            {report.redFlags.length > 0 && (
              <section>
                <SectionLabel n="C">Red flags</SectionLabel>
                <div className="border-destructive/25 overflow-hidden rounded-lg border">
                  {report.redFlags.map((f, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 px-4 py-3 ${i > 0 ? "border-destructive/15 border-t" : ""} bg-destructive/5`}
                    >
                      <span className="text-destructive border-destructive/30 mt-0.5 shrink-0 rounded border px-1 py-px font-mono text-[10px] font-bold">
                        !
                      </span>
                      <span className="text-foreground text-xs leading-snug">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recommendations */}
            <section>
              <SectionLabel n="D">Recommendations</SectionLabel>
              <div className="flex flex-col gap-3">
                {report.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-muted-foreground border-border mt-0.5 shrink-0 rounded border px-1 py-px font-mono text-[9px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-foreground text-xs leading-relaxed">
                      {r}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ── Next steps ─────────────────────────────────────────────────── */}
        <section className="border-border mt-12 border-t pt-8">
          <SectionLabel n="04">Next steps</SectionLabel>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {report.nextSteps.map((s, i) => (
              <div
                key={i}
                className="bg-card border-border flex flex-col gap-3 rounded-xl border p-5"
              >
                <span className="text-primary-foreground bg-primary self-start rounded px-1.5 py-0.5 font-mono text-[10px] font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-card-foreground text-sm leading-snug">{s}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Processing notes (premium only) ───────────────────────────── */}
        {metaData.processingNotes.length > 0 && (
          <div className="border-border mt-8 border-t pt-5">
            <Eyebrow className="mb-2">Processing notes</Eyebrow>
            {metaData.processingNotes.map((n, i) => (
              <p
                key={i}
                className="text-muted-foreground font-mono text-[11px] leading-relaxed italic"
              >
                {n}
              </p>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Report;
