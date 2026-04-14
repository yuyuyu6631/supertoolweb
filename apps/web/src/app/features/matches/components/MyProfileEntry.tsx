"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronRight, PencilLine, UserRound, WandSparkles, X } from "lucide-react";
import { useAuth } from "@/src/app/components/auth/AuthProvider";
import { ALL_MATCH_TOOL_TAGS, ALL_MATCH_VIBE_TAGS, MATCH_WORK_TYPE_OPTIONS } from "../mock-data";
import type { ProfileDraft } from "../types";

interface MyProfileEntryProps {
  draft: ProfileDraft | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (draft: ProfileDraft) => void;
  onClear: () => void;
}

function buildInitialDraft(name = ""): ProfileDraft {
  return {
    name,
    personaTitle: "",
    oneLiner: "",
    workType: "automation",
    toolTags: [],
    vibeTags: [],
  };
}

interface ProfileFormProps {
  draft: ProfileDraft;
  setDraft: Dispatch<SetStateAction<ProfileDraft>>;
  error: string | null;
  onCancel: () => void;
  onSave: () => void;
}

function ProfileForm({ draft, setDraft, error, onCancel, onSave }: ProfileFormProps) {
  const toggleChip = (field: "toolTags" | "vibeTags", value: string) => {
    setDraft((current) => {
      const exists = current[field].includes(value);
      return {
        ...current,
        [field]: exists ? current[field].filter((item) => item !== value) : [...current[field], value],
      };
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">昵称</span>
          <input
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="例如：Yuki"
            className="auth-input w-full rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">你现在的角色</span>
          <input
            value={draft.personaTitle}
            onChange={(event) => setDraft((current) => ({ ...current, personaTitle: event.target.value }))}
            placeholder="例如：内容运营 / 自动化搭建"
            className="auth-input w-full rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">一句话介绍</span>
        <textarea
          value={draft.oneLiner}
          onChange={(event) => setDraft((current) => ({ ...current, oneLiner: event.target.value }))}
          placeholder="描述一下你现在最常做的 AI 工作流"
          rows={3}
          className="auth-input w-full rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none"
        />
      </label>

      <div>
        <p className="text-sm font-medium text-slate-800">你更像哪一类</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {MATCH_WORK_TYPE_OPTIONS.map((option) => {
            const selected = draft.workType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, workType: option.value }))}
                className={`rounded-[20px] border px-4 py-3 text-left transition ${
                  selected ? "border-slate-900 bg-slate-900 text-white" : "border-white/45 bg-white/65 text-slate-800 hover:bg-white"
                }`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className={`mt-1 block text-xs leading-5 ${selected ? "text-white/75" : "text-slate-500"}`}>{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-800">我常用的工具</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ALL_MATCH_TOOL_TAGS.map((tool) => {
            const selected = draft.toolTags.includes(tool);
            return (
              <button
                key={tool}
                type="button"
                onClick={() => toggleChip("toolTags", tool)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selected ? "bg-slate-900 text-white" : "tag-muted"
                }`}
              >
                {tool}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-800">我的工作气质</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ALL_MATCH_VIBE_TAGS.map((tag) => {
            const selected = draft.vibeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleChip("vibeTags", tag)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selected ? "bg-slate-900 text-white" : "tag-muted"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onSave} className="btn-primary inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold">
          开启匹配
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-medium">
          取消
        </button>
      </div>
    </div>
  );
}

export default function MyProfileEntry({
  draft,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onClear,
}: MyProfileEntryProps) {
  const { currentUser } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [formDraft, setFormDraft] = useState<ProfileDraft>(() => buildInitialDraft(""));
  const [error, setError] = useState<string | null>(null);

  const displayName = currentUser?.username ?? "";
  const summaryTitle = useMemo(() => {
    if (!draft) return "建立我的名片";
    return draft.personaTitle || "我的工具名片";
  }, [draft]);

  useEffect(() => {
    const updateLayout = () => setIsMobile(window.innerWidth < 1024);
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    setFormDraft(draft ?? buildInitialDraft(displayName));
    setError(null);
  }, [displayName, draft, isEditing]);

  const handleSave = () => {
    if (formDraft.toolTags.length === 0) {
      setError("至少选择 1 个工具，匹配页才知道该把谁推到你面前。");
      return;
    }

    onSave({
      ...formDraft,
      name: formDraft.name.trim() || displayName || "匿名工具搭子",
      personaTitle: formDraft.personaTitle.trim() || "正在用 AI 做事的人",
      oneLiner: formDraft.oneLiner.trim() || "还没写介绍，但已经开始用工具搭流程。",
      toolTags: Array.from(new Set(formDraft.toolTags)),
      vibeTags: Array.from(new Set(formDraft.vibeTags)),
    });
  };

  const summaryContent = (
    <section className="card-base rounded-[28px] p-5" data-testid="my-profile-entry">
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">My Match Card</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">{summaryTitle}</h2>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          {draft
            ? `${draft.toolTags.length} 个工具已参与排序，后续会优先把和你工作流接近的人推到前面。`
            : "先告诉系统你常用哪套工具，再把随机流切成更接近你的同频流。"}
        </p>

        {draft ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {draft.toolTags.slice(0, 5).map((tag) => (
              <span key={tag} className="tag-muted rounded-full px-3 py-1 text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3">
          <button type="button" onClick={onEdit} className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
            <PencilLine className="h-4 w-4" />
            {draft ? "编辑我的名片" : "建立我的名片"}
          </button>
          {draft ? (
            <button type="button" onClick={onClear} className="btn-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium">
              清空我的工具
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );

  const editorContent = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">My Match Card</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">选择我的工具组合</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/70 text-slate-700 transition hover:bg-white"
          aria-label="关闭我的名片编辑"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">这份名片只保存在本地浏览器，用来排序随机流，不会同步到账号资料。</p>
      <div className="mt-5">
        <ProfileForm draft={formDraft} setDraft={setFormDraft} error={error} onCancel={onCancel} onSave={handleSave} />
      </div>
    </>
  );

  if (isMobile) {
    if (!isEditing) {
      return (
        <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
          <button
            type="button"
            onClick={onEdit}
            className="panel-base flex w-full items-center justify-between rounded-full px-4 py-3 text-left shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                <WandSparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">My Match Card</p>
                <p className="text-sm font-semibold text-slate-950">{draft ? "编辑我的名片" : "打开我的名片"}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500" />
          </button>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <button type="button" className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" onClick={onCancel} aria-label="关闭我的名片编辑" />
        <section className="panel-base absolute inset-x-4 bottom-4 rounded-[28px] p-5">
          <div className="max-h-[72vh] overflow-y-auto pr-1">{editorContent}</div>
        </section>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-24">
      {isEditing ? (
        <section className="card-base rounded-[28px] p-5" data-testid="my-profile-entry">
          <div className="relative z-10">{editorContent}</div>
        </section>
      ) : (
        summaryContent
      )}
    </div>
  );
}
