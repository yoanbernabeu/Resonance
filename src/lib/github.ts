import { Octokit } from '@octokit/rest';
import type { Proposal, ProposalCategory, Phase } from './types';

const OWNER = import.meta.env.GITHUB_REPO_OWNER;
const REPO = import.meta.env.GITHUB_REPO_NAME;

export function getServerOctokit(): Octokit {
  return new Octokit({ auth: import.meta.env.GITHUB_PAT });
}

// --- Lecture ---

export async function getActiveChapterIssue(phase: Phase): Promise<{
  number: number;
  title: string;
  body: string | null;
} | null> {
  const octokit = getServerOctokit();
  const { data: issues } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    labels: `phase:${phase}`,
    state: 'open',
    sort: 'created',
    direction: 'desc',
    per_page: 1,
  });

  if (issues.length === 0) return null;

  const issue = issues[0];
  return {
    number: issue.number,
    title: issue.title,
    body: issue.body ?? null,
  };
}

export async function getCurrentPhase(issueNumber: number): Promise<Phase | null> {
  const octokit = getServerOctokit();
  const { data: issue } = await octokit.issues.get({
    owner: OWNER,
    repo: REPO,
    issue_number: issueNumber,
  });

  for (const label of issue.labels) {
    const name = typeof label === 'string' ? label : label.name;
    if (name === 'phase:propositions') return 'propositions';
    if (name === 'phase:votes') return 'votes';
    if (name === 'phase:redaction') return 'redaction';
  }

  return null;
}

export async function getProposals(
  issueNumber: number,
  currentUserLogin?: string,
): Promise<Proposal[]> {
  const octokit = getServerOctokit();

  const comments = await octokit.paginate(octokit.issues.listComments, {
    owner: OWNER,
    repo: REPO,
    issue_number: issueNumber,
    per_page: 100,
  });

  const proposals: Proposal[] = [];

  for (const comment of comments) {
    if (!comment.user || comment.performed_via_github_app) continue;

    const parsed = parseProposalComment(comment.body || '');
    if (!parsed) continue;

    const reactions = await octokit.reactions.listForIssueComment({
      owner: OWNER,
      repo: REPO,
      comment_id: comment.id,
      per_page: 100,
    });

    const upvotes = reactions.data.filter(r => r.content === '+1').length;
    const downvotes = reactions.data.filter(r => r.content === '-1').length;

    let userVote: '+1' | '-1' | null = null;
    if (currentUserLogin) {
      const userReaction = reactions.data.find(r => r.user?.login === currentUserLogin);
      if (userReaction) {
        userVote = userReaction.content === '+1' ? '+1' : userReaction.content === '-1' ? '-1' : null;
      }
    }

    proposals.push({
      id: comment.id,
      nodeId: comment.node_id,
      author: comment.user.login,
      avatarUrl: comment.user.avatar_url,
      category: parsed.category,
      description: parsed.description,
      score: upvotes - downvotes,
      upvotes,
      downvotes,
      userVote,
      isMinimized: (comment as any).minimized || false,
      createdAt: comment.created_at,
    });
  }

  return proposals;
}

export async function getUserProposalCount(
  issueNumber: number,
  username: string,
): Promise<number> {
  const octokit = getServerOctokit();

  const comments = await octokit.paginate(octokit.issues.listComments, {
    owner: OWNER,
    repo: REPO,
    issue_number: issueNumber,
    per_page: 100,
  });

  return comments.filter(
    c => c.user?.login === username && !(c as any).minimized && parseProposalComment(c.body || ''),
  ).length;
}

export async function getAllChapterIssues(): Promise<
  Array<{ number: number; title: string; phase: Phase | null }>
> {
  const octokit = getServerOctokit();

  const { data: issues } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'all',
    labels: '',
    sort: 'created',
    direction: 'asc',
    per_page: 100,
  });

  return issues
    .filter(issue => {
      const labels = issue.labels.map(l => (typeof l === 'string' ? l : l.name || ''));
      return labels.some(l => l.startsWith('phase:'));
    })
    .map(issue => {
      const labels = issue.labels.map(l => (typeof l === 'string' ? l : l.name || ''));
      let phase: Phase | null = null;
      if (labels.includes('phase:propositions')) phase = 'propositions';
      else if (labels.includes('phase:votes')) phase = 'votes';
      else if (labels.includes('phase:redaction')) phase = 'redaction';

      return {
        number: issue.number,
        title: issue.title,
        phase,
      };
    });
}

// --- Écriture ---

