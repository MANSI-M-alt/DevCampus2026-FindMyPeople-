import { GoogleGenAI, Type } from '@google/genai';

type ApiResult = {
  statusCode: number;
  body: Record<string, unknown>;
};

const fallbackProfile = {
  name: 'Alex Student',
  department: 'Computer Science',
  year: 'Junior',
  skills: ['React Native', 'Python', 'Mobile Systems'],
  interests: ['Healthcare Tech', 'Accessibility'],
  goal: 'start a startup',
};

const fallbackSparkKit = {
  icebreaker: 'What inspired both of you to tackle this project together?',
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
  } catch (error) {
    console.error('Failed to parse Gemini JSON output:', error);
    return fallback;
  }
}

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  return apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      })
    : null;
}

function errorResult(endpoint: string, error: unknown): ApiResult {
  console.error(`Error in ${endpoint}:`, error);
  return {
    statusCode: 500,
    body: { error: 'The AI service could not complete this request. Check the backend Gemini configuration and try again.' },
  };
}

export async function extractProfile(body: Record<string, unknown>): Promise<ApiResult> {
  const { bioText } = body;
  if (typeof bioText !== 'string' || !bioText.trim()) {
    return { statusCode: 400, body: { error: 'Please provide a valid bio or resume text.' } };
  }

  const ai = createGeminiClient();
  if (!ai) return { statusCode: 503, body: { error: 'Gemini is not configured on the backend.' } };

  try {
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
    return {
      statusCode: 200,
      body: { profile: parseGeminiJson(response.text || '', fallbackProfile) },
    };
  } catch (error) {
    return errorResult('/api/profile/extract', error);
  }
}

export async function matchProfiles(body: Record<string, unknown>): Promise<ApiResult> {
  const project = body.project as Record<string, unknown> | undefined;
  const profiles = body.profiles;
  if (!project || !Array.isArray(profiles)) {
    return { statusCode: 400, body: { error: 'Missing project or profiles payload.' } };
  }

  const ai = createGeminiClient();
  if (!ai) return { statusCode: 503, body: { error: 'Gemini is not configured on the backend.' } };

  try {
    const projectSummary = {
      title: project.title,
      description: project.description,
      rolesNeeded: project.rolesNeeded,
      goal: project.goal,
      authorId: project.authorId,
    };
    const profilesSummary = profiles.map((profile: Record<string, unknown>) => ({
      id: profile.id,
      name: profile.name,
      department: profile.department,
      year: profile.year,
      skills: profile.skills,
      interests: profile.interests,
      goal: profile.goal,
      freeSlotsCount: Array.isArray(profile.freeSlots) ? profile.freeSlots.length : 0,
      freeSlots: profile.freeSlots,
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
    return { statusCode: 200, body: { matches: parseGeminiJson<unknown[]>(response.text || '', []) } };
  } catch (error) {
    return errorResult('/api/match', error);
  }
}

export async function generateSparkSession(body: Record<string, unknown>): Promise<ApiResult> {
  const project = body.project as Record<string, unknown> | undefined;
  const authorProfile = body.authorProfile as Record<string, unknown> | undefined;
  const candidateProfile = body.candidateProfile as Record<string, unknown> | undefined;
  if (!project || !authorProfile || !candidateProfile) {
    return { statusCode: 400, body: { error: 'Project, author profile, and candidate profile are required.' } };
  }

  const ai = createGeminiClient();
  if (!ai) return { statusCode: 503, body: { error: 'Gemini is not configured on the backend.' } };

  try {
    const prompt = `You are an expert team kickoff facilitator for college project collaborators on "Forge".
Two students have both expressed mutual interest in working together on a project.

Project: "${project.title}" - ${project.description}
Project Goal: ${project.goal}

Person A (Project Owner): ${authorProfile.name} (${authorProfile.department}, ${authorProfile.year})
Person A Skills: ${Array.isArray(authorProfile.skills) ? authorProfile.skills.join(', ') : ''}

Person B (Matched Collaborator): ${candidateProfile.name} (${candidateProfile.department}, ${candidateProfile.year})
Person B Skills: ${Array.isArray(candidateProfile.skills) ? candidateProfile.skills.join(', ') : ''}

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
    return {
      statusCode: 200,
      body: { sparkKit: parseGeminiJson(response.text || '', fallbackSparkKit) },
    };
  } catch (error) {
    return errorResult('/api/spark-session', error);
  }
}
