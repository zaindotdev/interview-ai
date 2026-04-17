export type BlogSection = {
  heading: string;
  body: string[];
};

export type SeedBlog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: string;
  featured: boolean;
  sections: BlogSection[];
};

export const seededBlogs: SeedBlog[] = [
  {
    id: "blog_1",
    slug: "how-to-prepare-for-behavioral-interviews",
    title: "How to Prepare for Behavioral Interviews (Without Sounding Scripted)",
    excerpt:
      "A practical framework to answer behavioral questions with structure, confidence, and authentic examples.",
    category: "Interview Strategy",
    tags: ["Behavioral", "STAR", "Communication"],
    author: "Interview AI Team",
    publishedAt: "2026-04-03",
    readTime: "7 min read",
    featured: true,
    sections: [
      {
        heading: "Why Behavioral Questions Matter",
        body: [
          "Behavioral interviews help companies evaluate how you think, collaborate, and respond under pressure.",
          "The interviewer is not only listening for what happened, but also for how clearly you communicate your decision-making.",
        ],
      },
      {
        heading: "Use a Flexible STAR Structure",
        body: [
          "STAR (Situation, Task, Action, Result) is a useful structure, but avoid sounding robotic by focusing on your real thought process.",
          "Keep each story concise and conclude with impact plus a short reflection on what you learned.",
        ],
      },
      {
        heading: "Practice Out Loud",
        body: [
          "Good answers rarely emerge by writing alone. Practice speaking your examples naturally and trim unnecessary details.",
          "Use mock sessions to improve pacing, clarity, and confidence before interview day.",
        ],
      },
    ],
  },
  {
    id: "blog_2",
    slug: "resume-mistakes-that-hurt-interview-chances",
    title: "5 Resume Mistakes That Quietly Hurt Your Interview Chances",
    excerpt:
      "Small resume issues can reduce your interview conversion rate. Learn what to fix first.",
    category: "Resume",
    tags: ["Resume", "Job Search", "ATS"],
    author: "Interview AI Team",
    publishedAt: "2026-03-28",
    readTime: "6 min read",
    featured: false,
    sections: [
      {
        heading: "Generic Summaries",
        body: [
          "Generic summaries fail to differentiate you. Replace broad statements with role-relevant strengths and outcomes.",
        ],
      },
      {
        heading: "Weak Impact Statements",
        body: [
          "Many bullet points describe responsibilities but not results. Add measurable outcomes where possible.",
          "Even approximate improvements can communicate impact better than vague claims.",
        ],
      },
      {
        heading: "Mismatch With Target Role",
        body: [
          "Tailor language and highlighted projects to the role you are applying for.",
          "Alignment between resume and job description increases the likelihood of interview callbacks.",
        ],
      },
    ],
  },
  {
    id: "blog_3",
    slug: "technical-interview-practice-plan-2-weeks",
    title: "A 2-Week Technical Interview Practice Plan",
    excerpt:
      "A realistic daily plan for candidates balancing interview prep with full-time work.",
    category: "Technical Interviews",
    tags: ["Prep Plan", "Coding", "System Design"],
    author: "Interview AI Team",
    publishedAt: "2026-03-19",
    readTime: "8 min read",
    featured: false,
    sections: [
      {
        heading: "Week 1: Fundamentals and Pattern Recognition",
        body: [
          "Focus on high-frequency coding patterns and communication basics during problem solving.",
          "Track where you lose time and identify recurring mistakes early.",
        ],
      },
      {
        heading: "Week 2: Simulation and Feedback",
        body: [
          "Shift to realistic mock interviews with strict time limits.",
          "Review each session for clarity, trade-off discussion, and final solution quality.",
        ],
      },
      {
        heading: "Consistency Beats Intensity",
        body: [
          "A sustainable daily routine generally outperforms occasional long sessions.",
          "Protect your schedule and treat interview prep like a professional commitment.",
        ],
      },
    ],
  },
  {
    id: "blog_4",
    slug: "post-interview-follow-up-template-that-works",
    title: "Post-Interview Follow-Up: A Template That Actually Works",
    excerpt:
      "A concise post-interview message can reinforce your candidacy without sounding pushy.",
    category: "Career Growth",
    tags: ["Follow-up", "Email", "Interview"],
    author: "Interview AI Team",
    publishedAt: "2026-03-10",
    readTime: "5 min read",
    featured: false,
    sections: [
      {
        heading: "Send Within 24 Hours",
        body: [
          "A timely follow-up shows professionalism and keeps your conversation fresh in the interviewer’s mind.",
        ],
      },
      {
        heading: "Reference Specific Discussion Points",
        body: [
          "Mention one or two concrete topics from the interview to make your note personal and credible.",
        ],
      },
      {
        heading: "Keep It Brief and Clear",
        body: [
          "Thank them for their time, restate your interest, and close with a polite line about next steps.",
        ],
      },
    ],
  },
];

export const getBlogBySlug = (slug: string): SeedBlog | undefined =>
  seededBlogs.find((blog) => blog.slug === slug);
