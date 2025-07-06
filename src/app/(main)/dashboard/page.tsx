"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import {
  Loader2,
  UploadCloud,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Target,
  Brain,
  Award,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import axios from "axios"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Hard coded jobs
const jobs = [
  {
    title: "Frontend Developer",
    description:
      "Build and optimize user-facing web interfaces using technologies like React, Next.js, or Vue. Focus on performance, accessibility, and responsive design.",
  },
  {
    title: "Backend Developer",
    description:
      "Design and implement server-side logic, databases, and APIs using technologies like Node.js, Python, or Go to support web and mobile applications.",
  },
  {
    title: "Full Stack Developer",
    description:
      "Work on both frontend and backend of applications, integrating databases, APIs, and UI components to create complete web solutions.",
  },
  {
    title: "Data Analyst",
    description:
      "Collect, process, and analyze large datasets to help organizations make data-driven decisions using tools like SQL, Excel, and Python.",
  },
  {
    title: "AI/ML Engineer",
    description:
      "Develop and deploy machine learning models and AI systems using frameworks like TensorFlow or PyTorch to solve real-world problems.",
  },
  {
    title: "DevOps Engineer",
    description:
      "Manage infrastructure, CI/CD pipelines, and deployment workflows to ensure reliable and scalable software delivery.",
  },
  {
    title: "Mobile App Developer",
    description:
      "Create mobile applications for Android or iOS platforms using React Native, Flutter, or native development tools.",
  },
  {
    title: "UI/UX Designer",
    description:
      "Design intuitive, user-friendly interfaces and experiences based on user research, wireframing, and prototyping.",
  },
  {
    title: "Product Manager",
    description:
      "Define product vision, roadmap, and features by coordinating with cross-functional teams and prioritizing user needs.",
  },
  {
    title: "Cloud Engineer",
    description:
      "Design and maintain cloud-based infrastructure using platforms like AWS, Azure, or Google Cloud to support scalable and secure applications.",
  },
]

interface AnalysisResult {
  score: number
  matchLevel: string
  missingSkills: string[]
  strengths: string[]
  summary: string
}

const Dashboard = () => {
  const { data: session, status } = useSession()
  const user = session?.user
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [selectedJob, setSelectedJob] = useState(jobs[0].title)
  const [jobDescription, setJobDescription] = useState(jobs[0].description)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const handleJobChange = (jobTitle: string) => {
    const job = jobs.find((j) => j.title === jobTitle)
    if (job) {
      setSelectedJob(jobTitle)
      setJobDescription(job.description)
    }
  }

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setLoading(true)

    try {
      const formData = new FormData()
      if (!file) {
        toast.error("Failed to upload the Resume")
        return
      }

      setFileName(file.name)
      formData.append("resume", file)
      formData.append("jobDescription", jobDescription)

      const res = await axios.post("/api/resume/analysis", formData)
      if (res.status !== 200) {
        console.log(res)
        toast.error("Failed to upload the Resume")
        return
      }

      setAnalysisResult(res.data.data)
      toast.success("Resume analyzed successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong", {
        description: "Something went wrong while uploading your resume",
      })
    } finally {
      setLoading(false)
    }
  },[jobDescription, setLoading, toast, setAnalysisResult, setFileName, setSelectedJob])

  const getMatchLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-orange-600"
      case "low":
        return "bg-orange-800"
      default:
        return "bg-orange-400"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-orange-600"
    if (score >= 60) return "text-orange-700"
    if (score >= 40) return "text-orange-800"
    return "text-orange-900"
  }

  if (status === "loading") {
    return (
      <section className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={24} />
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, <span className="text-orange-500">{user?.name}!</span>
            </h1>
            <p className="text-gray-600 mt-1">Analyze your resume and get personalized feedback</p>
          </div>
          {user && (
            <Link href="/profile">
              <div className="size-12 rounded-full relative overflow-hidden ring-2 ring-orange-200 hover:ring-orange-300 transition-all">
                <Image src={user.image ?? ""} alt={user.name ?? ""} fill sizes="48px" className="object-cover" />
              </div>
            </Link>
          )}
        </div>

        <Separator />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Job Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Job Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Target Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedJob} onValueChange={handleJobChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Positions</SelectLabel>
                      {jobs.map((job) => (
                        <SelectItem key={job.title} value={job.title}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{jobDescription}</p>
              </CardContent>
            </Card>

            {/* Resume Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Resume Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fileName ? (
                  <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-800">{fileName}</p>
                      <p className="text-sm text-orange-600">Ready for analysis</p>
                    </div>
                  </div>
                ) : (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-800">No Resume Uploaded</AlertTitle>
                    <AlertDescription className="text-orange-700">
                      Please upload your resume to get started with the analysis.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="relative mt-4">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={loading}
                  />
                  <div className="flex items-center justify-center gap-4 flex-col p-8 bg-orange-50 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-100 transition-colors">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    ) : (
                      <UploadCloud className="h-8 w-8 text-orange-500" />
                    )}
                    <div className="text-center">
                      <p className="font-medium text-gray-700">{loading ? "Analyzing..." : "Upload Your Resume"}</p>
                      <p className="text-sm text-gray-500 mt-1">PDF, DOC, or DOCX files only</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2">
            {analysisResult ? (
              <div className="space-y-6">
                {/* Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Overall Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(analysisResult.score)}`}>
                            {analysisResult.score}/100
                          </p>
                        </div>
                      </div>
                      <Progress value={analysisResult.score} className="mt-3" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Target className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Match Level</p>
                          <Badge
                            variant="secondary"
                            className={`${getMatchLevelColor(analysisResult.matchLevel)} text-white mt-1`}
                          >
                            {analysisResult.matchLevel}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Award className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Strengths</p>
                          <p className="text-2xl font-bold text-orange-600">{analysisResult.strengths.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Analysis Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-orange-500" />
                      AI Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
                  </CardContent>
                </Card>

                {/* Strengths & Missing Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <CheckCircle2 className="h-5 w-5" />
                        Your Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysisResult.strengths.map((strength, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                          >
                            <CheckCircle2 className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-orange-800">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Missing Skills */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-800">
                        <AlertCircle className="h-5 w-5" />
                        Skills to Develop
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResult.missingSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="mr-2 mb-2 border-orange-300 text-orange-800 bg-orange-50"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                        <p className="text-sm text-orange-900">
                          <strong>Tip:</strong> Focus on developing these skills to improve your match score for this
                          position.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="bg-orange-500 hover:bg-orange-600 cursor-pointer">
                    Schedule Mock Interview
                  </Button>
                  <Button variant="outline">Get Improvement Tips</Button>
                </div>
              </div>
            ) : (
              <Card className="h-96">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Analysis</h3>
                    <p className="text-gray-600">
                      Upload your resume and select a target position to get started with AI-powered analysis.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
