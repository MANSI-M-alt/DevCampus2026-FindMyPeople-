import type { SupabaseClient } from '@supabase/supabase-js';

export async function fetchAuthenticatedApi(
  supabase: SupabaseClient,
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error('Your session expired. Sign in again to use AI features.');

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${data.session.access_token}`);
  return fetch(input, { ...init, headers });
}
