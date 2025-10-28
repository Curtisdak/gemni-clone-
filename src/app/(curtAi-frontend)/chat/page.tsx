"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserSession } from "@/hooks/use-user-session";
import { ArrowDown, Loader2, Mic, Paperclip, Send, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { status } = useUserSession();

  const conversationIdFromUrl = search.get("c");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    conversationIdFromUrl,
  );
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const isUserNearBottomRef = useRef(true);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [composerHeight, setComposerHeight] = useState(180);

  const quickPrompts = useMemo(
    () => [
      "Summarize the latest AI news in two paragraphs.",
      "Give me a five-day meal plan that is high in protein.",
      "Explain React server components like I'm new to web dev.",
      "Brainstorm a catchy tagline for a productivity app.",
    ],
    [],
  );

  useEffect(() => {
    const node = composerRef.current;
    if (!node) return;

    const updateHeight = () => setComposerHeight(node.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setComposerHeight(entry.contentRect.height);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActiveConversationId(conversationIdFromUrl);
  }, [conversationIdFromUrl]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.cancel().catch(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.cancel().catch(() => undefined);
      streamRef.current = null;
    }

    if (!activeConversationId) {
      setMessages([]);
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);
    setLoading(false);
    setErrorMessage(null);

    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/conversations/${activeConversationId}/messages`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 404) {
            if (!cancelled) {
              setMessages([]);
              setErrorMessage("Conversation not found.");
            }
            return;
          }
          if (response.status === 401) {
            if (!cancelled) {
              setMessages([]);
              setErrorMessage("Please sign in to view conversations.");
            }
            return;
          }
          throw new Error("Failed to load conversation history.");
        }

        const data = (await response.json()) as {
          messages: Array<{ role: string; content: string }>;
        };

        if (!cancelled) {
          setMessages(
            (data.messages ?? []).map((message) => ({
              role: message.role === "assistant" ? "assistant" : "user",
              content: message.content,
            })),
          );
          requestAnimationFrame(() => scrollToBottom("auto"));
        }
      } catch (error) {
        console.error("Unable to load conversation history", error);
        if (!cancelled) {
          setMessages([]);
          setErrorMessage("We could not load this conversation. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [activeConversationId]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 96;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const nearBottom = distanceFromBottom <= threshold;
      isUserNearBottomRef.current = nearBottom;
      setShowScrollToBottom(!nearBottom);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, [messages.length, historyLoading]);

  useEffect(() => {
    if (isUserNearBottomRef.current) {
      scrollToBottom("smooth");
    }
  }, [messages, loading]);

  const ensureConversation = useCallback(async () => {
    if (activeConversationId) {
      return activeConversationId;
    }

    if (status !== "authenticated") {
      router.push("/signin");
      throw new Error("Please sign in to start a conversation.");
    }

    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Unable to start a new conversation.");
    }

    const data = (await response.json()) as { id: string };
    setActiveConversationId(data.id);
    setMessages([]);
    setHistoryLoading(false);
    router.replace(`/chat?c=${data.id}`);
    return data.id;
  }, [activeConversationId, router, status]);

  const send = useCallback(
    async (promptOverride?: string) => {
      const prompt = (promptOverride ?? input).trim();
      if (!prompt || loading) return;

      if (streamRef.current) {
        await streamRef.current.cancel().catch(() => undefined);
        streamRef.current = null;
      }

      setErrorMessage(null);

      let conversationId: string;
      try {
        conversationId = await ensureConversation();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to start a conversation.";
        setErrorMessage(message);
        return;
      }

      const userMsg: Msg = { role: "user", content: prompt };
      const history = [...messages, userMsg];
      setMessages([...history, { role: "assistant", content: "" }]);
      if (!promptOverride) {
        setInput("");
      } else {
        setInput(promptOverride);
        setTimeout(() => setInput(""), 0);
      }

      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({
            conversationId,
            prompt,
            history,
          }),
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok || !res.body) {
          throw new Error("Unable to reach assistant.");
        }

        const reader = res.body.getReader();
        streamRef.current = reader;
        const decoder = new TextDecoder();
        let acc = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: acc };
            return copy;
          });
        }
      } catch (error) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "Something went wrong while generating a response. Please try again.",
          };
          return copy;
        });
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The assistant could not complete your request.",
        );
      } finally {
        streamRef.current = null;
        setLoading(false);
        scrollToBottom("smooth");
      }
    },
    [ensureConversation, input, loading, messages],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send();
  };

  const handleQuickStart = (prompt: string) => {
    setInput(prompt);
    void send(prompt);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  const scrollPadding = composerHeight + 120;

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_#0f172a_0%,_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_20%_80%,_#f5d0fe_0%,_transparent_60%)] dark:bg-[radial-gradient(circle_at_20%_80%,_#1e1b4b_0%,_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-background via-background/90 to-transparent" />

      <div className="flex-1 overflow-hidden px-3 sm:px-6">
        <div
          ref={viewportRef}
          className="mx-auto flex h-full max-w-3xl flex-col overflow-y-auto pb-10 pt-12"
          style={{ paddingBottom: scrollPadding }}
        >
          {errorMessage && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-600 shadow-sm dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
              {errorMessage}
            </div>
          )}

          {historyLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-3xl border border-border/60 bg-card/70 p-4 shadow-sm dark:border-slate-800"
                >
                  <div className="h-9 w-9 rounded-full bg-muted" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3.5 w-1/3 rounded-full bg-muted" />
                    <div className="h-3.5 w-3/4 rounded-full bg-muted" />
                    <div className="h-3.5 w-2/3 rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col items-center justify-center gap-8 text-center"
            >
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Curtis Gemini
                </span>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Ask anything, explore bold ideas, get tailored help.
                </h1>
                <p className="mx-auto max-w-xl text-sm text-muted-foreground">
                  Start with a suggestion below or describe what you need. Your conversation
                  history appears here after you send a message.
                </p>
              </div>
              <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleQuickStart(prompt)}
                    className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3 text-left text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-border hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <MessageBubble
                  key={`${message.role}-${index}`}
                  role={message.role}
                  loading={loading && index === messages.length - 1 && message.role === "assistant"}
                >
                  {message.content || (loading ? "..." : "")}
                </MessageBubble>
              ))}
            </div>
          )}
        </div>
      </div>

      {showScrollToBottom && (
        <Button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          className="fixed right-6 z-50 rounded-full border border-border/60 bg-card/95 px-4 py-2 text-xs font-semibold text-foreground shadow-xl backdrop-blur transition hover:-translate-y-0.5 hover:bg-card"
          style={{ bottom: composerHeight + 24 }}
        >
          <ArrowDown className="mr-2 h-4 w-4" />
          New responses
        </Button>
      )}

      <div
        className="pointer-events-none fixed bottom-0 right-0 z-40 h-44 bg-gradient-to-t from-background via-background/90 to-transparent"
        style={{ left: "var(--sidebar-width, 0px)" }}
      />

      <div
        className="pointer-events-none fixed bottom-0 right-0 z-50 flex justify-center px-3 pb-4"
        style={{ left: "var(--sidebar-width, 0px)" }}
      >
        <div ref={composerRef} className="pointer-events-auto w-full max-w-3xl">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur"
          >
            <div className="flex items-end gap-3">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-muted/50 text-muted-foreground transition hover:bg-muted"
                title="Attach a file"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <Textarea
                placeholder="Feel free to ask me anything..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="max-h-40 flex-1 resize-none border-none bg-transparent px-0 py-2 text-base leading-relaxed shadow-none focus-visible:ring-0"
                disabled={loading}
              />

              <div className="flex items-center gap-2 pb-1">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-muted/50 text-muted-foreground transition hover:bg-muted"
                  title="Voice input (coming soon)"
                >
                  <Mic className="h-5 w-5" />
                </button>
                <Button
                  type="submit"
                  size="icon"
                  disabled={loading || !input.trim()}
                  className="h-11 w-11 rounded-full"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Press Enter to send</span>
              <span>Shift + Enter for a new line</span>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  children,
  loading,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
  loading?: boolean;
}) {
  const isAssistant = role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex w-full gap-3", isAssistant ? "justify-start" : "justify-end")}
    >
      {isAssistant && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-purple-500 text-xs font-semibold text-white shadow">
          C
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-sm transition",
          isAssistant
            ? "bg-card/90 text-foreground ring-1 ring-border"
            : "bg-primary text-primary-foreground",
        )}
      >
        {children}
        {loading && (
          <span className="ml-1 inline-block animate-pulse text-base leading-none opacity-70">
            ...
          </span>
        )}
      </div>

      {!isAssistant && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          You
        </div>
      )}
    </motion.div>
  );
}
