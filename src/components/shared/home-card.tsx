import React from 'react';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import Image from 'next/image'
interface HomeCardProps {
  title:string;
  description:string;
  action?:string;
  image:string;
}
export const HomeCard:React.FC<HomeCardProps> = ({action,image,description,title}) => {
  return <Card className={"max-w-[500px] min-h-[350px] w-full"}>
    <CardHeader>
     <div className={"flex items-center gap-2 w-full"}>
       <div className="relative w-[100px] h-[100px]">
         <Image src={image} alt={title} fill className="object-contain" />
       </div>
       <CardTitle>
         <h1 className={"text-lg md:text-xl lg:text-2xl font-semibold text-center"}>{title}</h1>
       </CardTitle>
     </div>
    </CardHeader>
    <CardContent>
      <div className={"relative"}>
        <Image src={image} alt={title} fill/>
      </div>
      <CardDescription>
        <p className={"text-base md:text-lg lg:text-xl text-center"}>{description}</p>
      </CardDescription>
    </CardContent>
    <CardFooter>
    </CardFooter>
  </Card>;
};