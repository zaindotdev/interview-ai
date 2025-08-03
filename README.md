# 🚀 Interview AI – Ace Your Next Interview with Confidence

## 📌 Overview

**Interview AI** is an intelligent platform designed to help candidates prepare for job interviews using AI. While this idea isn’t completely unique and was inspired by a project featured in [Hitesh Choudhary](https://x.com/hiteshdotcom)’s cohort, this version is built entirely by me from scratch as a learning experience and personal challenge.

---

## 🛠 Tech Stack

* **Frontend:** Next.js
* **Backend:** Prisma ORM, PostgreSQL
* **Storage:** Supabase Storage
* **AI Engine:** Gemini 2.5 Flash (Google Generative AI)

---

## ✨ Features

* 📄 Resume Upload & AI-Powered Analysis
* 🧠 Role-Specific Interview Questions
* 🎤 AI Mock Interviews (via WebRTC)
* 📝 Detailed Feedback & Analysis Reports
* 📹 Interview Video Recording & Playback
* 📈 Candidate Progress Tracking
* 📧 Email Support

---

## 🗺 Roadmap (Upcoming Features)

* 📌 ATS & LMS Integrations
* 🔐 Role-Based Access Control
* 📡 Public API Access
* ⏱ 24/7 Priority Support

---

## 🧪 Getting Started

### 🔁 Clone the Repository

```bash
git clone https://github.com/zaindotdev/interview-ai.git
cd interview-ai
```

### ⚙️ Environment Variables

Create a `.env` file and configure the following variables:

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/interview_ai"

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_URL = 
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = 

GITHUB_CLIENT_SECRET = 
GITHUB_CLIENT_ID =

GOOGLE_CLIENT_SECRET = 
GOOGLE_CLIENT_ID =

NEXTAUTH_SECRET = 
NEXTAUTH_URL = "http://localhost:3000"
RESEND_API_KEY = 

GEMINI_API_KEY = 


VAPI_AI_PRIVATE_API_KEY = 
NEXT_PUBLIC_VAPI_AI_API_KEY = 
NEXT_PUBLIC_VAPI_ASSISTANT_API_KEY = 
```

After setting up the environment variables:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

---

## 🚀 Deployment

Deploy to **[Vercel](https://vercel.com/)** – it's optimized for serverless Next.js applications and provides seamless GitHub integration.

---

Let me know if you'd like a badge section (e.g. Vercel, license, built-with) or contribution guidelines added too!
