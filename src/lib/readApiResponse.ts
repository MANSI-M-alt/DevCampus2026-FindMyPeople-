export async function readApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const body = await response.text();
    const preview = body.trim().slice(0, 120);
    throw new Error(
      `The API returned a non-JSON response (HTTP ${response.status}). ` +
      `${preview.startsWith('<') ? 'Check that the latest Netlify Functions deploy is live and the /api route is configured.' : preview}`
    );
  }
  return response.json() as Promise<T>;
}
