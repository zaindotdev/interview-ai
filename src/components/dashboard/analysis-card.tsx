import React, { useState } from 'react'
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Legend, Tooltip, Radar, RadarChart, RadarProps, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { UploadCloud, Badge, CheckCircle } from 'lucide-react';

type ResumeScore = {
    score: number;
    matchLevel: string;
    strengths: string[];
};

const chartData = [
  {
    session: "Session 1",
    Technical: 65,
    Behavioral: 70,
    Communication: 100,
  },
  {
    session: "Session 2",
    Technical: 72,
    Behavioral: 75,
    Communication: 68,
  },
  {
    session: "Session 3",
    Technical: 78,
    Behavioral: 80,
    Communication: 0,
  },
  {
    session: "Session 4",
    Technical: 83,
    Behavioral: 10,
    Communication: 81,
  },
  {
    session: "Session 5",
    Technical: 88,
    Behavioral: 90,
    Communication: 85,
  },
];
const AnalysisCard = () => {
    const [resumeScore, setResumeScore] = useState<ResumeScore | null>({
        matchLevel: "High",
        score: 99.99,
        strengths: ["Strength 1", "Strength 2", "Strength 3", "Strength 4"],
    });
    return (
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 relative">
            <Card className="w-full p-4 shadow-md rounded-2xl bg-white">
                <div className="card-title">
                    <h2 className="text-lg md:text-xl font-semibold text-primary">
                        Resume Analysis
                    </h2>
                    <p className="text-gray-500">
                        An overview of your resume's performance and highlights key
                        strengths.
                    </p>
                </div>
                {!resumeScore ? (
                    <div className="min-h-[250px] flex flex-col items-center justify-center p-4">
                        <p className="text-gray-500 mb-2">No Resume Uploaded</p>
                        <div className="border-2 border-dashed border-primary  w-full h-[200px] rounded-xl relative">
                            <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-col">
                                <UploadCloud size={54} className="text-primary" />
                                <p className="text-xl font-medium text-gray-500">
                                    Upload Resume
                                </p>
                            </div>
                            <Input
                                accept="application/pdf"
                                type="file"
                                className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 opacity-0"
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="card-content">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge size={24} className="text-primary mb-2" />
                                        <p className="text-gray-500">{resumeScore?.score}%</p>
                                    </div>
                                    <p>{resumeScore?.matchLevel}</p>
                                </div>
                                <Progress value={resumeScore?.score} />
                            </div>
                            <div className="strengths">
                                <p className="text-gray-500">Strengths:</p>
                                <ul className="grid grid-cols-2 gap-2">
                                    {resumeScore?.strengths.map((strength, index) => (
                                        <li className="flex items-center gap-2" key={index}>
                                            <CheckCircle size={20} className="text-primary" />
                                            {strength}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
            <Card className="w-full p-4 shadow-md rounded-2xl bg-white">
                <div className="card-title">
                    <h2 className="text-lg md:text-xl font-semibold text-primary">
                        Interview Analysis
                    </h2>
                    <p className="text-gray-500">
                        An overview of your interview's performance and highlights key
                        strengths.
                    </p>
                </div>
                <div className="min-h-[250px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="session" />
                            <PolarRadiusAxis />
                            <Radar name="Behavioral" dataKey="Behavioral" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.6} />
                            <Radar name='Technical' dataKey='Technical' stroke='var(--chart-2)' fill='var(--chart-2)' fillOpacity={0.6}/>
                            <Radar name='Communication' dataKey="Communication" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.6} />
                            <Tooltip/>
                        </RadarChart>
                    </ResponsiveContainer>

                </div>
            </Card>
        </section>
    )
}

export default AnalysisCard