// app/(dashboard)/resume-analysis/resume-analysis-client.tsx
"use client";

import React, { useState } from "react";
import axios, {AxiosError} from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Loader2, Plus, CheckCircle2, AlertCircle,
  Brain, ChevronRight, TrendingUp, Target, FileText,
  Calendar, Clock,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import DragAndDropInput from "@/components/shared/drag-and-drop-input";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  score: number;
  matchLevel: "High" | "Medium" | "Low";
  missingSkills: string[];
  strengths: string[];
  summary: string;
  technicalSkillsMatch?: {
    programmingLanguages?: string[];
    frameworks?: string[];
    matchPercentage?: number;
  };
  experienceAnalysis?: {
    relevantYears?: number;
    seniorityLevel?: string;
  };
  recommendations?: {
    interviewFocus?: string[];
    trainingNeeds?: string[];
    potentialConcerns?: string[];
  };
}

interface ResumeRecord {
  id: string;
  fileUrl: string;
  parsedJson: unknown;
  createdAt: string;
}

interface NewAnalysisResponse {
  analysis: AnalysisResult;
  mockInterviews: unknown[];
  tier: "free" | "premium";
}

const analyzeResumeSchema = z.object({
  resumeFile: z.instanceof(File, { message: "Resume file is required" }),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
});
type FormData = z.infer<typeof analyzeResumeSchema>;

// ── Score utilities (mirrors report page) ─────────────────────────────────────

const scoreText = (s: number) =>
  s >= 70 ? "text-chart-3" : s >= 40 ? "text-primary" : "text-destructive";

const scoreBarClass = (s: number) =>
  s >= 70 ? "bg-chart-3" : s >= 40 ? "bg-primary" : "bg-destructive";

const matchColors = {
  High:   { badge: "bg-chart-3/10 text-chart-3 border-chart-3/25",          dot: "bg-chart-3" },
  Medium: { badge: "bg-primary/10 text-primary border-primary/25",            dot: "bg-primary" },
  Low:    { badge: "bg-destructive/10 text-destructive border-destructive/25", dot: "bg-destructive" },
};

const matchVerdict = {
  High: "Strong fit",
  Medium: "Partial fit",
  Low: "Weak fit",
};

// ── Primitives ─────────────────────────────────────────────────────────────────

