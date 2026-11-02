import { createClient } from '@supabase/supabase-js';
import { extractProfile, generateSparkSession, matchProfiles } from '../../src/server/geminiApi';

export default async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 });
  }

  const authorization = request.headers.get('authorization');
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) {
    return Response.json({ error: 'Sign in to use AI features.' }, { status: 401 });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables for Netlify Functions.');
    return Response.json({ error: 'The backend is not configured correctly.' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !userData.user) {
    return Response.json({ error: 'Your session is invalid or expired. Sign in again.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const pathname = new URL(request.url).pathname;
  const result = pathname.endsWith('/profile/extract')
    ? await extractProfile(body)
    : pathname.endsWith('/match')
      ? await matchProfiles(body)
      : pathname.endsWith('/spark-session')
        ? await generateSparkSession(body)
        : { statusCode: 404, body: { error: 'Unknown API endpoint.' } };

  return Response.json(result.body, { status: result.statusCode });
};

export const config = {
  path: [
    '/api/profile/extract',
    '/api/match',
    '/api/spark-session',
  ],
};
