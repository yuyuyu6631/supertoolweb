import { useState, useCallback, useRef } from "react";

export type Message = {
    role: "user" | "assistant";
    content: string;
};

export const WELCOME_MESSAGE: Message = {
    role: "assistant",
    content: "您好！我是**星点评 AI 导购助手** 🤖\n\n我可以帮您：\n- 🔍 **搜索和推荐** AI 工具\n- ⚖️ **对比** 不同工具的优劣\n- 💡 **解答** AI 工具相关问题\n\n请告诉我您的需求，或点击下方快捷提问开始！",
};

export const QUICK_QUESTIONS = [
    "帮我找一款 AI 写作工具",
    "推荐适合做 PPT 的 AI 工具",
    "有哪些免费的 AI 工具？",
    "AI 绘画工具哪家强？",
];

export async function buildChatRequestError(response: Response): Promise<Error> {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? JSON.stringify(await response.json()) : await response.text();
    const detail = payload.trim().slice(0, 300);
    const message = detail
        ? `Chat request failed with status ${response.status}: ${detail}`
        : `Chat request failed with status ${response.status}`;
    return new Error(message);
}

export function useChat() {
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    /** 滚动到最新消息 - 采用精确位移而非 scrollIntoView 以防止全局抖动 */
    const scrollToBottom = useCallback(() => {
        if (containerRef.current) {
            const container = containerRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth"
            });
        }
    }, []);

    /** 清空对话，恢复初始状态 */
    const handleReset = useCallback(() => {
        setMessages([WELCOME_MESSAGE]);
        setInput("");
        setIsLoading(false);
    }, []);

    /** 是否仅有初始欢迎消息 */
    const showQuickQuestions = messages.length === 1 && messages[0].role === "assistant" && !isLoading;

    /** 发送消息（SSE 流式处理） */
    const handleSend = async (overrideText?: string) => {
        const text = (overrideText || input).trim();
        if (!text || isLoading) return;

        const userMessage: Message = { role: "user", content: text };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
            const response = await fetch(`${apiBaseUrl}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
            });

            if (!response.ok) {
                throw await buildChatRequestError(response);
            }

            if (!response.body) {
                throw new Error("No response body");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            // 插入空的 assistant 消息占位
            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            // SSE 行缓冲区与累计文本
            let buffer = "";
            let fullAssistantText = "";
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });

                    const parts = buffer.split("\n\n");
                    buffer = parts.pop() || "";

                    for (const part of parts) {
                        const line = part.trim();
                        if (!line.startsWith("data: ")) continue;

                        const dataStr = line.slice(6);
                        if (dataStr === "[DONE]") {
                            done = true;
                            break;
                        }

                        try {
                            const payload = JSON.parse(dataStr);

                            // 错误事件
                            if (payload.error) {
                                const errorMessage = `> ⚠️ **系统提示**：${payload.error}`;
                                setMessages(prev => {
                                    const updated = [...prev];
                                    const lastIdx = updated.length - 1;
                                    if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                                        updated[lastIdx] = { ...updated[lastIdx], content: errorMessage };
                                    }
                                    return updated;
                                });
                                done = true;
                                break;
                            }

                            // 正常 content chunk
                            if (payload.content) {
                                fullAssistantText += payload.content;
                                const nextText = fullAssistantText; // 捕获闭包变量
                                setMessages(prev => {
                                    const updated = [...prev];
                                    const lastIdx = updated.length - 1;
                                    if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                                        updated[lastIdx] = { ...updated[lastIdx], content: nextText };
                                    }
                                    return updated;
                                });
                            }
                        } catch {
                            continue;
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: "> ⚠️ **系统提示**：网络请求异常，请稍后重试" }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        input,
        setInput,
        isLoading,
        containerRef,
        showQuickQuestions,
        scrollToBottom,
        handleReset,
        handleSend
    };
}