const Eyebrow = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground ${className}`}>
    {children}
  </p>
);

const SectionRule = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

const SkillTag = ({ label, variant }: { label: string; variant: "strength" | "missing" }) => (
  <span className={cn(
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border",
    variant === "strength"
      ? "text-chart-3 bg-chart-3/8 border-chart-3/20"
      : "text-destructive bg-destructive/8 border-destructive/20",
  )}>
    {variant === "strength"
      ? <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
      : <AlertCircle className="w-2.5 h-2.5 shrink-0" />}
    {label}
  </span>
);

// ── Resume card ────────────────────────────────────────────────────────────────

function ResumeCard({
  resume,
  index,
  isLatest,
}: {
  resume: ResumeRecord;
  index: number;
  isLatest: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const analysis = resume.parsedJson as AnalysisResult;
  const mc = matchColors[analysis.matchLevel];

  const date = new Date(resume.createdAt);
  const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeLabel = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <article
      className={cn(
        "border rounded-xl overflow-hidden bg-card transition-colors duration-200",
        isLatest ? "border-primary/35" : "border-border hover:border-primary/20",
      )}
    >
      {/* ── Card header band ─────────────────────────────────── */}
      <div className={cn(
        "flex items-center justify-between px-5 py-2.5 border-b",
        isLatest ? "bg-primary/5 border-primary/15" : "bg-secondary/40 border-border",
      )}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            #{String(index + 1).padStart(2, "0")}
          </span>
          {isLatest && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-primary border border-primary/25 bg-primary/10 rounded px-1.5 py-0.5">
              Latest
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            {dateLabel}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {timeLabel}
          </span>
        </div>
      </div>

      {/* ── Card body ─────────────────────────────────────────── */}
      <div className="flex items-stretch">

        {/* Score panel */}
        <div className="border-r border-border px-6 py-5 flex flex-col justify-between min-w-35 shrink-0 relative overflow-hidden">
          {/* Ghost watermark */}
          <span className={cn(
            "absolute -bottom-3 -right-2 font-serif text-[72px] font-black leading-none opacity-[0.05] select-none pointer-events-none",
            scoreText(analysis.score),
          )}>
            {analysis.score}
          </span>

          <Eyebrow>Match score</Eyebrow>

          <div>
            <div className={cn("font-serif text-[52px] leading-none font-black tracking-tighter relative z-10", scoreText(analysis.score))}>
              {analysis.score}
            </div>
            <div className="mt-2.5 h-0.75 bg-muted rounded-full overflow-hidden w-full">
              <div
                className={cn("h-full rounded-full", scoreBarClass(analysis.score))}
                style={{ width: `${analysis.score}%`, transition: "width 0.8s ease" }}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                "font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border",
                mc.badge,
              )}>
                {matchVerdict[analysis.matchLevel]}
              </span>
            </div>
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 px-6 py-5 flex flex-col gap-4 min-w-0">

          {/* Top row: seniority + match level */}
          <div className="flex items-center gap-2 flex-wrap">
            {analysis.experienceAnalysis?.seniorityLevel && (
              <span className="font-mono text-[10px] text-muted-foreground border border-border rounded-md px-2 py-0.5 bg-secondary">
                {analysis.experienceAnalysis.seniorityLevel}
              </span>
            )}
            <span className={cn("font-mono text-[10px] px-2 py-0.5 rounded-md border", mc.badge)}>
              {analysis.matchLevel} match
            </span>
            {analysis.technicalSkillsMatch?.matchPercentage !== undefined && (
              <span className="font-mono text-[10px] text-muted-foreground border border-border rounded-md px-2 py-0.5 bg-secondary ml-auto shrink-0">
                {analysis.technicalSkillsMatch.matchPercentage}% technical
              </span>
            )}
          </div>

          {/* Summary */}
          <div className="border-l-2 border-primary pl-4">
            <p className="text-xs leading-relaxed text-foreground line-clamp-2">
              {analysis.summary}
            </p>
          </div>

          {/* Skills row */}
          <div className="flex flex-col gap-1.5">
            {analysis.strengths.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                {analysis.strengths.slice(0, 4).map((s, i) => (
                  <SkillTag key={i} label={s} variant="strength" />
                ))}
                {analysis.strengths.length > 4 && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    +{analysis.strengths.length - 4}
                  </span>
                )}
              </div>
            )}
            {analysis.missingSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                {analysis.missingSkills.slice(0, 3).map((s, i) => (
                  <SkillTag key={i} label={s} variant="missing" />
                ))}
                {analysis.missingSkills.length > 3 && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    +{analysis.missingSkills.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="self-start font-mono text-[10px] uppercase tracking-wider text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
          >
            {expanded ? "Collapse ↑" : "Full analysis ↓"}
          </button>
        </div>
      </div>

      {/* ── Expanded detail ───────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-border px-6 py-5 space-y-5 bg-secondary/20">

          {/* All strengths */}
          {analysis.strengths.length > 0 && (
            <div>
              <Eyebrow className="mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-2.5 h-2.5" /> All strengths
              </Eyebrow>
              <div className="flex flex-wrap gap-1.5">
                {analysis.strengths.map((s, i) => <SkillTag key={i} label={s} variant="strength" />)}
              </div>
            </div>
          )}

          {/* All gaps */}
          {analysis.missingSkills.length > 0 && (
            <div>
              <Eyebrow className="mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-2.5 h-2.5" /> Skill gaps
              </Eyebrow>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills.map((s, i) => <SkillTag key={i} label={s} variant="missing" />)}
              </div>
            </div>
          )}

          {/* Technical match grid */}
          {analysis.technicalSkillsMatch && (
            <div className="grid grid-cols-2 gap-4">
              {analysis.technicalSkillsMatch.programmingLanguages?.length ? (
                <div>
                  <Eyebrow className="mb-2">Languages</Eyebrow>
                  <div className="flex flex-wrap gap-1">
                    {analysis.technicalSkillsMatch.programmingLanguages.map((l, i) => (
                      <span key={i} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {analysis.technicalSkillsMatch.frameworks?.length ? (
                <div>
                  <Eyebrow className="mb-2">Frameworks</Eyebrow>
                  <div className="flex flex-wrap gap-1">
                    {analysis.technicalSkillsMatch.frameworks.map((f, i) => (
                      <span key={i} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Interview focus */}
          {analysis.recommendations?.interviewFocus?.length ? (
            <div>
              <Eyebrow className="mb-2 flex items-center gap-1.5">
                <Target className="w-2.5 h-2.5" /> Interview focus
              </Eyebrow>
              <div className="flex flex-col gap-1.5">
                {analysis.recommendations.interviewFocus.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="font-mono text-[9px] text-muted-foreground border border-border rounded px-1 py-px shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* File link */}
          <Link
            href={resume.fileUrl}
            target="_blank"
            download={true}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary hover:text-primary/70 transition-colors"
          >
            <FileText className="w-3 h-3" />
            View resume PDF
          </Link>
        </div>
      )}
    </article>
  );
}

// ── New analysis form ──────────────────────────────────────────────────────────

function NewAnalysisForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(analyzeResumeSchema),
    defaultValues: { jobDescription: "" },
  });

  const handleFileSelect = (file: File | null) => {
    if (!file) { setSelectedFile(null); form.setValue("resumeFile", undefined as unknown as File); return; }
    if (!file.type.includes("pdf")) { toast.error("Only PDF files are supported"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large. Max 10MB"); return; }
    setSelectedFile(file);
    form.setValue("resumeFile", file);
    form.clearErrors("resumeFile");
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedFile) { form.setError("resumeFile", { message: "Please upload your resume" }); return; }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("resume", selectedFile);
      payload.append("jobDescription", data.jobDescription);
      await axios.post<{ data: NewAnalysisResponse }>("/api/resume/analysis", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Resume analyzed successfully!");
      onSuccess();
    } catch (error) {
      if(error instanceof AxiosError){
        toast.error(error?.response?.data?.message ?? "Failed to analyze resume. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-2">

        {/* File upload */}
        <div className="space-y-2">
          <Eyebrow className="mb-2">Resume (PDF · max 10 MB)</Eyebrow>
          <DragAndDropInput handleFileSelect={handleFileSelect} />
          {form.formState.errors.resumeFile && (
            <p className="text-xs text-destructive flex items-center gap-1.5 font-mono">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {form.formState.errors.resumeFile.message as string}
            </p>
          )}
        </div>

        {/* Job description */}
        <FormField
          control={form.control}
          name="jobDescription"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <Eyebrow>Job description</Eyebrow>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Paste the full job description — include responsibilities, requirements, and tech stack for best results…"
                  rows={7}
                  className={cn(
                    "resize-none rounded-xl bg-input border-border text-foreground text-sm leading-relaxed",
                    "placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-0",
                    "hover:border-primary/30 transition-colors",
                  )}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive font-mono" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing your resume…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analyze resume
              <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
            </span>
          )}
        </Button>
      </form>
    </Form>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ResumeAnalysisClient({ resumes }: { resumes: ResumeRecord[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSuccess = () => {
    setDialogOpen(false);
    router.refresh();
  };

  // ── Aggregate stats ──────────────────────────────────────────────────────────
  const analyses = resumes.map((r) => r.parsedJson as AnalysisResult);
  const avgScore = analyses.length
    ? Math.round(analyses.reduce((a, r) => a + r.score, 0) / analyses.length)
    : 0;
  const highMatchCount = analyses.filter((a) => a.matchLevel === "High").length;
  const bestScore = analyses.length ? Math.max(...analyses.map((a) => a.score)) : 0;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 pb-24">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <header className="border-b border-border mb-10">
          <div className="flex items-stretch min-h-45">

            {/* Left: title block */}
            <div className="flex-1 py-10 pr-10 border-r border-border flex flex-col justify-between">
              <Eyebrow>Analysis & Tools · Resume</Eyebrow>
              <div>
                <h1 className="font-serif text-[38px] font-black tracking-tight text-foreground leading-none mt-2">
                  Resume Analysis
                </h1>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {resumes.length > 0
                    ? `${resumes.length} resume${resumes.length > 1 ? "s" : ""} analyzed — latest on top.`
                    : "Upload your resume and a job description to get an AI-powered match report."}
                </p>
              </div>
            </div>

            {/* Right: stats + CTA */}
            <div className="flex flex-col justify-between py-10 pl-10 shrink-0 min-w-55">
              {resumes.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    ["Avg score", avgScore],
                    ["Best", bestScore],
                    ["High match", highMatchCount],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <Eyebrow className="mb-1">{label}</Eyebrow>
                      <span className={cn(
                        "font-serif text-2xl font-black leading-none",
                        label === "High match" && Number(value) > 0 ? "text-chart-3" : "text-foreground",
                      )}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div />
              )}

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2 self-start">
                    <Plus className="w-4 h-4" />
                    New Analysis
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-background border-border p-6">
                  <DialogHeader className="mb-1">
                    <div className="mb-3">
                      <Eyebrow>Resume Analysis</Eyebrow>
                    </div>
                    <DialogTitle className="font-serif text-xl font-black text-foreground">
                      New analysis
                    </DialogTitle>
                  </DialogHeader>
                  <NewAnalysisForm onSuccess={handleSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center gap-4 rounded-xl border border-dashed border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/8 border border-primary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No resumes analyzed yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click{" "}
                <button
                  onClick={() => setDialogOpen(true)}
                  className="text-primary font-medium hover:underline underline-offset-2"
                >
                  New Analysis
                </button>{" "}
                to get started
              </p>
            </div>
          </div>
        )}

        {/* ── Resume list ──────────────────────────────────────────────────── */}
        {resumes.length > 0 && (
          <section>
            <SectionRule label="All analyses" />
            <div className="flex flex-col gap-4">
              {resumes.map((resume, i) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  index={i}
                  isLatest={i === 0}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}