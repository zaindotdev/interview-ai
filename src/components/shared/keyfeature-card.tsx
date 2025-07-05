import React from 'react';
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import {ArrowRight} from "lucide-react";
import {cn} from "@/lib/utils";

interface KeyFeatureCardProps {
    id:string;
    title:string;
    description:string;
    image:string;
}

export const KeyFeatureCard:React.FC<KeyFeatureCardProps> = ({id,title,description,image}) => {
   return <Card className={cn("max-w-[500px] min-h-[350px] w-full p-0 overflow-hidden")}>
        <CardHeader className={"relative w-full aspect-[2/1] "}>
            <Image objectFit={"cover"} src={image} alt={"Upload Resume"} fill />
        </CardHeader>
        <CardContent>
            <CardTitle className={"flex items-center justify-center gap-2"}>
                <div className={"flex items-center justify-center gap-2 rounded-full bg-orange-500 text-white md:size-16 size-12 shrink-0"}>
                    <h1 className={"text-lg md:text-xl lg:text-2xl font-semibold"}>
                        {id}.
                    </h1>
                </div>
                <h1 className={"text-xl md:text-2xl lg:text-4xl font-bold"}>
                    {title}
                </h1>
            </CardTitle>
            <CardDescription className={"mt-8"}>
                <p className={"text-base md:text-lg lg:text-xl"}>{description}</p>
            </CardDescription>
        </CardContent>
        <CardFooter>
            <CardAction>
                <Link className={"flex items-center justify-center hover:gap-2 duration-200 ease transition-all hover:ring-2 hover:ring-orange-500 rounded-xl p-2"} href={"/"}>
                    <p className={"text-lg md:text-xl text-orange-500 transition-all duration-200 ease hover:-mr-2"}>Learn More</p><ArrowRight color={"#ff6900"} />
                </Link>
            </CardAction>
        </CardFooter>
    </Card>
}