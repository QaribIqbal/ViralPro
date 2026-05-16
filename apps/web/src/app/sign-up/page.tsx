"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailSignUp = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (signUpError) throw signUpError;
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
      const message = err instanceof Error ? err.message : "Google sign up failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form className="vp-glass-panel w-full max-w-md rounded-3xl p-7 shadow-2xl" onSubmit={(e) => {
        e.preventDefault();
        void handleEmailSignUp();
      }}>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Create ViralPro account</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Start creating content with your team.</p>
        <div className="mt-5 space-y-3">
          <label className="text-sm font-medium text-[var(--text)]" htmlFor="name">Full name</label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" />
          <label className="text-sm font-medium text-[var(--text)]" htmlFor="email">Email</label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="text-sm font-medium text-[var(--text)]" htmlFor="password">Password</label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account..." : "Sign up"}</Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => void handleGoogleSignUp()} disabled={loading}>Continue with Google</Button>
          <p className="text-sm text-[var(--text-muted)]">Already have an account? <Link href="/sign-in" className="underline">Sign in</Link></p>
        </div>
      </form>
    </main>
  );
}
