"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, UserPlus } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordMismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    if (passwordMismatch) {
      setFormError("Passwords need to match.");
      return;
    }

    if (!accepted) {
      setFormError("Please accept the terms to continue.");
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setFormError(data?.error ?? "We could not create your account.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Account created! Redirecting to sign in...");
      setLoading(false);
      router.push("/signin?registered=1");
    } catch (error) {
      console.error("Register error", error);
      setFormError("We could not create your account. Please try again later.");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(192,132,252,0.18),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.12),transparent_50%)] dark:bg-[radial-gradient(circle_at_0%_0%,rgba(192,132,252,0.22),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(59,130,246,0.22),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_110%,rgba(59,130,246,0.4),transparent_60%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl">
          <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-xl backdrop-blur lg:grid-cols-2">
            <div className="flex flex-col justify-between gap-12 border-b border-border/60 p-10 lg:border-b-0 lg:border-r dark:border-slate-800/50">
              <div className="space-y-6 text-foreground">
                <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Curtis Gemini
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Create your Curtis Gemini account.
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Save your conversations, keep context across projects, and collaborate with an assistant that learns your style.
                  </p>
                </div>
              </div>
              <div className="hidden text-sm text-muted-foreground lg:block">
                <p className="font-semibold text-foreground">What you get:</p>
                <ul className="mt-3 space-y-2">
                  <li>- Unlimited chat history synced across devices.</li>
                  <li>- Personal prompt suggestions based on your goals.</li>
                  <li>- Team sharing tools coming soon.</li>
                </ul>
              </div>
            </div>

            <div className="bg-card p-8 dark:bg-transparent">
              <Card className="border-0 bg-transparent shadow-none">
                <div className="space-y-6">
                  <div className="space-y-1 text-left">
                    <h2 className="text-xl font-semibold text-foreground">
                      Create an account
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Share a few details so we can personalize your workspace.
                    </p>
                  </div>

                  {formError && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                      {formError}
                    </div>
                  )}

                  {successMessage && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                      {successMessage}
                    </div>
                  )}

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        Full name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Alex Martin"
                        disabled={loading}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        Email address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        disabled={loading}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="At least 8 characters"
                        disabled={loading}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="confirm-password"
                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        Confirm password
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        placeholder="Re enter your password"
                        disabled={loading}
                        className="h-11"
                      />
                      {passwordMismatch && (
                        <p className="text-xs text-red-600">
                          Passwords do not match.
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-3 rounded-lg bg-slate-50/80 p-3 dark:bg-slate-900/60">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={accepted}
                        onChange={(event) => setAccepted(event.target.checked)}
                        disabled={loading}
                        className="mt-1 h-4 w-4 rounded border border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-400"
                      />
                      <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </label>
                    </div>


                    <Button
                      type="submit"
                      className="h-11 w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create account
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
                      <Separator className="flex-1" />
                      <span>Already joined?</span>
                      <Separator className="flex-1" />
                    </div>
                    <Button
                      variant="outline"
                      className="h-11 w-full border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={() => router.push("/signin")}
                      disabled={loading}
                    >
                      Sign in instead
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
