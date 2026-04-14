"use client";

import { useEffect, useMemo, useState } from "react";
import type { MatchState, MockProfile, ProfileDraft, ResolvedMatchProfile, WorkType } from "../types";
import MatchCard from "./MatchCard";
import GreetingDrawer from "./GreetingDrawer";
import MyProfileEntry from "./MyProfileEntry";

export const PROFILE_STORAGE_KEY = "matches-profile-draft";
export const FAVORITES_STORAGE_KEY = "matches-favorites";

function isWorkType(value: unknown): value is WorkType {
  return value === "content" || value === "automation" || value === "expression";
}

function sanitizeStringArray(value: unknown, max: number) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, max);
}

export function createEmptyProfileDraft(name = ""): ProfileDraft {
  return {
    name,
    personaTitle: "",
    oneLiner: "",
    workType: "automation",
    toolTags: [],
    vibeTags: [],
  };
}

export function sanitizeProfileDraft(value: unknown): ProfileDraft | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Record<string, unknown>;
  return {
    name: typeof candidate.name === "string" ? candidate.name.trim() : "",
    personaTitle: typeof candidate.personaTitle === "string" ? candidate.personaTitle.trim() : "",
    oneLiner: typeof candidate.oneLiner === "string" ? candidate.oneLiner.trim() : "",
    workType: isWorkType(candidate.workType) ? candidate.workType : "automation",
    toolTags: sanitizeStringArray(candidate.toolTags, 8),
    vibeTags: sanitizeStringArray(candidate.vibeTags, 6),
  };
}

export function readStoredProfileDraft(): ProfileDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return sanitizeProfileDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function readStoredFavoriteIds() {
  if (typeof window === "undefined") return [] as string[];

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [] as string[];
    return sanitizeStringArray(JSON.parse(raw), 200);
  } catch {
    return [] as string[];
  }
}

export function shuffleProfiles(profiles: MockProfile[], random: () => number = Math.random) {
  const copy = [...profiles];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  }
  return copy;
}

function buildDefaultMatchLabel(score: number) {
  if (score >= 90) return "高同频";
  if (score >= 82) return "工具重合";
  return "工作流接近";
}

function buildFilteredMatchLabel(sharedToolsCount: number, workTypeMatched: boolean, vibeOverlapCount: number, matchScore: number) {
  if (sharedToolsCount >= 2 || (sharedToolsCount >= 1 && workTypeMatched && vibeOverlapCount >= 1)) return "高同频";
  if (sharedToolsCount >= 1 || vibeOverlapCount >= 2 || matchScore >= 90) return "工具重合";
  return "工作流接近";
}

function resolveProfile(profile: MockProfile, profileDraft: ProfileDraft | null): ResolvedMatchProfile {
  const hasProfile = Boolean(profileDraft && profileDraft.toolTags.length > 0);
  const sharedTools = hasProfile
    ? profile.toolTags.filter((tool) => profileDraft?.toolTags.includes(tool))
    : [];
  const vibeOverlapCount = hasProfile ? profile.vibeTags.filter((tag) => profileDraft?.vibeTags.includes(tag)).length : 0;
  const workTypeMatched = hasProfile ? profile.workType === profileDraft?.workType : false;

  return {
    ...profile,
    sharedTools,
    vibeOverlapCount,
    workTypeMatched,
    recommendationTools: sharedTools.length > 0 ? sharedTools : profile.toolTags.slice(0, 3),
    rankingScore: sharedTools.length * 100 + (workTypeMatched ? 20 : 0) + vibeOverlapCount * 6 + profile.matchScore / 100,
    matchLabel: hasProfile
      ? buildFilteredMatchLabel(sharedTools.length, workTypeMatched, vibeOverlapCount, profile.matchScore)
      : buildDefaultMatchLabel(profile.matchScore),
  };
}

export function buildMatchFeed(baseProfiles: MockProfile[], profileDraft: ProfileDraft | null): ResolvedMatchProfile[] {
  const resolvedProfiles = baseProfiles.map((profile) => resolveProfile(profile, profileDraft));
  const hasProfile = Boolean(profileDraft && profileDraft.toolTags.length > 0);

  if (!hasProfile) {
    return resolvedProfiles;
  }

  const orderIndexMap = new Map(baseProfiles.map((profile, index) => [profile.id, index]));

  return [...resolvedProfiles].sort((left, right) => {
    if (right.sharedTools.length !== left.sharedTools.length) {
      return right.sharedTools.length - left.sharedTools.length;
    }
    if (Number(right.workTypeMatched) !== Number(left.workTypeMatched)) {
      return Number(right.workTypeMatched) - Number(left.workTypeMatched);
    }
    if (right.vibeOverlapCount !== left.vibeOverlapCount) {
      return right.vibeOverlapCount - left.vibeOverlapCount;
    }
    if (right.matchScore !== left.matchScore) {
      return right.matchScore - left.matchScore;
    }
    return (orderIndexMap.get(left.id) ?? 0) - (orderIndexMap.get(right.id) ?? 0);
  });
}

