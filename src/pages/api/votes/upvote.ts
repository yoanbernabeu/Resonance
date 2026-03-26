import type { APIRoute } from 'astro';
import { addReaction, removeReaction, getUserReactionOnComment } from '../../../lib/github';

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Non authentifié·e' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { commentId } = (await request.json()) as { commentId: number };
  if (!commentId) {
    return new Response(JSON.stringify({ error: 'commentId manquant' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const existing = await getUserReactionOnComment(commentId, user.login);

  if (existing?.content === '+1') {
    // Toggle off
    await removeReaction(commentId, existing.id);
  } else {
    if (existing) {
      // Remove opposite reaction first
      await removeReaction(commentId, existing.id);
    }
    await addReaction(commentId, '+1');
  }

  // Re-fetch to get updated score
  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({ auth: import.meta.env.GITHUB_PAT });
  const { data: reactions } = await octokit.reactions.listForIssueComment({
    owner: import.meta.env.GITHUB_REPO_OWNER,
    repo: import.meta.env.GITHUB_REPO_NAME,
    comment_id: commentId,
    per_page: 100,
  });

  const upvotes = reactions.filter(r => r.content === '+1').length;
  const downvotes = reactions.filter(r => r.content === '-1').length;

  return new Response(JSON.stringify({ ok: true, score: upvotes - downvotes }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
