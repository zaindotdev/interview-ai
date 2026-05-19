import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ResumeAnalysisClient from "./resume-analysis-client";

export default async function ResumeAnalysisPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) redirect("/sign-in");

  // Fetch all resumes newest-first
  const resumes = await db.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileUrl: true,
      parsedJson: true,
      createdAt: true,
    },
  });

  const serialized = resumes.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return <ResumeAnalysisClient resumes={serialized} />;
}