"use client";

import React, { useEffect } from "react";
import { useChat, QUICK_QUESTIONS, Message } from "../../hooks/useChat";
import { AssistantMessage } from "./AssistantMessage";

export default function InlineChatBot() {
    const {
        messages,
        input,
        setInput,
        isLoading,
        containerRef,
        showQuickQuestions,
        scrollToBottom,
        handleSend
    } = useChat();

    // 内嵌组件默认展开，消息变化时自动滚动
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    return (
        <div className="flex flex-col h-full min-h-[460px] max-h-[600px] w-full rounded-[24px] border border-white/40 bg-white/60 overflow-hidden shadow-sm backdrop-blur-md">
            {/* ── 内嵌态简易 Header (可选) ── */}
            <div className="px-5 py-4 border-b border-white/30 flex justify-between items-center bg-white/40">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                        AI
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-slate-800 leading-tight">不知道用什么？</h3>
                        <p className="text-[10px] text-slate-500">让智能导购帮你缩小范围</p>
                    </div>
                </div>
            </div>

            {/* ── Messages ── */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-behavior-contain"
                style={{ overscrollBehavior: 'contain' }}
            >
                {messages.map((msg: Message, idx: number) => (
                    <div
                        key={idx}
                        className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        <div
                            className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium mt-0.5 ${msg.role === "user"
                                ? "bg-slate-800 text-white"
                                : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                }`}
                        >
                            {msg.role === "user" ? "我" : "AI"}
                        </div>
                        <div
                            className={`message-bubble max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words shadow-sm ${msg.role === "user"
                                ? "bg-slate-800 text-white rounded-tr-sm"
                                : "bg-white text-slate-800 border border-slate-100/60 rounded-tl-sm"
                                }`}
                        >
                            {msg.role === "assistant" ? (
                                <AssistantMessage content={msg.content || "…"} />
                            ) : (
                                <span className="whitespace-pre-wrap">{msg.content}</span>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex gap-2.5 flex-row">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-[11px] font-medium">
                            AI
                        </div>
                        <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] bg-white border border-slate-100/60 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                            <span className="ml-1.5 text-xs text-slate-400">正在思考…</span>
                        </div>
                    </div>
                )}

                {showQuickQuestions && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {QUICK_QUESTIONS.map((q: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(q)}
                                className="px-3 py-1.5 text-[11px] bg-white/80 text-slate-600 border border-slate-200/60 rounded-full hover:bg-white hover:border-slate-300 hover:text-slate-900 transition-all duration-200 shadow-sm"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* 已经使用 containerRef 滚动，不再使用 dummy div */}
            </div>

            {/* ── Input Area ── */}
            <div className="p-3 bg-white/70 border-t border-white/50">
                <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200/60 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all shadow-sm">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={isLoading}
                        placeholder="用一句话描述你想做的事..."
                        className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="p-2 text-white bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors"
                        aria-label="发送消息"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
