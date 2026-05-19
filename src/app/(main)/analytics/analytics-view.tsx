"use client";

import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  BarChart2,
  Clock,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stats = {
  totalInterviews: number;
  completedInterviews: number;
  avgScore: number;
  totalMinutes: number;
  bestScore: number;
};

type ScoreTrendPoint = {
  label: string;
  topic: string;
  overall: number;
  communication: number;
  technical: number;
  problemSolving: number;
  culturalFit: number;
};

type CategoryAverage = {
  category: string;
  score: number;
  fullMark: number;
};

type Props = {
  stats: Stats;
  scoreTrend: ScoreTrendPoint[];
  categoryAverages: CategoryAverage[];
  hasData: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const LINES = [
  { key: "overall", label: "Overall", color: "#7a3a1e" },
  { key: "communication", label: "Communication", color: "#2196f3" },
  { key: "technical", label: "Technical", color: "#4caf50" },
  { key: "problemSolving", label: "Problem Solving", color: "#d4a990" },
  { key: "culturalFit", label: "Cultural Fit", color: "#e91e63" },
] as const;

const BAR_COLORS = ["#7a3a1e", "#2196f3", "#4caf50", "#d4a990"];

function getScoreColor(score: number) {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-amber-600";
  if (score >= 4) return "text-orange-600";
  return "text-red-600";
}

function formatMinutes(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">
          {label}
        </span>
        <div className="bg-secondary border-border rounded-lg border p-1.5 text-muted-foreground">
          {icon}
        </div>
      </div>
      <div>
        <p className={cn("text-3xl font-bold tracking-tight", valueClass)}>
          {value}
        </p>
        {sub && (
          <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

type LineTooltipPayload = {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
  payload?: ScoreTrendPoint;
};

type LineTooltipProps = {
  active?: boolean;
  payload?: LineTooltipPayload[];
  label?: string | number;
};

type BarTooltipPayload = {
  payload?: CategoryAverage;
};

type BarTooltipProps = {
  active?: boolean;
  payload?: BarTooltipPayload[];
};

const LineTooltip = ({ active, payload, label }: LineTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border-border rounded-xl border p-3 shadow-md text-xs">
      <p className="text-foreground mb-2 font-semibold">
        {payload[0]?.payload?.topic ?? label}
      </p>
      {payload.map((p, index) => (
        <div
          key={p.dataKey ?? p.name ?? index}
          className="flex items-center justify-between gap-4"
        >
          <span className="text-muted-foreground flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: p.color }}
            />
            {p.name}
          </span>
          <span className="font-semibold" style={{ color: p.color }}>
            {p.value ?? 0}/10
          </span>
        </div>
      ))}
    </div>
  );
};

const BarTooltip = ({ active, payload }: BarTooltipProps) => {
  if (!active || !payload?.length) return null;
  const { category, score } = payload[0]?.payload ?? {};
  return (
    <div className="bg-card border-border rounded-xl border p-3 shadow-md text-xs">
      <p className="text-foreground font-semibold">{category}</p>
      <p className="text-muted-foreground mt-0.5">
        Avg score: <span className="text-foreground font-bold">{score}/10</span>
      </p>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="bg-secondary border-border rounded-2xl border p-5">
        <BarChart2 className="text-muted-foreground h-8 w-8" />
      </div>
      <div className="space-y-1">
        <p className="text-foreground font-semibold">No data yet</p>
        <p className="text-muted-foreground max-w-xs text-sm">
          Complete your first mock interview to start seeing performance analytics here.
        </p>
      </div>
      <Button
        size="sm"
        onClick={() => router.push("/mock-interviews")}
        className="gap-1.5"
      >
        Start an Interview
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h2 className="text-foreground font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>
      </div>
      <span className="text-primary">{icon}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsView({
  stats,
  scoreTrend,
  categoryAverages,
  hasData,
}: Props) {
  return (
    <div className="space-y-6 pb-12">
      {/* ── Page heading ── */}
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
          Performance Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Track your interview progress and identify areas to focus on.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Layers className="h-4 w-4" />}
          label="Total Sessions"
          value={String(stats.totalInterviews)}
          sub={`${stats.completedInterviews} completed`}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Average Score"
          value={hasData ? `${stats.avgScore}/10` : "—"}
          sub={hasData ? "across all interviews" : "no data yet"}
          valueClass={hasData ? getScoreColor(stats.avgScore) : undefined}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Best Score"
          value={hasData ? `${stats.bestScore}/10` : "—"}
          sub={hasData ? "personal best" : "no data yet"}
          valueClass={hasData ? getScoreColor(stats.bestScore) : undefined}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Time Practiced"
          value={stats.totalMinutes > 0 ? formatMinutes(stats.totalMinutes) : "—"}
          sub={stats.totalMinutes > 0 ? "total interview time" : "no sessions yet"}
        />
      </div>

      {/* ── Empty state ── */}
      {!hasData && <EmptyState />}

      {hasData && (
        <>
          {/* ── Score trend ── */}
          <div className="bg-card rounded-2xl border p-6">
            <SectionHeader
              icon={<TrendingUp className="h-4 w-4" />}
              title="Score Trend"
              sub="How your scores have changed across interviews"
            />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={scoreTrend}
                margin={{ top: 4, right: 12, left: -16, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 11,
                    fontFamily: "var(--font-sans)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 11,
                    fontFamily: "var(--font-sans)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<LineTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
                    paddingTop: "16px",
                  }}
                />
                {LINES.map(({ key, label, color }) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={label}
                    stroke={color}
                    strokeWidth={key === "overall" ? 2.5 : 1.5}
                    dot={{
                      r: key === "overall" ? 4 : 3,
                      fill: color,
                      strokeWidth: 0,
                    }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    strokeDasharray={key === "overall" ? undefined : "4 2"}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── Category breakdown ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Radar */}
            <div className="bg-card rounded-2xl border p-6">
              <SectionHeader
                icon={<BarChart2 className="h-4 w-4" />}
                title="Category Overview"
                sub="Average score per skill across all sessions"
              />
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={categoryAverages}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 12,
                      fontFamily: "var(--font-sans)",
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-card border-border rounded-xl border p-3 shadow-md text-xs">
                          <p className="text-foreground font-semibold">{d?.category}</p>
                          <p className="text-muted-foreground mt-0.5">
                            Avg:{" "}
                            <span className="text-foreground font-bold">
                              {d?.score}/10
                            </span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Radar
                    name="Avg Score"
                    dataKey="score"
                    stroke="#7a3a1e"
                    fill="#7a3a1e"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart */}
            <div className="bg-card rounded-2xl border p-6">
              <SectionHeader
                icon={<BarChart2 className="h-4 w-4" />}
                title="Category Scores"
                sub="Average performance per category"
              />
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={categoryAverages}
                  margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                      fontFamily: "var(--font-sans)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                      fontFamily: "var(--font-sans)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={56}>
                    {categoryAverages.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Score legend ── */}
          <div className="border-border flex flex-wrap items-center gap-3 rounded-xl border border-dashed p-4">
            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">
              Score guide
            </span>
            {[
              { label: "Exceptional", range: "9–10", color: "text-green-600" },
              { label: "Proficient", range: "7–8", color: "text-green-600" },
              { label: "Developing", range: "5–6", color: "text-amber-600" },
              { label: "Needs Work", range: "3–4", color: "text-orange-600" },
              { label: "Insufficient", range: "1–2", color: "text-red-600" },
            ].map(({ label, range, color }) => (
              <span key={label} className="flex items-center gap-1 text-xs">
                <span className={cn("font-semibold", color)}>{range}</span>
                <span className="text-muted-foreground">{label}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}