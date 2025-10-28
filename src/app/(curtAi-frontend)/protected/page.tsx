"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUserSession } from "@/hooks/use-user-session";

export default function ProtectedPage() {
  const { user, status } = useUserSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: "/protected" }).catch(() => undefined);
    }
  }, [status]);

  if (status === "loading") {
    return <div className="p-4">Checking session...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-4">
        <Card className="max-w-xl p-6">
          <h1 className="mb-2 text-xl font-semibold">Protected</h1>
          <p className="mb-4 text-sm text-muted-foreground">
            You must be signed in to view this page.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="max-w-2xl p-6">
        <h1 className="mb-2 text-xl font-semibold">Welcome!</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re signed in as <b>{user?.email}</b>.
        </p>
        <div className="mt-4 text-sm">
          This is a protected page. Add your private features here (usage dashboard,
          conversations, billing, etc.).
        </div>
      </Card>
    </div>
  );
}
