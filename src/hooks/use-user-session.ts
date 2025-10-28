"use client";

import { useSession } from "next-auth/react";

export function useUserSession() {
  const { data, status, update } = useSession();

  const user = data?.user ?? null;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isUnauthenticated = status === "unauthenticated";

  return {
    user,
    status,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    update,
  };
}
