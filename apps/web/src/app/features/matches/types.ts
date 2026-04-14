export type WorkType = "content" | "automation" | "expression";

export interface MockProfile {
  id: string;
  name: string;
  avatar?: string;
  avatarStyle: string;
  personaTitle: string;
  oneLiner: string;
  workType: WorkType;
  toolTags: string[];
  vibeTags: string[];
  introPrompt: string;
  matchScore: number;
  sharedTools: string[];
  isBot: boolean;
}

export interface ProfileDraft {
  name: string;
  personaTitle: string;
  oneLiner: string;
  workType: WorkType;
  toolTags: string[];
  vibeTags: string[];
}

export interface ResolvedMatchProfile extends MockProfile {
  sharedTools: string[];
  vibeOverlapCount: number;
  workTypeMatched: boolean;
  matchLabel: string;
  recommendationTools: string[];
  rankingScore: number;
}

export type MatchState =
  | { type: "defaultFeed" }
  | { type: "filteredFeed" }
  | { type: "selectedProfile"; profile: ResolvedMatchProfile }
  | { type: "myDraftProfile" };
