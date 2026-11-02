# FindMyPeople

FindMyPeople is a TypeScript web app for discovering student and PhD collaborators based on complementary skills, project goals, and availability. It helps project owners post needs, find strong matches, and start focused collaboration sessions with AI-assisted prompts.

## Overview

This project is designed for interdisciplinary collaboration discovery in a student environment. It combines a React frontend with an Express server and Gemini-powered matching logic to:

- showcase student profiles and research interests
- let users post or manage project needs
- discover top collaborators using AI matching
- assess mutual interest and compatibility
- generate a lightweight Spark Session kickoff agenda

## Features

- Project posting and role matching
- AI-driven collaborator recommendations
- Cross-department and complementary skill prioritization
- Student / PhD profile management
- Mutual interest tracking
- Spark Session generation for rapid collaboration kickoff
- Responsive dashboard UI

## Tech Stack

- React + TypeScript + Vite
- Express + TypeScript
- Supabase Auth + PostgreSQL (with row-level security)
- Tailwind CSS
- Google Gemini API via `@google/genai`
- Node.js

## Project Structure

```text
.
├── .aistudio/
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── public/
├── server.ts
├── src/
├── supabase/
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase and environment

Create a Supabase project, then run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. It creates the profile, project, and match tables, signup profile trigger, and row-level security policies.

Copy the example environment file and set the project URL and publishable key from **Project Settings → API**:

```bash
Copy-Item .env.example .env
```

Set these values in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

The app uses Supabase email/password authentication. Configure email confirmation and the allowed redirect URLs in **Authentication → URL Configuration** in Supabase. The client-side publishable key is expected to be visible in the browser; never put a `service_role` or secret key in `VITE_*` variables.

If you previously placed a real API key in `.env.example`, rotate that key and keep its replacement only in the ignored local `.env` file.

### Deploy to Netlify

The repository includes [`netlify.toml`](./netlify.toml), which configures `npm run build`, publishes `dist`, enables the SPA fallback, and excludes the public Supabase config and non-secret `PORT` setting from Netlify's secret-value scan. In Netlify, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Site configuration → Environment variables**, then trigger a new deploy. These values must be present at build time. Do not set `PORT` in Netlify; this is a static frontend deployment and does not use the Express server port. If Supabase variables are missing, the deployed page displays a configuration message instead of a blank screen.

The Express Gemini endpoints in `server.ts` are not deployed by this static-site configuration. Host the Express server separately and configure a Netlify proxy or migrate those endpoints to Netlify Functions if the AI features are needed on the deployed site.

### 3. Run the app in development mode

```bash
npm run dev
```

The app will run on:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev      # Start Vite + Express development server
npm run build    # Build the frontend bundle
npm run start    # Start the production server
npm run preview  # Preview the production build
npm run lint     # Type-check the project
npm run clean    # Remove dist output
```

## API Endpoints

The Express server exposes AI-assisted endpoints for the app:

- `POST /api/profile/extract` — extract a structured student profile from resume or bio text
- `POST /api/match` — generate top collaborator matches for a project
- `POST /api/spark-session` — generate a kickoff session plan between two collaborators

## Notes

- Profiles, projects, and collaborator-match interest are stored in Supabase.
- Profile email addresses are kept in Supabase Auth and only exposed to participants after both sides express interest.
- `GEMINI_API_KEY` is optional for local startup; AI endpoints use their default responses when it is absent.

## License

This project is provided as-is for hackathon/demo purposes.
