export interface ChapterMeta {
  numero: number;
  titre: string;
  slug: string;
  resume: string;
  datePublication: string;
  issueNumber: number | null;
}

export interface Chapter {
  meta: ChapterMeta;
  content: string;
}

export type ProposalCategory =
  | 'Personnage'
  | 'Lieu'
  | 'Événement'
  | 'Objet/Artefact'
  | 'Twist'
  | 'Lore';

export const PROPOSAL_CATEGORIES: ProposalCategory[] = [
  'Personnage',
  'Lieu',
  'Événement',
  'Objet/Artefact',
  'Twist',
  'Lore',
];

export interface Proposal {
  id: number;
  nodeId: string;
  author: string;
  avatarUrl: string;
  category: ProposalCategory;
  description: string;
  score: number;
  upvotes: number;
  downvotes: number;
  userVote: '+1' | '-1' | null;
  isMinimized: boolean;
  createdAt: string;
}

export type Phase = 'propositions' | 'votes' | 'redaction';
