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

  // Charger tous les votes du chapitre en une seule passe
  const allVotes = await getAllVotes(issueNumber);

  for (const comment of comments) {
    if (!comment.user || comment.performed_via_github_app) continue;

    const parsed = parseProposalComment(comment.body || '');
    if (!parsed) continue;

    const commentKey = String(comment.id);

    // Calculer les scores depuis les fichiers JSON
    let upvotes = 0;
    let downvotes = 0;
    let userVote: '+1' | '-1' | null = null;

    for (const [voter, votes] of Object.entries(allVotes)) {
      if (votes[commentKey] === '+1') upvotes++;
      if (votes[commentKey] === '-1') downvotes++;
      if (voter === currentUserLogin && votes[commentKey]) {
        userVote = votes[commentKey];
      }
    }

    const realAuthor = parsed.authorLogin || comment.user.login;
    proposals.push({
      id: comment.id,
      nodeId: comment.node_id,
      author: realAuthor,
      avatarUrl: parsed.authorLogin
        ? `https://github.com/${parsed.authorLogin}.png?size=40`
        : comment.user.avatar_url,
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

  return comments.filter(c => {
    if ((c as any).minimized) return false;
    const parsed = parseProposalComment(c.body || '');
    if (!parsed) return false;
    const author = parsed.authorLogin || c.user?.login;
    return author === username;
  }).length;
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

// --- Votes (stockage JSON dans le repo) ---

type VoteMap = Record<string, '+1' | '-1'>;

async function getUserVoteFile(
  issueNumber: number,
  username: string,
): Promise<{ votes: VoteMap; sha: string | null }> {
  const octokit = getServerOctokit();
  const path = `votes/${issueNumber}/${username}.json`;

  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
    });

    if ('content' in data) {
      const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
      return { votes: content.votes || {}, sha: data.sha };
    }
  } catch (e: any) {
    if (e.status === 404) {
      return { votes: {}, sha: null };
    }
    throw e;
  }

  return { votes: {}, sha: null };
}

async function saveUserVoteFile(
  issueNumber: number,
  username: string,
  votes: VoteMap,
  sha: string | null,
): Promise<void> {
  const octokit = getServerOctokit();
  const path = `votes/${issueNumber}/${username}.json`;
  const content = Buffer.from(JSON.stringify({ votes }, null, 2)).toString('base64');

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message: `Vote de ${username} sur l'issue #${issueNumber}`,
    content,
    ...(sha ? { sha } : {}),
  });
}

export async function setVote(
  issueNumber: number,
  username: string,
  commentId: number,
  reaction: '+1' | '-1',
): Promise<void> {
  const { votes, sha } = await getUserVoteFile(issueNumber, username);
  const commentKey = String(commentId);

  if (votes[commentKey] === reaction) {
    // Toggle off
    delete votes[commentKey];
  } else {
    votes[commentKey] = reaction;
  }

  await saveUserVoteFile(issueNumber, username, votes, sha);
}

export async function getAllVotes(
  issueNumber: number,
): Promise<Record<string, VoteMap>> {
  const octokit = getServerOctokit();
  const path = `votes/${issueNumber}`;
  const allVotes: Record<string, VoteMap> = {};

  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
    });

    if (!Array.isArray(data)) return allVotes;

    for (const file of data) {
      if (!file.name.endsWith('.json')) continue;
      const username = file.name.replace('.json', '');

      try {
        const { data: fileData } = await octokit.repos.getContent({
          owner: OWNER,
          repo: REPO,
          path: file.path,
        });

        if ('content' in fileData) {
          const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
          allVotes[username] = content.votes || {};
        }
      } catch {
        // Fichier corrompu, on skip
      }
    }
  } catch (e: any) {
    if (e.status === 404) return allVotes;
    throw e;
  }

  return allVotes;
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

function parseProposalComment(body: string): { category: ProposalCategory; description: string; authorLogin: string | null } | null {
  const match = body.match(/^\*\*\[(.+?)\]\*\*\s*(.+)/s);
  if (!match) return null;

  const categoryRaw = match[1].trim();
  let description = match[2].trim();

  // Extraire l'auteur depuis la ligne "— proposé par @username"
  let authorLogin: string | null = null;
  const authorMatch = description.match(/\n\n— proposé par @(\S+)\s*$/);
  if (authorMatch) {
    authorLogin = authorMatch[1];
    description = description.replace(/\n\n— proposé par @\S+\s*$/, '').trim();
  }

  const validCategories: ProposalCategory[] = [
    'Personnage', 'Lieu', 'Événement', 'Objet/Artefact', 'Twist', 'Lore',
  ];

  const category = validCategories.find(
    c => c.toLowerCase() === categoryRaw.toLowerCase(),
  );

  if (!category) return null;

  return { category, description, authorLogin };
}
