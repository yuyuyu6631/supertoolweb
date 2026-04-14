import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** 提取解析逻辑 */
export const parseThinkContent = (text: string) => {
    const thinkRegex = /<think>([\s\S]*?)(?:<\/think>|$)/;
    const match = text.match(thinkRegex);
    if (match) {
        const thought = match[1];
        const answer = text.replace(thinkRegex, "").trim();
        return { thought, answer };
    }
    return { thought: null, answer: text };
};

/** 思维过程组件 */
export const ThoughtBlock = ({ content }: { content: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!content.trim()) return null;

    return (
        <div className="mb-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all animate-in fade-in slide-in-from-top-1 duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 hover:text-indigo-500 transition-colors w-full"
            >
                <div className={`p-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </div>
                <span>{isExpanded ? "收起思考过程" : "已深度思考"}</span>
            </button>
            {isExpanded && (
                <div className="mt-2.5 text-[12px] text-slate-500 dark:text-slate-400 italic whitespace-pre-wrap leading-relaxed border-t border-slate-200/40 dark:border-slate-700/30 pt-2.5 px-1 font-serif">
                    {content}
                </div>
            )}
        </div>
    );
};

interface AssistantMessageProps {
    content: string;
}

/** 助手消息的 Markdown 渲染器 */
export function AssistantMessage({ content }: AssistantMessageProps) {
    const { thought, answer } = parseThinkContent(content);

    return (
        <div className="flex flex-col gap-1">
            {thought && <ThoughtBlock content={thought} />}
            {answer && (
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        a: ({ ...props }) => (
                            <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-500 hover:text-indigo-600 underline underline-offset-2 transition-colors"
                            />
                        ),
                        table: ({ ...props }) => (
                            <div className="overflow-x-auto my-2">
                                <table className="min-w-full text-xs border-collapse" {...props} />
                            </div>
                        ),
                        th: ({ ...props }) => (
                            <th className="px-2 py-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-left" {...props} />
                        ),
                        td: ({ ...props }) => (
                            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700" {...props} />
                        ),
                        code: ({ className, children, ...props }) => {
                            const isInline = !className;
                            return isInline ? (
                                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-pink-600 dark:text-pink-400" {...props}>{children}</code>
                            ) : (
                                <code className={`block p-2 my-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-x-auto ${className || ""}`} {...props}>{children}</code>
                            );
                        },
                        ul: ({ ...props }) => <ul className="list-disc pl-4 my-1 space-y-0.5" {...props} />,
                        ol: ({ ...props }) => <ol className="list-decimal pl-4 my-1 space-y-0.5" {...props} />,
                        h1: ({ ...props }) => <h1 className="text-base font-bold mt-2 mb-1" {...props} />,
                        h2: ({ ...props }) => <h2 className="text-sm font-bold mt-2 mb-1" {...props} />,
                        h3: ({ ...props }) => <h3 className="text-sm font-semibold mt-1.5 mb-0.5" {...props} />,
                        p: ({ ...props }) => <p className="my-1 leading-relaxed" {...props} />,
                        strong: ({ ...props }) => <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />,
                        hr: () => <hr className="my-2 border-gray-200 dark:border-gray-700" />,
                        blockquote: ({ ...props }) => (
                            <blockquote className="border-l-2 border-indigo-400 pl-2 my-1 text-gray-600 dark:text-gray-400 italic" {...props} />
                        ),
                    }}
                >
                    {answer}
                </ReactMarkdown>
            )}
        </div>
    );
}
