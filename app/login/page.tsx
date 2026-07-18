"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Lock, User, Loader2 } from "lucide-react";
import { useSessionContext } from "@/contexts/SessionContext";

function normalizeUsername(input: string): string {
  return input.trim().replace(/\D/g, "");
}

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useSessionContext();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const username = normalizeUsername(phoneNumber);
      if (username.length < 9) {
        throw new Error("Enter phone digits only, e.g. 251985596125");
      }

      const { data, error: authError } = await authClient.signIn.username({
        username,
        password,
      });

      if (authError) {
        throw new Error(authError.message || "Login failed");
      }

      // Prefer session payload (includes custom role field)
      const session = await authClient.getSession();
      const user = (session.data?.user || data?.user) as
        | { id: string; role?: string; name?: string; email?: string; phoneNumber?: string }
        | undefined;

      if (!user?.id) {
        throw new Error("Login succeeded but no session was returned. Try again.");
      }

      if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
        await authClient.signOut();
        throw new Error("Access denied: ADMIN or OPERATOR role required.");
      }

      setSession(
        {
          id: user.id,
          name: user.name || "Admin",
          email: user.email || "",
          role: user.role as "ADMIN" | "OPERATOR",
          phoneNumber: user.phoneNumber,
        },
        // Cookie session is authoritative; keep a marker for local UI state
        (data as { token?: string } | null)?.token || "cookie"
      );

      router.replace("/");
    } catch (err: unknown) {
      console.error("Auth error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Winner Bingo Admin</h1>
            <p className="text-sm text-slate-500 mt-1">
              Sign in with your seeded admin phone + password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="username"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="251985596125"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 bg-slate-50 text-slate-900"
                  required
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                Digits only (no +). Same as ADMIN_PHONE from seed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ADMIN_PASSWORD from .env"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 bg-slate-50 text-slate-900"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
