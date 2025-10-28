"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Menu, PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useUserSession } from "@/hooks/use-user-session";

type HeaderProps = {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  isMobile: boolean;
};

export function Header({
  onToggleSidebar,
  sidebarOpen,
  isMobile,
}: HeaderProps) {
  const { user, status, isLoading } = useUserSession();
  const loading = status === "loading" || isLoading;
  const showSidebarDocked = !isMobile && sidebarOpen;

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/80",
        showSidebarDocked && "md:left-80",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={cn(
            "inline-flex h-9 w-9 cursor-pointer items-center border-0 justify-center rounded-full  border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
            sidebarOpen ? "bg-slate-100" : "",
          )}
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {isMobile ? (
            <Menu className="h-4 w-4" />
          ) : sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </button>

        <Link
          href="/"
          className="text-md font-bold  text-slate-600 dark:text-slate-200"
        >
          Curt AI
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {loading ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
          </div>
        ) : status === "authenticated" && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-full border border-transparent px-2 py-1 text-left transition hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.image ?? undefined}
                    alt={user.name ?? "User"}
                  />
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase() ??
                      user.email?.[0]?.toUpperCase() ??
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col text-xs leading-tight text-slate-600 sm:flex">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {user.name ?? "User"}
                  </span>
                  <span className="truncate text-slate-500 dark:text-slate-400">
                    {user.email}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">
                {user.name || user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/protected">Protected space</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-red-600"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button
              variant="ghost"
              asChild
              className="hidden sm:inline-flex text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
              <Link href="/signup">Create account</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
