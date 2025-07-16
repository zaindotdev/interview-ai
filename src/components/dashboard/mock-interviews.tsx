import React, { useState } from "react";
import { Card } from "../ui/card";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface MockInterviewsProps {
    weaknessess?: string[];
}

interface PracticeInterview {
    topic: string;
    description: string;
    focus: string[];
    estimated_time: string;
    difficulty: "easy" | "medium" | "hard";
}

const MockInterviews: React.FC<MockInterviewsProps> = ({ weaknessess }) => {
    const [practiceInterview, setPracticeInterview] = useState<PracticeInterview>(
        {
            topic: "JS Mastery",
            description:
                "This interview will test your knowledge of advanced JavaScript concepts, including closures, async/await, and ES6 features.",
            focus: ["closures", "async/await", "ES6 features"],
            estimated_time: "15min",
            difficulty: "easy",
        }
    );
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
                <ul className="border-t border-gray-200">
                    {weaknessess?.map((weakness, idx) => (
                        <li
                            key={`weakness-${idx}`}
                            className="flex items-center gap-2 mt-2"
                        >
                            <X size={24} className="text-red-500" />
                            <p className="text-gray-500 text-sm md:text-base">{weakness}</p>
                        </li>
                    ))}
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
                <div>
                    <div className="w-full p-4 rounded-xl shadow-md block md:flex items-center justify-between">
                        <div>
                            <div className="max-w-xl">
                                <h1 className="text-base md:text-lg font-semibold text-primary">
                                    {practiceInterview.topic}
                                </h1>
                                <p className="text-gray-500 text-sm md:text-base">{practiceInterview.description}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                {practiceInterview.focus.map((focus, idx) => (
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
                                {practiceInterview.difficulty}
                            </Badge>
                            <p className="text-gray-500 text-sm md:text-base font-sm">
                                {practiceInterview.estimated_time.toLocaleString()}
                            </p>
                            <Button className="mt-4 cursor-pointer">
                                Start Interview
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </section>
    );
};

export default MockInterviews;
