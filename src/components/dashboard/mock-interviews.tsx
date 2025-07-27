import React from "react";
import { Card } from "../ui/card";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { PracticeInterview } from "@/lib/types";
import { ScrollArea } from "../ui/scroll-area";
interface MockInterviewsProps {
    weaknessess?: string[];
    practiceInterview: PracticeInterview[] | null
}


const MockInterviews: React.FC<MockInterviewsProps> = ({ weaknessess, practiceInterview }) => {
    const router = useRouter();

     const formatRemainingTime = (remainingSeconds: number) => {
        if (remainingSeconds <= 0) return "00:00";
        const mins = Math.floor(remainingSeconds / 60);
        
        return `${mins.toString().padStart(2, '0')} mins`;
    };
    return (
        <section className="p-4 md:grid grid-cols-3 gap-4">
            <Card className="p-4 bg-white shadow-md">
                <div className="card-header">
                    <h2 className="text-lg md:text-xl font-semibold text-primary">
                        Improvement
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base">
                        You can improve your resume by adding more relevant experience,
                        skills, and achievements to highlight your strengths and demonstrate
                        your expertise in the field.
                    </p>
                </div>
                <ul className="border-t border-gray-200 h-full">
                    {weaknessess ? weaknessess?.map((weakness, idx) => (
                        <li
                            key={`weakness-${idx}`}
                            className="flex items-center gap-2 mt-2"
                        >
                            <X size={24} className="text-red-500" />
                            <p className="text-gray-500 text-sm md:text-base">{weakness}</p>
                        </li>
                    )) : <li className="flex items-center justify-center h-full w-full">
                        <p className="text-gray-500 text-sm">Upload your resume</p>
                    </li>}
                </ul>
            </Card>
            <Card id="interview" className="col-span-2 p-4 bg-white shadow-md mt-4 scroll-smooth">
                <div className="card-header">
                    <h2 className="text-lg md:text-xl font-semibold text-primary">
                        Practice Interview
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base max-w-2xl">
                        Prepare for your interview by practicing common questions, refining
                        your answers, and focusing on clear communication to showcase your
                        skills and experience effectively.
                    </p>
                </div>
                <ScrollArea className="max-h-[400px]">
                    {practiceInterview && practiceInterview.length > 0 ? practiceInterview.map((interview, idx) => (
                        <div key={interview.topic + idx} className="w-full mt-4 p-4 rounded-xl shadow-md block md:flex items-center justify-between">
                            <div className="max-w-xl">
                                <div className="max-w-xl">
                                    <h1 className="text-base md:text-lg font-semibold text-primary">
                                        {interview.topic}
                                    </h1>
                                    <p className="text-gray-500 text-sm md:text-base">{interview.description}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-4 flex-wrap">
                                    {interview.focus.map((focus, idx) => (
                                        <Badge
                                            key={`focus-${idx}`}
                                            variant={"outline"}
                                            className="capitalize"
                                        >
                                            {focus}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="md:flex items-center gap-2 flex-col mt-4">
                                <Badge className="capitalize">
                                    {interview.difficulty}
                                </Badge>
                                <p className="text-gray-500 text-sm md:text-base font-sm">
                                    {formatRemainingTime(interview.estimated_time)}
                                </p>
                                <Button onClick={() => router.push(`/session/interview/?id=${interview.id}`)} className="mt-4 cursor-pointer">
                                    Start Interview
                                </Button>
                            </div>
                        </div>
                    )) : <div>
                        <p className="text-gray-500 text-sm md:text-base text-center">No practice interviews available</p>
                        <p className="text-muted-foreground text-xs md:text-sm text-center">Upload your Resume</p>
                    </div>}
                </ScrollArea>
            </Card>
        </section>
    );
};

export default MockInterviews;
