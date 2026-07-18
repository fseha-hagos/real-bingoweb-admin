import { createAuthClient } from "better-auth/react";
import { adminClient, phoneNumberClient, usernameClient } from "better-auth/client/plugins";

/**
 * Auth goes through same-origin `/api/auth/*` (Next.js proxy → backend Better Auth).
 * Do NOT point baseURL at `/admin` — that path is the REST admin API only.
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3002",
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [adminClient(), phoneNumberClient(), usernameClient()],
});

export const signIn = authClient.signIn;
export const useSession = authClient.useSession;
export const signOut = authClient.signOut;
