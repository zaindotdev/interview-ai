"use client"
import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import type { PracticeInterview } from "@/lib/types"
import { AlertTriangle, Clock, Play, Target, TrendingDown, BookOpen, ArrowRight } from "lucide-react"

interface MockInterviewsProps {
  weaknessess?: string[]
  practiceInterview: PracticeInterview[] | null
}

const MockInterviews: React.FC<MockInterviewsProps> = ({ weaknessess, practiceInterview }) => {
  const router = useRouter()

  const formatRemainingTime = (remainingSeconds: number) => {
    if (remainingSeconds <= 0) return "0 min"
    const mins = Math.floor(remainingSeconds / 60)
    return `${mins} min${mins !== 1 ? "s" : ""}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Improvement Areas */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-orange-100 p-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Areas to Improve</CardTitle>
              <CardDescription>Skills and topics that need attention</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {weaknessess && weaknessess.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {weaknessess.map((weakness, idx) => (
                  <div
                    key={`weakness-${idx}`}
                    className="flex items-start space-x-3 rounded-lg border border-orange-200 bg-orange-50 p-3"
                  >
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-orange-900">{weakness}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-[300px] items-center justify-center">
              <div className="text-center space-y-3">
                <div className="rounded-full bg-muted p-3 mx-auto w-fit">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">No data available</p>
                  <p className="text-sm text-muted-foreground">Upload your resume to see improvement areas</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Practice Interviews */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-blue-100 p-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Practice Interviews</CardTitle>
                <CardDescription>Tailored interview sessions based on your profile</CardDescription>
              </div>
            </div>
            {practiceInterview && practiceInterview.length > 0 && (
              <Badge variant="secondary">{practiceInterview.length} available</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {practiceInterview && practiceInterview.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {practiceInterview.map((interview, idx) => (
                  <div key={interview.topic + idx}>
                    <div className="group rounded-lg border bg-card p-4 transition-all hover:shadow-md">
                      <div className="flex items-start justify-between space-x-4">
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg leading-tight">{interview.topic}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{interview.description}</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {interview.focus.map((focus, focusIdx) => (
                              <Badge key={`focus-${focusIdx}`} variant="outline" className="text-xs">
                                {focus}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatRemainingTime(interview.estimated_time)}</span>
                            </div>
                            <Badge className={`text-xs ${getDifficultyColor(interview.difficulty)}`} variant="outline">
                              {interview.difficulty}
                            </Badge>
                          </div>
                        </div>

                        <Button
                          onClick={() => router.push(`/session/interview/?id=${interview.id}`)}
                          className="flex items-center space-x-2 group-hover:bg-primary group-hover:text-primary-foreground"
                        >
                          <Play className="h-4 w-4" />
                          <span>Start</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                    {idx < practiceInterview.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-[400px] items-center justify-center">
              <div className="text-center space-y-4">
                <div className="rounded-full bg-muted p-4 mx-auto w-fit">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">No practice interviews available</p>
                  <p className="text-sm text-muted-foreground">
                    Upload your resume to generate personalized interviews
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a href="#resume-analysis">Upload Resume</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MockInterviews
