export interface HowItWorks{
    index: string;
    title:string;
    description:string;
}

export interface KeyFeaturesData{
    index:string;
    title:string;
    description:string;
}


export interface PricingPlans {
    title: string
    description: string
    price: string
    originalPrice?: string
    features: string[]
    buttonText: string
    buttonLink: string
    tier?: "basic" | "pro" | "enterprise"
    popular?: boolean
    badge?: string
}

export interface ResumeScore {
  "score": number,
  "matchLevel": "High" | "Medium" | "Low",
  "missingSkills": string[],
  "strengths": string[],
  "summary": string,
  "technicalSkillsMatch": {
    "programmingLanguages": string[],
    "frameworks": string[],
    "tools": string[],
    "databases": string[],
    "cloudPlatforms": string[],
    "matchPercentage": number
  },
  "experienceAnalysis": {
    "relevantYears": number,
    "industryMatch": boolean,
    "seniorityLevel": "Junior" | "Mid" | "Senior" | "Lead" | "Principal",
    "projectComplexity": "Low" | "Medium" | "High"
  },
  "educationAndCertifications": {
    "degreeRelevance": "High" | "Medium" | "Low" | "None",
    "certifications": string[],
    "continuousLearning": boolean
  },
  "softSkillsIndicators": {
    "leadership": boolean,
    "teamwork": boolean,
    "problemSolving": boolean,
    "communication": boolean
  },
  "recommendations": {
    "interviewFocus": string[],
    "trainingNeeds": string[],
    "potentialConcerns": string[]
  }
}

export type ChartData = {
        session: string;
        Technical: number
        Behavioral: number
        Communication: number
    }
