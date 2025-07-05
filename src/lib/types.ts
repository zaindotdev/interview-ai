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