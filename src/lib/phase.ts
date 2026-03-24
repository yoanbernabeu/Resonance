import type { Phase } from './types';

export interface ActivePhaseInfo {
  phase: Phase | null;
  chapterTitle: string | null;
  issueNumber: number | null;
}

export async function getActivePhase(): Promise<ActivePhaseInfo> {
  // Avoid importing github.ts at module level to prevent errors when env vars are missing
  const { getActiveChapterIssue } = await import('./github');

  for (const phase of ['propositions', 'votes', 'redaction'] as Phase[]) {
    try {
      const issue = await getActiveChapterIssue(phase);
      if (issue) {
        return { phase, chapterTitle: issue.title, issueNumber: issue.number };
      }
    } catch {
      continue;
    }
  }

  return { phase: null, chapterTitle: null, issueNumber: null };
}
