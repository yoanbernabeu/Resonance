import type { APIRoute } from 'astro';
import { setPhaseLabel, createChapterIssue, getAllChapterIssues } from '../../../lib/github';
import type { Phase } from '../../../lib/types';

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  const repoOwner = import.meta.env.GITHUB_REPO_OWNER;

  if (!user || user.login !== repoOwner) {
    return new Response(JSON.stringify({ error: 'Accès non autorisé' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { action } = body as { action: string };

  if (action === 'create') {
    const issues = await getAllChapterIssues();
    const nextNumber = issues.length + 1;
    const issueNumber = await createChapterIssue(nextNumber, user.accessToken);

    return new Response(JSON.stringify({ ok: true, issueNumber }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'transition') {
    const { issueNumber, newPhase } = body as {
      issueNumber: number;
      newPhase: Phase;
    };

    if (!issueNumber || !['propositions', 'votes', 'redaction'].includes(newPhase)) {
      return new Response(JSON.stringify({ error: 'Paramètres invalides' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await setPhaseLabel(issueNumber, newPhase, user.accessToken);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Action inconnue' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
