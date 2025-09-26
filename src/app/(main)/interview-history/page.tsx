"use client"
import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, Target, BarChart3, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface MockInterview {
  topic: string
  description: string
  difficulty: string
  estimated_time: number
}

interface InterviewHistoryItem {
  id: string
  mockInterviewId: string
  candidateId: string
  status: string
  duration: number
  transcripts: string | null
  feedbackReportId: string | null
  createdAt: string
  mockInterview: MockInterview
  mockInterviewReport: any | null
}

const InterviewHistory = () => {
  const [historyData, setHistoryData] = useState<InterviewHistoryItem[]>([])
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await axios.get("/api/mock-interview/history")

      if (data.success === "success") {
        setHistoryData(data.data)
      }
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        toast.error("Something went wrong", {
          description: error?.message,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "secondary"
      case "medium":
        return "default"
      case "hard":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Interview History</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              View all your past mock interviews and review your progress.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-balance">Interview History</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl text-pretty">
            View all your past mock interviews and review your progress. Track your improvement over time and identify
            areas for growth.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          {historyData.length} interview{historyData.length !== 1 ? "s" : ""}
        </div>
      </div>

      {historyData.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No interviews yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Start your first mock interview to begin tracking your progress and improving your skills.
              </p>
            </div>
            <Button onClick={() => router.push("/mock-interviews")}>Start Your First Interview</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {historyData.map((interview) => (
            <Card key={interview.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-tight text-balance group-hover:text-primary transition-colors">
                    {interview.mockInterview.topic}
                  </h3>
                  <Badge variant={getStatusVariant(interview.status)} className="text-xs shrink-0">
                    {interview.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground text-pretty line-clamp-2">
                  {interview.mockInterview.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Target className="h-3 w-3" />
                    <Badge variant={getDifficultyVariant(interview.mockInterview.difficulty)} className="text-xs">
                      {interview.mockInterview.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(interview.duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(interview.createdAt)}</span>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group/btn bg-transparent"
                    disabled={!interview.mockInterviewReport}
                  >
                    {interview.mockInterviewReport ? "View Report" : "Report Pending"}
                    {interview.mockInterviewReport && (
                      <ExternalLink className="h-3 w-3 ml-1.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

export default InterviewHistory
