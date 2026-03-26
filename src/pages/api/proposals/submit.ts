import type { APIRoute } from 'astro';
import { submitProposal, getUserProposalCount } from '../../../lib/github';
import { PROPOSAL_CATEGORIES, type ProposalCategory } from '../../../lib/types';

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Non authentifié·e' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { issueNumber, category, description } = body as {
    issueNumber: number;
    category: string;
    description: string;
  };

  if (!issueNumber || !category || !description?.trim()) {
    return new Response(JSON.stringify({ error: 'Données manquantes' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!PROPOSAL_CATEGORIES.includes(category as ProposalCategory)) {
    return new Response(JSON.stringify({ error: 'Catégorie invalide' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const count = await getUserProposalCount(issueNumber, user.login);
  if (count >= 3) {
    return new Response(JSON.stringify({ error: 'Limite de 3 propositions atteinte' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await submitProposal(issueNumber, category as ProposalCategory, description.trim(), user.login);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
