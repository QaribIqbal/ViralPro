"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toggleTheme } = useTheme();

  const handleEmailSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative flex flex-col justify-center px-8 py-10 sm:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(37,99,235,0.18),transparent_40%),radial-gradient(circle_at_60%_10%,rgba(34,211,238,0.12),transparent_35%)]" />
        <div className="relative max-w-xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <Image
                src="/viralpro-logo.png"
                alt="ViralPro logo"
                width={44}
                height={44}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <span className="text-3xl font-semibold text-[var(--text)]">ViralPro</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight text-[var(--text)] sm:text-6xl">
            Content Engine for
            <br />
            Growth Teams
          </h1>

          <p className="mt-5 max-w-lg text-xl leading-relaxed text-[var(--text-muted)]">
            Generate SEO-focused, conversion-ready content and scale your publishing workflow.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <form
          className="vp-glass-panel w-full max-w-lg rounded-3xl p-8 shadow-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            void handleEmailSignIn();
          }}
        >
          <div className="mb-6 flex justify-end">
            <Button type="button" variant="secondary" onClick={toggleTheme}>
              Toggle Theme
            </Button>
          </div>
          <h2 className="text-center text-4xl font-semibold text-[var(--text)]">Welcome Back</h2>
          <p className="mt-3 text-center text-base text-[var(--text-muted)]">Sign in to continue</p>

          <div className="mt-8 space-y-5">
            <label className="block text-sm font-medium text-[var(--text)]" htmlFor="email">Email</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label className="block text-sm font-medium text-[var(--text)]" htmlFor="password">Password</label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {error ? <p className="text-sm text-rose-500">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Button type="button" variant="secondary" className="w-full" onClick={() => void handleGoogleSignIn()} disabled={loading}>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-[var(--text-muted)]">
              Don&apos;t have an account? <Link href="/sign-up" className="underline">Sign up</Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
