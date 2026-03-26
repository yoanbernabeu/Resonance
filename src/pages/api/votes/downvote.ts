import type { APIRoute } from 'astro';
import { setVote, getAllVotes } from '../../../lib/github';

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Non authentifié·e' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { commentId, issueNumber } = (await request.json()) as { commentId: number; issueNumber: number };
  if (!commentId || !issueNumber) {
    return new Response(JSON.stringify({ error: 'commentId ou issueNumber manquant' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await setVote(issueNumber, user.login, commentId, '-1');

  // Recalculer le score
  const allVotes = await getAllVotes(issueNumber);
  const commentKey = String(commentId);
  let upvotes = 0;
  let downvotes = 0;
  for (const votes of Object.values(allVotes)) {
    if (votes[commentKey] === '+1') upvotes++;
    if (votes[commentKey] === '-1') downvotes++;
  }

  return new Response(JSON.stringify({ ok: true, score: upvotes - downvotes }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
