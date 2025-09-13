"use client"
import type React from "react"
import { useCallback, useEffect, useState, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadCloud, FileText, CheckCircle, TrendingUp, AlertCircle, Sparkles } from "lucide-react"
import type { ResumeScore } from "@/lib/types"
import { toast } from "sonner"
import axios from "axios"
import Link from "next/link"

interface AnalysisCardProps {
  handleResumeScore: React.Dispatch<React.SetStateAction<ResumeScore | null>>
  fetchMockInterviewss?: () => Promise<void>
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ handleResumeScore, fetchMockInterviewss }) => {
  const [selectedJob, setSelectedJob] = useState<string>("")
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [percentageProgress, setPercentageProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const targetProgressRef = useRef<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const animateProgress = useCallback((targetProgress: number) => {
    targetProgressRef.current = targetProgress
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    progressIntervalRef.current = setInterval(() => {
      setPercentageProgress((currentProgress) => {
        const diff = targetProgressRef.current - currentProgress
        if (Math.abs(diff) < 1) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
          }
          return targetProgressRef.current
        }
        const increment = diff > 0 ? Math.max(1, Math.ceil(diff * 0.1)) : Math.min(-1, Math.floor(diff * 0.1))
        return currentProgress + increment
      })
    }, 50)
  }, [])

  const resetLoadingState = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    setLoading(false)
    setPercentageProgress(0)
  }, [])

  const handleResumeAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedJob) {
      toast.error("Please select a job description")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setResumeScore(null)
    handleResumeScore(null)
    resetLoadingState()
    setLoading(true)
    setPercentageProgress(0)
    setFile(selectedFile)

    try {
      const formData = new FormData()
      formData.append("resume", selectedFile)
      formData.append("jobDescription", selectedJob)
      animateProgress(5)

      const response = await axios.post("/api/resume/analysis", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent && progressEvent.loaded && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            const adjustedProgress = Math.min(percentCompleted * 0.7, 70)
            animateProgress(adjustedProgress)
          }
        },
      })

      animateProgress(85)
      const data = await response.data

      if (data.status !== 200) {
        toast.error("Analysis failed", {
          description: "Something went wrong while analyzing your resume",
        })
        resetLoadingState()
        return
      }

      animateProgress(100)
      setTimeout(() => {
        const resumeData = data.data || data
        setResumeScore(resumeData.analysis)
        handleResumeScore(resumeData.analysis)
        resetLoadingState()
        toast.success("Resume analyzed successfully")
      }, 500)
    } catch (error) {
      console.error(error)
      toast.error("Analysis failed", {
        description: "Something went wrong while analyzing your resume",
      })
      resetLoadingState()
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const fetchResumeScore = useCallback(async () => {
    setLoading(true)
    setPercentageProgress(0)
    try {
      animateProgress(10)
      const response = await axios.get("/api/resume/report", {
        onDownloadProgress: (progressEvent) => {
          if (progressEvent && progressEvent.loaded && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            animateProgress(percentCompleted)
          }
        },
      })

      if (response.status !== 200) {
        toast.error("Failed to fetch resume data")
        resetLoadingState()
        return
      }

      animateProgress(100)
      setTimeout(() => {
        const apiData = response.data?.data?.parsedJson
        if (apiData) {
          setResumeScore(apiData)
          handleResumeScore(apiData)
        } else {
          setResumeScore(null)
          handleResumeScore(null)
        }
        resetLoadingState()
      }, 300)
    } catch (error) {
      console.error(error)
      setResumeScore(null)
      handleResumeScore(null)
      resetLoadingState()
    }
  }, [animateProgress, handleResumeScore, resetLoadingState])

  useEffect(() => {
    fetchResumeScore()
  }, [fetchResumeScore])

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Resume Analysis Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Resume Analysis</CardTitle>
              <CardDescription>Upload your resume to get detailed feedback and improvement suggestions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
              <div className="w-full max-w-sm space-y-3">
                <Progress value={percentageProgress} className="h-2" />
                <div className="text-center">
                  <p className="text-lg font-semibold">{percentageProgress}%</p>
                  <p className="text-sm text-muted-foreground">
                    {percentageProgress < 10
                      ? "Initializing analysis..."
                      : percentageProgress < 70
                        ? "Uploading and processing..."
                        : percentageProgress < 90
                          ? "Analyzing content..."
                          : "Finalizing results..."}
                  </p>
                </div>
              </div>
            </div>
          ) : resumeScore ? (
            <div className="space-y-6">
              {/* Score Overview */}
              <div className="rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Overall Score</span>
                  </div>
                  <Badge
                    variant={
                      resumeScore.score >= 80 ? "default" : resumeScore.score >= 60 ? "secondary" : "destructive"
                    }
                  >
                    {resumeScore.matchLevel}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{resumeScore.score}%</span>
                  </div>
                  <Progress value={resumeScore.score} className="h-2" />
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Key Strengths</h3>
                </div>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {resumeScore.strengths?.map((strength, index) => (
                    <div key={index} className="flex items-start space-x-2 rounded-lg bg-green-50 p-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Job Selection */}
              <div className="space-y-2">
                <Label htmlFor="job-select">Select Job Type</Label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a job description" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-engineer">Software Engineer</SelectItem>
                    <SelectItem value="data-scientist">Data Scientist</SelectItem>
                    <SelectItem value="product-manager">Product Manager</SelectItem>
                    <SelectItem value="designer">UI/UX Designer</SelectItem>
                    <SelectItem value="marketing">Marketing Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Area */}
              <div className="relative">
                <div className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/25 bg-primary/5 transition-colors hover:border-primary/50 hover:bg-primary/10">
                  <div className="text-center space-y-3">
                    <div className="rounded-full bg-primary/10 p-3 mx-auto w-fit">
                      <UploadCloud className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">{file ? file.name : "Upload your resume"}</p>
                      <p className="text-sm text-muted-foreground">PDF files only, max 10MB</p>
                    </div>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeAnalysis}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Performance Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-blue-100 p-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Interview Performance</CardTitle>
              <CardDescription>Track your mock interview progress and performance metrics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center space-y-4">
              <div className="rounded-full bg-muted p-4 mx-auto w-fit">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground">No interviews completed yet</p>
                <p className="text-sm text-muted-foreground">Start your first mock interview to see performance data</p>
              </div>
              <Button asChild>
                <Link href="/mock-interviews">Start Interview</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalysisCard
