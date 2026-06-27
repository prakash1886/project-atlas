export interface ContentAsset {
  id: number;
  topic: string;
  status: string;
  script_content: string | null;
  article_content: string | null;
  voice_url: string | null;
  thumbnail_prompt: string | null;
  temporal_workflow_id: string | null;
  review_notes: string | null;
  created_at: string;
}

export type EditorialDecision = 'PASS' | 'REJECT';

class UnauthorizedError extends Error {}

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    throw new UnauthorizedError('Invalid or missing reviewer token');
  }
  if (!res.ok) {
    throw new Error(`Request to ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export const reviewsApi = {
  getPending: (token: string) => request<ContentAsset[]>('/api/reviews/pending', token),
  vote: (token: string, id: number, decision: EditorialDecision, notes?: string) =>
    request<{ id: number; status: string }>(`/api/reviews/${id}/vote`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, notes }),
    }),
};

export { UnauthorizedError };
