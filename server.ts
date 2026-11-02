import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Safely parse JSON from Gemini text response, removing any markdown code blocks or extra whitespace.
 */
function parseGeminiJson<T>(rawText: string, fallback: T): T {
  if (!rawText) return fallback;
  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', err, 'Raw text was:', rawText);
    return fallback;
  }
}

// 1. Extract Profile from Bio/Resume
app.post('/api/profile/extract', async (req, res) => {
  const fallbackProfile = {
    name: 'Alex Student',
    department: 'Computer Science',
    year: 'Junior',
    skills: ['React Native', 'Python', 'Mobile Systems'],
    interests: ['Healthcare Tech', 'Accessibility'],
    goal: 'start a startup',
  };

  try {
    const { bioText } = req.body;
    if (!bioText || typeof bioText !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid bio or resume text.' });
    }

    if (!apiKey) {
      return res.json({ profile: fallbackProfile });
    }

    const prompt = `You are an AI assistant for a college student collaborator matching platform called Forge.
Analyze the following student bio or resume text and extract structured profile details.

Text to analyze:
"${bioText}"

Extract into JSON format with the following exact schema:
- name: string (extracted full name or a plausible student name if omitted)
- department: string (e.g. Computer Science, Design & UX, Biotech & Clinical, Business & Strategy, Robotics, Law, Media, etc.)
- year: string (e.g. Freshman, Sophomore, Junior, Senior, Master's, PhD)
- skills: array of strings (list of specific technical or soft skills mentioned or implied)
- interests: array of strings (list of domains, topics, or project areas of interest)
- goal: one of exact string values: "win a hackathon", "learn something new", "build a portfolio", "start a startup", "research or publish"

Respond ONLY with valid JSON conforming to this schema. No markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            department: { type: Type.STRING },
            year: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            interests: { type: Type.ARRAY, items: { type: Type.STRING } },
            goal: { type: Type.STRING },
          },
          required: ['name', 'department', 'year', 'skills', 'interests', 'goal'],
        },
      },
    });

    const parsed = parseGeminiJson(response.text || '', fallbackProfile);
    return res.json({ profile: parsed });
  } catch (error: any) {
    console.error('Error in /api/profile/extract:', error);
    return res.json({ profile: fallbackProfile });
  }
});

// 2. Smart Matching Engine
app.post('/api/match', async (req, res) => {
  try {
    const { project, profiles } = req.body;
    if (!project || !profiles || !Array.isArray(profiles)) {
      return res.status(400).json({ error: 'Missing project or profiles payload.' });
    }

    if (!apiKey) {
      return res.json({ matches: [] });
    }

    const projectSummary = {
      title: project.title,
      description: project.description,
      rolesNeeded: project.rolesNeeded,
      goal: project.goal,
      authorId: project.authorId,
    };

    const profilesSummary = profiles.map((p: any) => ({
      id: p.id,
      name: p.name,
      department: p.department,
      year: p.year,
      skills: p.skills,
      interests: p.interests,
      goal: p.goal,
      freeSlotsCount: p.freeSlots ? p.freeSlots.length : 0,
      freeSlots: p.freeSlots,
    }));

    const prompt = `You are the matching algorithm for "Forge", an interdisciplinary collaborator discovery app for college students.
Your task is to select the TOP 3 candidate profiles that would be the best collaborators for the project.

CRITICAL MATCHING RULES:
1. PRIORITIZE COMPLEMENTARY SKILLS AND CROSS-DEPARTMENT MATCHES! Do NOT just pick candidates from the same department as the author unless strictly needed.
2. Filter OUT the project author (id: "${project.authorId}") from candidates.
3. Assess goal alignment ("strong", "partial", or "weak") based on project goal vs student goal.
4. Identify ONE honest risk factor for each match.
5. Return exactly the TOP 3 matches sorted from highest match score to lowest.

Project Details:
${JSON.stringify(projectSummary, null, 2)}

Candidate Pool:
${JSON.stringify(profilesSummary, null, 2)}

Respond with a JSON array conforming to the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              profileId: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              reason: { type: Type.STRING },
              complementarySkill: { type: Type.STRING },
              goalAlignment: { type: Type.STRING },
              goalAlignmentNote: { type: Type.STRING },
              risk: { type: Type.STRING },
            },
            required: [
              'profileId',
              'matchScore',
              'reason',
              'complementarySkill',
              'goalAlignment',
              'goalAlignmentNote',
              'risk',
            ],
          },
        },
      },
    });

    const matches = parseGeminiJson<any[]>(response.text || '', []);
    return res.json({ matches });
  } catch (error: any) {
    console.error('Error in /api/match:', error);
    return res.json({ matches: [] });
  }
});

// 3. Generate Spark Session Kit
app.post('/api/spark-session', async (req, res) => {
  const fallbackSparkKit = {
    icebreaker: `What inspired both of you to tackle this project together?`,
    fitQuestions: [
      'How do you manage deadline pressures and async vs synchronous communication?',
      'What is your realistic weekly hour commitment and peak focus windows?',
      'What key milestone defines success for your personal campus goals?',
    ],
    agenda: [
      { time: '0-3 min', topic: 'Icebreaker & Project Vision Alignment' },
      { time: '3-10 min', topic: 'Skill Complementarity & Role Boundaries' },
      { time: '10-17 min', topic: 'Availability, Work Rhythms & Tooling' },
      { time: '17-20 min', topic: 'Decision & Next Steps Setup' },
    ],
  };

  try {
    const { project, authorProfile, candidateProfile } = req.body;
    if (!project || !authorProfile || !candidateProfile) {
      return res.json({ sparkKit: fallbackSparkKit });
    }

    if (!apiKey) {
      return res.json({ sparkKit: fallbackSparkKit });
    }

    const prompt = `You are an expert team kickoff facilitator for college project collaborators on "Forge".
Two students have both expressed mutual interest in working together on a project.

Project: "${project.title}" - ${project.description}
Project Goal: ${project.goal}

Person A (Project Owner): ${authorProfile.name} (${authorProfile.department}, ${authorProfile.year})
Person A Skills: ${authorProfile.skills?.join(', ')}

Person B (Matched Collaborator): ${candidateProfile.name} (${candidateProfile.department}, ${candidateProfile.year})
Person B Skills: ${candidateProfile.skills?.join(', ')}

Generate a concise, high-value 20-minute "Spark Session" kickoff kit so they can evaluate compatibility.

Return ONLY JSON with icebreaker, fitQuestions, agenda.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            icebreaker: { type: Type.STRING },
            fitQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            agenda: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  topic: { type: Type.STRING },
                },
                required: ['time', 'topic'],
              },
            },
          },
          required: ['icebreaker', 'fitQuestions', 'agenda'],
        },
      },
    });

    const sparkKit = parseGeminiJson(response.text || '', fallbackSparkKit);
    return res.json({ sparkKit });
  } catch (error: any) {
    console.error('Error in /api/spark-session:', error);
    return res.json({ sparkKit: fallbackSparkKit });
  }
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite Integration for dev server or static distribution
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const rawIndexHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const template = await vite.transformIndexHtml(url, rawIndexHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
