"use client"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Clock, Award } from 'lucide-react'
import { ResumeScore, MockInterviews } from "@/lib/types"

interface StatsOverviewProps {
  resumeScore: ResumeScore | null
  practiceInterview: MockInterviews[] | null
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ resumeScore, practiceInterview }) => {
  const stats = [
    {
      title: "Resume Score",
      value: resumeScore?.score ? `${resumeScore.score}%` : "N/A",
      description: resumeScore?.matchLevel || "Upload resume",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Practice Sessions",
      value: practiceInterview?.length || 0,
      description: "Available interviews",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Avg. Duration",
      value: practiceInterview?.length 
        ? `${Math.round(practiceInterview.reduce((acc, curr) => acc + curr.estimated_time, 0) / practiceInterview.length / 60)}m`
        : "0m",
      description: "Per interview",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Strengths",
      value: resumeScore?.strengths?.length || 0,
      description: "Identified skills",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-full p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StatsOverview
