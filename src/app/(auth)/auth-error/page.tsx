"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const errorCopy: Record<string, string> = {
  OAuthSignin: "We could not connect your Google account. Please try again.",
  OAuthCallback: "We were not able to finish the Google sign in flow.",
  CredentialsSignin: "Incorrect email or password.",
  Verification: "The verification link has expired or is invalid.",
  AccessDenied: "Your account is not allowed to use Curtis Gemini.",
  Default: "Something went wrong while signing you in.",
};

export default function AuthErrorPage() {
  const search = useSearchParams();
  const code = search.get("error") ?? "Default";

  const message = useMemo(() => errorCopy[code] ?? errorCopy.Default, [code]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(248,113,113,0.12),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_0%_0%,rgba(248,113,113,0.14),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.16),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(251,191,36,0.16),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_110%,rgba(251,191,36,0.2),transparent_60%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl backdrop-blur dark:border-white/10 dark:bg-white/10">
            <div className="flex flex-col gap-8 p-12 text-foreground dark:text-slate-50">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:bg-white/10 dark:text-slate-200">
                <AlertTriangle className="h-4 w-4 text-amber-400 dark:text-amber-300" />
                Authentication error
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white">
                  Something did not go as planned.
                </h1>
                <p className="text-sm text-muted-foreground dark:text-slate-100/80">
                  {message}
                </p>
                {code !== "Default" && (
                  <p className="text-xs text-muted-foreground dark:text-slate-200/70">
                    Error code:{" "}
                    <span className="font-mono text-foreground dark:text-slate-100">
                      {code}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-11 flex-1 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  <Link href="/signin">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Try again
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-11 flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/40 dark:text-slate-50 dark:hover:border-white dark:hover:bg-white/10"
                >
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