function getFeedState(profileDraft: ProfileDraft | null): MatchState {
  return profileDraft && profileDraft.toolTags.length > 0 ? { type: "filteredFeed" } : { type: "defaultFeed" };
}

function persistProfileDraft(profileDraft: ProfileDraft | null) {
  if (typeof window === "undefined") return;

  if (!profileDraft) {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileDraft));
}

function persistFavoriteIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}

interface MatchFeedProps {
  profiles: MockProfile[];
}

export default function MatchFeed({ profiles }: MatchFeedProps) {
  const [baseProfiles, setBaseProfiles] = useState<MockProfile[]>(profiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [viewState, setViewState] = useState<MatchState>({ type: "defaultFeed" });

  useEffect(() => {
    setBaseProfiles(shuffleProfiles(profiles, Math.random));
    const storedDraft = readStoredProfileDraft();
    const storedFavorites = readStoredFavoriteIds();

    setProfileDraft(storedDraft);
    setFavoriteIds(storedFavorites);
    setViewState(getFeedState(storedDraft));
  }, [profiles]);

  const feedProfiles = useMemo(() => buildMatchFeed(baseProfiles, profileDraft), [baseProfiles, profileDraft]);

  useEffect(() => {
    if (feedProfiles.length === 0) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((index) => index % feedProfiles.length);
  }, [feedProfiles.length]);

  const hasProfileDraft = Boolean(profileDraft && profileDraft.toolTags.length > 0);
  const activeProfile = feedProfiles.length > 0 ? feedProfiles[currentIndex % feedProfiles.length] : null;
  const feedMode = hasProfileDraft ? "filteredFeed" : "defaultFeed";
  const selectedProfile = viewState.type === "selectedProfile" ? viewState.profile : null;

  const advanceToNext = () => {
    if (feedProfiles.length <= 1) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((index) => (index + 1) % feedProfiles.length);
  };

  const handleSkip = () => {
    advanceToNext();
  };

  const handleOpenDrawer = () => {
    if (!activeProfile) return;
    setViewState({ type: "selectedProfile", profile: activeProfile });
  };

  const handleCloseDrawer = () => {
    setViewState(getFeedState(profileDraft));
    advanceToNext();
  };

  const handleFavorite = () => {
    if (!selectedProfile) return;

    setFavoriteIds((current) => {
      if (current.includes(selectedProfile.id)) {
        return current;
      }

      const next = [...current, selectedProfile.id];
      persistFavoriteIds(next);
      return next;
    });

    setViewState(getFeedState(profileDraft));
    advanceToNext();
  };

  const handleEditProfile = () => {
    setViewState({ type: "myDraftProfile" });
  };

  const handleCancelEdit = () => {
    setViewState(getFeedState(profileDraft));
  };

  const handleSaveProfile = (nextDraft: ProfileDraft) => {
    persistProfileDraft(nextDraft);
    setProfileDraft(nextDraft);
    setCurrentIndex(0);
    setViewState({ type: "filteredFeed" });
  };

  const handleClearProfile = () => {
    persistProfileDraft(null);
    setProfileDraft(null);
    setCurrentIndex(0);
    setViewState({ type: "defaultFeed" });
  };

  if (!activeProfile) {
    return null;
  }

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" data-testid="match-feed">
        <div className="space-y-4">
          <div className="panel-base rounded-[24px] px-4 py-3 text-sm text-slate-700">
            <p>
              {feedMode === "filteredFeed"
                ? "已按你的工具组合排序：共同工具优先，其次看工作类型、vibe 重合和原始推荐分。"
                : "随机遇见正在用 AI 做事的人。建立你的工具名片后，推荐会立刻变得更接近你。"}
            </p>
          </div>

          <MatchCard
            profile={activeProfile}
            mode={feedMode}
            isFavorite={favoriteIds.includes(activeProfile.id)}
            onLike={handleOpenDrawer}
            onSkip={handleSkip}
          />
        </div>

        <MyProfileEntry
          draft={profileDraft}
          isEditing={viewState.type === "myDraftProfile"}
          onEdit={handleEditProfile}
          onCancel={handleCancelEdit}
          onSave={handleSaveProfile}
          onClear={handleClearProfile}
        />
      </section>

      <GreetingDrawer
        open={viewState.type === "selectedProfile"}
        profile={selectedProfile}
        hasProfileDraft={hasProfileDraft}
        isFavorite={selectedProfile ? favoriteIds.includes(selectedProfile.id) : false}
        onClose={handleCloseDrawer}
        onFavorite={handleFavorite}
      />
    </>
  );
}
