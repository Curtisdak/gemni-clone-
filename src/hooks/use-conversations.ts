"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type ConversationSummary = {
  id: string;
  title: string;
  lastMessage?: string | null;
  updatedAt: string;
};

type ApiResponse = {
  conversations: ConversationSummary[];
};

export function useConversations() {
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/conversations", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to view conversations.");
        }
        throw new Error("Failed to load conversations.");
      }

      const data = (await response.json()) as ApiResponse;
      setItems(data.conversations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const handler = () => {
      void fetchConversations();
    };

    window.addEventListener("conversation:updated", handler);
    return () => window.removeEventListener("conversation:updated", handler);
  }, [fetchConversations]);

  const createConversation = useCallback(async () => {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Unable to create a new conversation.");
    }

    const conversation = (await response.json()) as ConversationSummary;
    setItems((prev) => [conversation, ...prev]);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("conversation:updated"));
    }
    return conversation;
  }, []);

  const renameConversation = useCallback(async (id: string, title: string) => {
    const response = await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please sign in to rename conversations.");
      }
      throw new Error("Unable to rename the conversation.");
    }

    const updated = (await response.json()) as ConversationSummary;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              title: updated.title,
              lastMessage: updated.lastMessage,
              updatedAt: updated.updatedAt,
            }
          : item,
      ),
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("conversation:updated"));
    }

    return updated;
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    const response = await fetch(`/api/conversations/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please sign in to delete conversations.");
      }
      throw new Error("Unable to delete the conversation.");
    }

    setItems((prev) => prev.filter((item) => item.id !== id));

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("conversation:updated"));
    }
  }, []);

  return useMemo(
    () => ({
      conversations: items,
      loading,
      error,
      refresh: fetchConversations,
      createConversation,
      renameConversation,
      deleteConversation,
    }),
    [
      createConversation,
      deleteConversation,
      error,
      fetchConversations,
      items,
      loading,
      renameConversation,
    ],
  );
}
