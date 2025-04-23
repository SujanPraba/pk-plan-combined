// Types for the Planning Poker app

export interface User {
  id: string;
  name: string;
  isHost: boolean;
  hasVoted?: boolean;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  votes?: Record<string, string | number>; // userId: vote
  finalEstimate?: string | number;
}

export interface PokerSession {
  id?: string;
  sessionId: string;
  name: string;
  votingSystem: 'fibonacci' | 'tshirt';
  stories: Story[];
  participants: User[];
  currentStoryId?: string;
  isVotingComplete?: boolean;
  hasVotesRevealed?: boolean;
  createdAt: Date;
  createdBy: string;
}

export type FibonacciValue = '?' | '0' | '1' | '2' | '3' | '5' | '8' | '13' | '21' | '34' | '∞';
export type TShirtValue = '?' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
