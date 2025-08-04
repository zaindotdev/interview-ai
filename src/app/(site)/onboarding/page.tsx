"use client";
import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DragAndDropInput from "@/components/shared/drag-and-drop-input";
import { Loader2, CheckCircle, FileText } from "lucide-react";
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
import {useSession} from "next-auth/react"

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPE = "application/pdf";
const TOTAL_STEPS = 2;

// Types
interface StepState {
  current: number;
  total: number;
}

type FormData = z.infer<typeof analyzeResumeSchema>;

// Component
const Onboarding: React.FC = () => {
  // State
  const [steps, setSteps] = useState<StepState>({
    current: 1,
    total: TOTAL_STEPS,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Hooks
  const router = useRouter();
  const { analyzeResume, loading, error, clearError } = useAppContext();
  
  const form = useForm<FormData>({
    resolver: zodResolver(analyzeResumeSchema),
    defaultValues: {
      jobDescription: "",
    },
  });

  const {update} = useSession();

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [steps.current, clearError]);

  // File validation helper
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    
    if (file.type !== ALLOWED_FILE_TYPE) {
      return "Only PDF files are allowed";
    }
    
    return null;
  }, []);

  // File selection handler
  const handleFileSelect = useCallback((file: File) => {
    console.info("Processing file upload...");
    
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSelectedFile(file);
    setSteps(prev => ({ ...prev, current: prev.current + 1 }));
    
    toast.success(`File "${file.name}" uploaded successfully!`);
    console.info("File uploaded successfully:", file.name);
  }, [validateFile]);

  // Form submission handler
  const onSubmit = useCallback(async (data: FormData) => {
    if (!selectedFile) {
      toast.error("Please upload a resume first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("jobDescription", data.jobDescription);

      console.log("Submitting analysis request...");
      await analyzeResume(formData);
      await update();
      
      // Reset form on success
      form.reset();
      toast.success("Resume analysis completed successfully!");
      
      // Navigate to results page (adjust route as needed)
      router.push("/dashboard");
    } catch (err) {
      // Error is handled by the context, just show a toast
      toast.error("Failed to analyze resume. Please try again.");
    }
  }, [selectedFile, analyzeResume, form, router]);

  // Step navigation handler
  const handleStepClick = useCallback((stepNum: number) => {
    // Only allow navigation to valid steps
    if (stepNum === 1 || (stepNum === 2 && selectedFile)) {
      setSteps(prev => ({ ...prev, current: stepNum }));
    }
  }, [selectedFile]);

  // File removal handler
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setSteps(prev => ({ ...prev, current: 1 }));
    toast.info("File removed");
  }, []);

  // Step component
  const StepIndicator: React.FC<{ stepNum: number }> = ({ stepNum }) => {
    const isActive = steps.current === stepNum;
    const isCompleted = steps.current > stepNum;
    const isClickable = stepNum === 1 || (stepNum === 2 && selectedFile);

    return (
      <div
        className={`flex h-12 w-12 rotate-45 items-center justify-center border-4 border-white transition-all duration-300 ${
          isClickable
            ? "cursor-pointer"
            : "cursor-not-allowed opacity-50"
        } ${
          isActive
            ? "bg-primary ring-primary shadow-lg ring-4"
            : isCompleted
              ? "bg-green-500 shadow-md"
              : "hover:bg-primary/60 bg-primary"
        }`}
        onClick={() => handleStepClick(stepNum)}
        role="button"
        tabIndex={isClickable ? 0 : -1}
        aria-label={`Step ${stepNum}${isCompleted ? " (completed)" : isActive ? " (current)" : ""}`}
      >
        {isCompleted ? (
          <CheckCircle className="h-6 w-6 -rotate-45 text-white" />
        ) : (
          <span
            className={`-rotate-45 text-lg font-bold ${
              isActive ? "text-white" : "text-gray-600"
            }`}
          >
            {stepNum}
          </span>
        )}
      </div>
    );
  };

  return (
    <section className="container mx-auto min-h-screen bg-gray-50 p-4">
      <div className="flex min-h-screen w-full items-center justify-center">
        <Card className="w-full max-w-xl px-4 py-8 shadow-lg">
          <CardHeader>
            <CardTitle className="mx-auto">
              <h1 className="text-primary text-center text-2xl font-bold md:text-3xl/8">
                Ace your next interview
              </h1>
              <p className="mt-2 mb-6 max-w-sm text-center text-sm font-medium text-gray-600 md:text-base">
                Get ready to nail your next interview with our AI powered
                interview practice tool
              </p>

              {/* Progressive Stepper */}
              <div className="relative mb-6">
                {/* Background Line */}
                <div className="absolute top-6 right-6 left-6 z-0 h-0.5 bg-neutral-300" />

                {/* Animated Progress Line */}
                <motion.div
                  className="bg-primary absolute top-6 left-6 z-10 h-0.5"
                  initial={{ width: 0 }}
                  animate={{
                    width: steps.current === 1 ? "0%" : "100%",
                  }}
                  transition={{ duration: 0.5 }}
                />

                {/* Steps Container */}
                <div className="relative z-20 flex items-center justify-between">
                  {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((stepNum) => (
                    <StepIndicator key={stepNum} stepNum={stepNum} />
                  ))}
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Step 1: File Upload */}
            {steps.current === 1 && (
              <div>
                <h2 className="mb-4 text-center text-xl font-bold md:text-2xl">
                  Upload your resume
                </h2>
                <DragAndDropInput handleFileSelect={handleFileSelect} />
                
                {selectedFile && (
                  <motion.div 
                    className="mt-4 text-center p-4 bg-green-50 rounded-lg border border-green-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium text-green-800">
                        {selectedFile.name}
                      </p>
                    </div>
                    <p className="text-xs text-green-600 mb-3">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => setSteps(prev => ({ ...prev, current: 2 }))}
                        size="sm"
                      >
                        Continue
                      </Button>
                      <Button
                        onClick={handleRemoveFile}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 2: Job Description */}
            {steps.current === 2 && (
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
                        <FormItem className="w-full">
                          <FormControl className="w-full">
                            <Textarea
                              className="w-full h-[150px] resize-none"
                              placeholder="Paste the job description here..."
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSteps(prev => ({ ...prev, current: 1 }))}
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading || !form.formState.isValid}
                        className="min-w-[120px]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
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