"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, EyeOff, LogIn, Mail } from "lucide-react";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Incorrect email or password.",
  OAuthSignin: "We could not complete the Google sign in.",
  Default: "We were not able to sign you in. Please try again.",
};

export default function SignInPage() {
  const router = useRouter();
  const search = useSearchParams();

  const callbackUrl = search.get("callbackUrl") || "/chat";
  const oauthError = search.get("error") ?? undefined;
  const registered = search.get("registered") ?? undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const oauthMessage = useMemo(() => {
    if (!oauthError) return null;
    return errorMessages[oauthError] ?? errorMessages.Default;
  }, [oauthError]);

  const registrationMessage = useMemo(() => {
    if (!registered) return null;
    return "Your account was created successfully. Sign in to start chatting.";
  }, [registered]);

  async function handleCredentialsSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setFormError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setFormError(errorMessages[result.error] ?? errorMessages.Default);
      setLoading(false);
      return;
    }

    const destination = result?.url ?? callbackUrl;
    setLoading(false);
    router.push(destination);
    router.refresh();
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.12),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(59,130,246,0.18),transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_110%,rgba(59,130,246,0.3),transparent_55%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl">
          <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-xl backdrop-blur lg:grid-cols-2">
            <div className="flex flex-col justify-between gap-12 border-b border-border/60 p-10 lg:border-b-0 lg:border-r dark:border-slate-800/50">
              <div className="space-y-6 text-foreground">
                <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Curtis Gemini
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Welcome back.
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sign in to pick up your conversations and keep creating with Curtis Gemini.
                  </p>
                </div>
              </div>
              <div className="hidden gap-3 text-sm text-muted-foreground sm:flex">
                <span className="font-medium text-foreground">What's new:</span>
                <ul className="space-y-1">
                  <li>- Cross device sync for all of your threads</li>
                  <li>- Smarter prompt suggestions tailored to you</li>
                  <li>- Refreshed history view with inline search</li>
                </ul>
              </div>
            </div>

            <div className="bg-card p-8 dark:bg-transparent">
              <Card className="border-0 bg-transparent shadow-none">
                <div className="space-y-6">
                  <div className="space-y-1 text-left">
                    <h2 className="text-xl font-semibold text-foreground">
                      Sign in
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Use your email and password or continue with Google.
                    </p>
                  </div>

                  {(oauthMessage || formError) && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                      {formError ?? oauthMessage}
                    </div>
                  )}

                  {registrationMessage && !formError && !oauthMessage && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                      {registrationMessage}
                    </div>
                  )}

                  <form className="space-y-5" onSubmit={handleCredentialsSignIn}>
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
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                          Password
                        </label>
                        <Link
                          href="/reset-password"
                          className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Your password"
                          disabled={loading}
                          className="h-11 pr-11"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="h-11 w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          Sign in
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
                      <Separator className="flex-1" />
                      <span>Or continue with</span>
                      <Separator className="flex-1" />
                    </div>
                    <Button
                      variant="outline"
                      className="h-11 w-full border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={handleGoogle}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      Continue with Google
                    </Button>
                  </div>

                  <p className="text-center text-sm text-slate-500 dark:text-slate-300">
                    New to Curtis Gemini?{" "}
                    <Link
                      href="/signup"
                      className="font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
