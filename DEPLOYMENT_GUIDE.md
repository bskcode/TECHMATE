# AdaptiveLearn AI — Render Web Service Deployment Guide

## 1. Overview
AdaptiveLearn AI is engineered for production deployment on **Render** as a unified Next.js Web Service.

- **Service Type**: Web Service
- **Runtime**: Node.js 20+
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start`
- **Health Check Endpoint**: `/api/health`
- **Default Port**: `10000` (Render default)

---

## 2. Infrastructure as Code (`render.yaml`)
A `render.yaml` specification is provided in the repository root for one-click deployment.

```yaml
services:
  - type: web
    name: adaptivelearn-ai
    env: node
    plan: standard
    buildCommand: npm ci && npm run build
    startCommand: npm run start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: NEXT_PUBLIC_SUPABASE_URL
        sync: false
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: GROQ_API_KEY
        sync: false
      - key: GROQ_MODEL
        value: llama-3.3-70b-versatile
      - key: AI_PROVIDER
        value: groq
      - key: NEXT_PUBLIC_APP_URL
        sync: false
```

---

## 3. Environment Variables Configuration

| Variable Name | Description | Example / Default |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Cloud project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase private service role key | `eyJhbGci...` |
| `GROQ_API_KEY` | Groq API Key for Llama 3 inference | `gsk_...` |
| `GROQ_MODEL` | Primary Groq model ID | `llama-3.3-70b-versatile` |
| `AI_PROVIDER` | Primary AI provider | `groq` |
| `NEXT_PUBLIC_APP_URL` | Public production URL | `https://adaptivelearn-ai.onrender.com` |
| `PORT` | Listening server port | `10000` |

---

## 4. Supabase Setup Instructions
1. Create a new project on [Supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Run the migrations in sequential order:
   - `supabase/migrations/001_initial_schema.sql` (Creates 20 tables & indexes)
   - `supabase/migrations/002_rls_policies.sql` (Configures Row Level Security)
   - `supabase/migrations/003_seed_data.sql` (Preloads institutional demo dataset)
4. Create a private bucket in **Storage** named `course-materials`.
5. Copy your Project URL, Anon Key, and Service Role Key into Render's Environment Variables tab.

---

## 5. Render Free Instance Limitations & Scaling
- **Cold Starts**: Render free tier instances spin down after 15 minutes of inactivity. The first request after a sleep period may take 45–60 seconds to wake up.
- **Live Examinations Recommendation**: For live classroom exams, we recommend upgrading to a Render **Starter or Standard instance ($7/month)** to ensure always-on availability with zero cold starts during student testing.
- **Storage Persistence**: Render's local container filesystem is ephemeral. All permanent documents and data are stored in Supabase PostgreSQL and Supabase Storage.
