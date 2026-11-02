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
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example environment file and add your Gemini API key:

```bash
cp .env.example .env
```

Then update `.env`:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

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

- If `GEMINI_API_KEY` is not configured, the app falls back to demo/default data rather than failing outright.
- The app is optimized for hackathon/demo usage and includes seeded profile and project data.

## License

This project is provided as-is for hackathon/demo purposes.
