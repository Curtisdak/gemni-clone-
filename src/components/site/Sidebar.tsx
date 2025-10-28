"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Plus,
  MessageSquare,
  LogOut,
  Sparkles,
  X,
  MoreHorizontal,
  Pencil,
  Trash,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useConversations } from "@/hooks/use-conversations";
import { useUserSession } from "@/hooks/use-user-session";
import { cn } from "@/lib/utils";

function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 1000 * 60 * 60 * 24;

  if (diff < oneDay) return "Today";
  if (diff < oneDay * 2) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

type SidebarProps = {
  open: boolean;
  isMobile: boolean;
  onClose: () => void;
};

export function Sidebar({ open, isMobile, onClose }: SidebarProps) {
  const router = useRouter();
  const search = useSearchParams();
  const activeConversationId = search.get("c");
  const { user: sessionUser, status } = useUserSession();

  const {
    conversations,
    loading,
    error,
    refresh,
    createConversation,
    renameConversation,
    deleteConversation,
  } = useConversations();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingError, setEditingError] = useState<string | null>(null);
  const [globalActionError, setGlobalActionError] = useState<string | null>(
    null,
  );
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  function handleConversationSelect(id: string) {
    router.push(`/chat?c=${id}`);
    if (isMobile) onClose();
  }

  async function handleNewChat() {
    if (status !== "authenticated") {
      router.push("/signin");
      return;
    }

    try {
      const conversation = await createConversation();
      handleConversationSelect(conversation.id);
    } catch (err) {
      console.error("Failed to create conversation", err);
      await refresh();
      setGlobalActionError(
        err instanceof Error
          ? err.message
          : "Unable to create a new conversation.",
      );
    }
  }

  function startRename(id: string, title: string) {
    setEditingId(id);
    setEditingValue(title);
    setEditingError(null);
    setGlobalActionError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingValue("");
    setEditingError(null);
  }

  async function submitRename(
    event: React.FormEvent<HTMLFormElement>,
    id: string,
  ) {
    event.preventDefault();
    const value = editingValue.trim();
    if (!value) {
      setEditingError("Title is required.");
      return;
    }

    setActionLoadingId(id);
    setEditingError(null);
    try {
      await renameConversation(id, value);
      cancelEditing();
    } catch (err) {
      setEditingError(
        err instanceof Error
          ? err.message
          : "Unable to rename the conversation.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDeleteConversation(id: string) {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this conversation? This cannot be undone.")
    ) {
      return;
    }

    setActionLoadingId(id);
    setGlobalActionError(null);
    try {
      await deleteConversation(id);
      if (activeConversationId === id) {
        router.replace("/chat");
      }
      if (isMobile) onClose();
    } catch (err) {
      setGlobalActionError(
        err instanceof Error
          ? err.message
          : "Unable to delete the conversation.",
      );
    } finally {
      setActionLoadingId(null);
      if (editingId === id) {
        cancelEditing();
      }
    }
  }

  const conversationsList = conversations.map((conversation) => {
    const active = conversation.id === activeConversationId;
    const isEditing = editingId === conversation.id;
    const isLoading = actionLoadingId === conversation.id;
    const lastLine =
      conversation.lastMessage?.slice(0, 80) ??
      "No messages yet. Ask me anything.";
    const renameFormId = `rename-${conversation.id}`;

    return (
      <div
        key={conversation.id}
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-transparent bg-white/70 p-4 shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:ring-slate-200 dark:bg-slate-900/70 dark:hover:ring-slate-700",
          active
            ? "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white ring-2 ring-sky-500/70 shadow-lg dark:from-slate-800 dark:via-slate-800 dark:to-slate-900"
            : "text-slate-700 dark:text-slate-200",
        )}
      >
        {isEditing ? (
          <form
            id={renameFormId}
            className="space-y-3"
            onSubmit={(event) => submitRename(event, conversation.id)}
          >
            <Input
              value={editingValue}
              onChange={(event) => setEditingValue(event.target.value)}
              placeholder="Conversation title"
              autoFocus
              disabled={isLoading}
              className={cn(
                "h-9 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100",
                active && "ring-1 ring-slate-300 dark:ring-slate-600",
              )}
            />
            {editingError && (
              <p className="text-xs text-red-500">{editingError}</p>
            )}
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" size="sm" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm rename</AlertDialogTitle>
                    <AlertDialogDescription>
                      Save changes to &quot;{conversation.title}&quot;?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                      Go back
                    </AlertDialogCancel>
                    <AlertDialogAction
                      type="submit"
                      form={renameFormId}
                      disabled={isLoading}
                    >
                      Save conversation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelEditing}
                disabled={isLoading}
              >
                <X className="mr-2 h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleConversationSelect(conversation.id)}
              className="flex w-full flex-col gap-1 text-left "
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wide ">
                <span
                  className={cn(
                    "font-medium",
                    active ? "text-white/80" : "text-slate-400",
                  )}
                >
                  {formatRelativeDate(conversation.updatedAt)}
                </span>
                <MessageSquare
                  className={cn(
                    "h-3.5 w-3.5",
                    active ? "text-white/70" : "text-slate-400",
                  )}
                />
              </div>
              <div
                className={cn(
                  "line-clamp-1 text-sm font-semibold",
                  active ? "text-white" : "text-slate-800",
                )}
              >
                {conversation.title}
              </div>
              <p
                className={cn(
                  "line-clamp-2 text-xs",
                  active ? "text-white/80" : "text-slate-500",
                )}
              >
                {lastLine}
              </p>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(event) => event.stopPropagation()}
                  className={cn(
                    "absolute right-2 top-2 cursor-pointer rounded-full p-1 text-slate-400 transition hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                    isMobile
                      ? "inline-flex"
                      : "hidden group-hover:inline-flex data-[state=open]:inline-flex",
                  )}
                  aria-label="Conversation actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(event) => event.stopPropagation()}
                className="z-50"
              >
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    startRename(conversation.id, conversation.title);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onSelect={(event) => event.preventDefault()}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete conversation</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Delete &quot;{conversation.title}&quot; and all of its messages?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => handleDeleteConversation(conversation.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {isLoading && !isEditing && (
          <div className="absolute right-2 top-2 inline-flex rounded-full bg-white/80 p-1 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
    );
  });

  const body = (
    <div className="flex h-full flex-col gap-2 py-0">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-2 shadow-lg shadow-slate-900/5 backdrop-blur transition-colors dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-black/20">
        <div className="pointer-events-none absolute bg-orange-600 inset-0 bg-gradient-to-br from-sky-100/70 via-transparent to-purple-100/60 dark:from-slate-800/70 dark:via-slate-900/40 dark:to-indigo-900/50" />
        <div className="relative flex items-start gap-4 ">
          <div className="flex h-11 w-11 items-center  justify-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-3 ">
            <div>
              <p className="text-md font-bold text-slate-900 dark:text-slate-100">
                Curt AI
              </p>
              <p className="text-xs text-white dark:text-slate-400 bg-black/50 p-2 rounded-lg ">
                Pick up where you left off or launch something new.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleNewChat}
                className="h-11 flex-1 min-w-[140px] justify-center gap-2 rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                <Plus className="h-4 w-4" />
                New chat
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void refresh();
                }}
                className="h-11 rounded-2xl border-slate-200/70 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
              >
                Refresh
              </Button>
            </div>
          </div>
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-0 top-0 rounded-full p-2 text-slate-500 transition hover:bg-white/70 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {globalActionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-xs text-red-600 shadow-sm dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          {globalActionError}
        </div>
      )}

      <div className="flex flex-1  flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 p-4 shadow-inner dark:border-slate-700/60 dark:bg-slate-950/40">
        <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
          <span>Recent chats</span>
          <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
            {conversations.length} saved
          </span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <ScrollArea className="h-full  pr-2">
            <div className="flex flex-col gap-2">
              {loading && (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
                    >
                      <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="mt-3 h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="mt-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  ))}
                </div>
              )}

              {!loading && conversationsList.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/70 p-6 text-center text-xs text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400">
                  {status === "authenticated"
                    ? "No conversations yet. Start a new one."
                    : "Sign in to access your saved conversations."}
                </div>
              )}

              {!loading && conversationsList}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition-colors dark:border-slate-700/60 dark:bg-slate-900/70">
        {status === "loading" ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ) : status === "authenticated" && sessionUser ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={sessionUser.image ?? undefined} alt={sessionUser.name ?? "User"} />
              <AvatarFallback>
                {sessionUser.name?.[0]?.toUpperCase() ??
                  sessionUser.email?.[0]?.toUpperCase() ??
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {sessionUser.name ?? "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sessionUser.email}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will need to sign in again to access your conversations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay signed in</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => signOut({ callbackUrl: "/signin" })}
                  >
                    Log out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              You&apos;re signed out
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access saved chats and sync across devices.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild size="sm" className="w-full">
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/signup">Create account</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div
          className={cn(
            "fixed inset-0 z-[70] bg-slate-950/50 transition-opacity duration-200 md:hidden",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={onClose}
          aria-hidden="true"
        />
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[80] w-80 max-w-full overflow-hidden border-r border-slate-200 bg-slate-50/95 px-4 py-6 shadow-2xl backdrop-blur-xl transition-transform duration-200 dark:border-slate-700 dark:bg-slate-900/95 md:hidden",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {body}
        </aside>
      </>
    );
  }

  if (!open) {
    return null;
  }

  return (
    <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:z-40 md:h-screen md:w-80 md:flex-col md:overflow-y-auto border-r border-slate-200 bg-slate-50/90 px-4 pb-8 pt-6 shadow-xl shadow-slate-900/10 backdrop-blur-lg transition-colors dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/30 md:pt-20">
      {body}
    </aside>
  );
}
