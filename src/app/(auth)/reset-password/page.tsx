"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailQuestion } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(circle_at_85%_10%,rgba(196,181,253,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_85%_10%,rgba(196,181,253,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(59,130,246,0.18),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_110%,rgba(59,130,246,0.28),transparent_60%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
        <Card className="w-full max-w-lg border border-border bg-card p-10 text-foreground shadow-2xl backdrop-blur dark:border-white/20 dark:bg-white/10 dark:text-slate-50">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:bg-white/10 dark:text-slate-200">
            <MailQuestion className="h-4 w-4" />
            Password reset
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white">
            Need to reset your password?
          </h1>
          <p className="mt-3 text-sm text-muted-foreground dark:text-slate-100/80">
            Email-based recovery is coming soon. For now, reach out to Curtis support and we will help you regain access to your account.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 flex-1 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
              <a href="mailto:support@curtis.ai?subject=Password%20reset%20request">Contact support</a>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-11 flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/40 dark:text-slate-50 dark:hover:border-white dark:hover:bg-white/10"
            >
              <Link href="/signin">Back to sign in</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
