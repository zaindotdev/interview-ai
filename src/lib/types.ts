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



export interface PracticeInterview {
  id:string;
  topic: string;
  description: string;
  focus: string[];
  estimated_time: number;
  difficulty: "easy" | "medium" | "hard";
  candidateId: string;
}

// server-side
export interface GenerateSystemPrompt{
  topic: string;
  description: string;
  focus: string[];
  estimated_time: string;
  difficulty: string;
}

export type CallStatus = "queued" | "in-progress" | "ended";
export type CallType = "outboundPhoneCall" | "vapi.websocketCall";
export type EndedReason =
  | "hangup"
  | "assistant-error"
  | "user-error"
  | "network-error"
  | "timeout"
  | "unknown";

export interface CallObject {
  // Basic Information
  id: string;
  assistantId: string;
  type: CallType;
  createdAt: string; // or Date if you're using actual Date objects
  updatedAt: string;
  orgId: string;
  cost?: number;
  status: CallStatus;

  // Call Details
  customer: {
    phoneNumber: string;
    [key: string]: any; // if there might be more fields
  };
  phoneCallProvider: string; // e.g., "twilio"
  phoneCallProviderId: string;
  phoneCallTransport: string; // e.g., "pstn"

  // Monitoring Information
  monitor: {
    listenUrl: string;
    controlUrl: string;
  };

  // Optional fields (when call ends)
  endedReason?: EndedReason;
  recordingUrl?: string;
  summary?: string;
  transcript?: string;
  messages?: Array<{
    role: "assistant" | "user";
    content: string;
    timestamp?: string;
  }>;
}