export async function submitProposal(
  issueNumber: number,
  category: ProposalCategory,
  description: string,
  userLogin: string,
): Promise<void> {
  const octokit = getServerOctokit();
  await octokit.issues.createComment({
    owner: OWNER,
    repo: REPO,
    issue_number: issueNumber,
    body: `**[${category}]** ${description}\n\n— proposé par @${userLogin}`,
  });
}

export async function addReaction(
  commentId: number,
  reaction: '+1' | '-1',
): Promise<void> {
  const octokit = getServerOctokit();
  await octokit.reactions.createForIssueComment({
    owner: OWNER,
    repo: REPO,
    comment_id: commentId,
    content: reaction,
  });
}

export async function removeReaction(
  commentId: number,
  reactionId: number,
): Promise<void> {
  const octokit = getServerOctokit();
  await octokit.reactions.deleteForIssueComment({
    owner: OWNER,
    repo: REPO,
    comment_id: commentId,
    reaction_id: reactionId,
  });
}

export async function getUserReactionOnComment(
  commentId: number,
  username: string,
): Promise<{ id: number; content: string } | null> {
  const octokit = getServerOctokit();
  const { data: reactions } = await octokit.reactions.listForIssueComment({
    owner: OWNER,
    repo: REPO,
    comment_id: commentId,
    per_page: 100,
  });

  const userReaction = reactions.find(r => r.user?.login === username);
  return userReaction ? { id: userReaction.id, content: userReaction.content } : null;
}

// --- Admin ---

export async function setPhaseLabel(
  issueNumber: number,
  newPhase: Phase,
): Promise<void> {
  const octokit = getServerOctokit();

  const { data: issue } = await octokit.issues.get({
    owner: OWNER,
    repo: REPO,
    issue_number: issueNumber,
  });

  const currentLabels = issue.labels
    .map(l => (typeof l === 'string' ? l : l.name || ''))
    .filter(l => !l.startsWith('phase:'));

  currentLabels.push(`phase:${newPhase}`);

  await octokit.issues.update({
    owner: OWNER,
    repo: REPO,
    issue_number: issueNumber,
    labels: currentLabels,
  });

  // Lock l'issue quand on passe en phase votes (empêche nouveaux commentaires, pas les réactions)
  if (newPhase === 'votes' || newPhase === 'redaction') {
    await octokit.issues.lock({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
      lock_reason: 'resolved',
    });
  }
}

export async function createChapterIssue(
  chapterNumber: number,
): Promise<number> {
  const octokit = getServerOctokit();

  // Créer les labels si nécessaires
  const phaseLabels = ['phase:propositions', 'phase:votes', 'phase:redaction'];
  for (const label of phaseLabels) {
    try {
      await octokit.issues.getLabel({ owner: OWNER, repo: REPO, name: label });
    } catch {
      await octokit.issues.createLabel({
        owner: OWNER,
        repo: REPO,
        name: label,
        color: label.includes('propositions') ? '6366f1' : label.includes('votes') ? 'f59e0b' : '10b981',
      });
    }
  }

  const { data: issue } = await octokit.issues.create({
    owner: OWNER,
    repo: REPO,
    title: `Chapitre ${chapterNumber} — Propositions`,
    body: [
      `## Propositions pour le Chapitre ${chapterNumber}`,
      '',
      'Soumettez vos idées pour le prochain chapitre ! Chaque proposition doit commencer par une catégorie :',
      '',
      '- **Personnage** — un nouveau personnage ou trait de personnage',
      '- **Lieu** — un monde, une station, un endroit',
      '- **Événement** — quelque chose qui se passe dans l\'histoire',
      '- **Objet/Artefact** — un objet, une technologie, un vestige',
      '- **Twist** — un retournement, une révélation',
      '- **Lore** — un élément d\'univers, d\'histoire ou de contexte',
      '',
      '**Limite : 3 propositions par personne.**',
    ].join('\n'),
    labels: ['phase:propositions'],
  });

  return issue.number;
}

// --- Helpers ---

function parseProposalComment(body: string): { category: ProposalCategory; description: string } | null {
  const match = body.match(/^\*\*\[(.+?)\]\*\*\s*(.+)/s);
  if (!match) return null;

  const categoryRaw = match[1].trim();
  const description = match[2].trim();

  const validCategories: ProposalCategory[] = [
    'Personnage', 'Lieu', 'Événement', 'Objet/Artefact', 'Twist', 'Lore',
  ];

  const category = validCategories.find(
    c => c.toLowerCase() === categoryRaw.toLowerCase(),
  );

  if (!category) return null;

  return { category, description };
}
