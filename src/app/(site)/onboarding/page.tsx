"use client";

import React, { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DragAndDropInput from "@/components/shared/drag-and-drop-input";
import { Loader2, CheckCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { analyzeResumeSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/context/app-provider";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPE = "application/pdf";

type FormData = z.infer<typeof analyzeResumeSchema>;

// ── Step indicator ────────────────────────────────────────────────────────────
const StepIndicator: React.FC<{
  stepNum: number;
  currentStep: number;
  onClick: (n: number) => void;
  hasFile: boolean;
}> = ({ stepNum, currentStep, onClick, hasFile }) => {
  const isActive = currentStep === stepNum;
  const isCompleted = currentStep > stepNum;
  const isClickable = stepNum === 1 || (stepNum === 2 && hasFile);

  return (
    <button
      type="button"
      onClick={() => isClickable && onClick(stepNum)}
      disabled={!isClickable}
      aria-label={`Step ${stepNum}${isCompleted ? " (completed)" : isActive ? " (current)" : ""}`}
      className={cn(
        // Diamond shape via rotate-45
        "relative flex h-12 w-12 rotate-45 items-center justify-center border-4 transition-all duration-300",
        isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-40",
        isCompleted
          ? "border-primary bg-primary shadow-md" // ✅ on-theme, no green
          : isActive
            ? "border-primary/30 bg-primary ring-primary/20 shadow-lg ring-4"
            : "border-border bg-muted", // ✅ on-theme inactive
      )}
    >
      {isCompleted ? (
        <CheckCircle className="text-primary-foreground h-5 w-5 -rotate-45" />
      ) : (
        <span
          className={cn(
            "-rotate-45 text-lg font-bold",
            isActive ? "text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {stepNum}
        </span>
      )}
    </button>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const router = useRouter();
  const { analyzeResume, loading } = useAppContext();
  const { update } = useSession();

  const form = useForm<FormData>({
    resolver: zodResolver(analyzeResumeSchema),
    defaultValues: { jobDescription: "" },
  });

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) {
      // X button in DragAndDropInput
      setSelectedFile(null);
      setCurrentStep(1);
      toast.info("File removed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      return;
    }
    if (file.type !== ALLOWED_FILE_TYPE) {
      toast.error("Only PDF files are allowed");
      return;
    }

    setSelectedFile(file);
    // ✅ Auto-advance to step 2, no toast (DragAndDropInput already shows the file)
    setCurrentStep(2);
  }, []);

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!selectedFile) {
        toast.error("Please upload a resume first");
        return;
      }
      try {
        const formData = new FormData();
        formData.append("resume", selectedFile);
        formData.append("jobDescription", data.jobDescription);
        const { success, message } = await analyzeResume(formData);
        if (!success) {
          toast.error(message || "Resume analysis failed. Please try again.");
          return;
        }
        await update();
        form.reset();
        router.push("/dashboard");
      } catch (error) {
        console.log("Error analyzing resume:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        );
      }
    },
    [selectedFile, analyzeResume, form, router, update],
  );

  const handleStepClick = useCallback(
    (stepNum: number) => {
      if (stepNum === 1 || (stepNum === 2 && selectedFile)) {
        setCurrentStep(stepNum);
      }
    },
    [selectedFile],
  );

  return (
    <section className="bg-background container mx-auto min-h-screen p-4">
      <div className="flex min-h-screen w-full items-center justify-center">
        <Card className="bg-background w-full max-w-xl border-none px-4 py-8 shadow-none">
          <CardHeader>
            <CardTitle className="mx-auto w-full">
              <h1 className="text-primary text-center text-2xl font-bold md:text-3xl/8">
                Ace your next interview
              </h1>
              <p className="text-muted-foreground mt-2 mb-8 text-center text-sm font-medium md:text-base">
                Get ready to nail your next interview with our AI powered
                interview practice tool
              </p>

              {/* ── Step progress ─────────────────────────────────────────── */}
              {/* ✅ Flex-based connector: line sits between the diamonds,     */}
              {/*    never overlapping them regardless of diamond size.         */}
              <div className="mb-8 flex items-center justify-center gap-0">
                <StepIndicator
                  stepNum={1}
                  currentStep={currentStep}
                  onClick={handleStepClick}
                  hasFile={!!selectedFile}
                />

                {/* Connector line */}
                <div className="bg-border relative h-0.5 w-40 overflow-hidden">
                  <motion.div
                    className="bg-primary absolute inset-y-0 left-0"
                    initial={{ width: "0%" }}
                    animate={{ width: currentStep > 1 ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>

                <StepIndicator
                  stepNum={2}
                  currentStep={currentStep}
                  onClick={handleStepClick}
                  hasFile={!!selectedFile}
                />
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* ── Step 1: Upload ── */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-4 text-center text-xl font-bold md:text-2xl">
                  Upload your resume
                </h2>
                {/* ✅ DragAndDropInput handles file display internally — no duplicate card */}
                <DragAndDropInput handleFileSelect={handleFileSelect} />
              </motion.div>
            )}

            {/* ── Step 2: Job Description ── */}
            {currentStep === 2 && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-primary mb-4 text-xl font-bold md:text-2xl">
                  Add Job Description
                </h2>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="jobDescription"
                      render={({ field }) => (
                        <FormItem className="w-full text-left">
                          <FormControl className="w-full">
                            <Textarea
                              className="border-border bg-input focus:border-primary/50 min-h-40 w-full resize-y rounded-xl"
                              placeholder="Paste the job description here..."
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        disabled={loading}
                        className="border-border hover:border-primary/30 hover:bg-secondary rounded-xl"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading || !form.formState.isValid}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-36 rounded-xl"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing…
                          </>
                        ) : (
                          "Analyze Resume"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Onboarding;
