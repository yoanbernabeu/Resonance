import type { Phase } from './types';

export interface ActivePhaseInfo {
  phase: Phase | null;
  chapterTitle: string | null;
  issueNumber: number | null;
}

const CACHE_TTL_MS = 60_000;
let cache: { value: ActivePhaseInfo; expiresAt: number } | null = null;
let inflight: Promise<ActivePhaseInfo> | null = null;

async function fetchActivePhase(): Promise<ActivePhaseInfo> {
  const { getActiveChapterIssue } = await import('./github');

  const phases: Phase[] = ['propositions', 'votes', 'redaction'];
  const results = await Promise.all(
    phases.map((phase) => getActiveChapterIssue(phase).catch(() => null))
  );

  for (let i = 0; i < phases.length; i++) {
    const issue = results[i];
    if (issue) {
      return { phase: phases[i], chapterTitle: issue.title, issueNumber: issue.number };
    }
  }
  return { phase: null, chapterTitle: null, issueNumber: null };
}

export async function getActivePhase(): Promise<ActivePhaseInfo> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.value;
  if (inflight) return inflight;

  inflight = fetchActivePhase()
    .then((value) => {
      cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      return value;
    })
    .finally(() => { inflight = null; });

  return inflight;
}
