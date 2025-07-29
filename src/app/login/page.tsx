"use client";

import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";
import { IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailSignIn = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      alert("✅ Check your email to confirm your account!");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-5xl font-bold">Welcome back</h1>
      <p className="text-xl mt-4">Sign in to your BuildLedger account.</p>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 w-full max-w-sm space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@contractor.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 form-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 form-input"
        />
        <Button onClick={handleEmailSignIn} disabled={loading} fullWidth>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        <Button onClick={handleSignUp} variant="outline" disabled={loading} fullWidth>
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </div>

      <div className="my-6">or</div>

      <Button onClick={handleGoogleSignIn} className="mt-2">
        <IconBrandGoogle />
        Sign In with Google
      </Button>

      <p className="mt-4">
        Don't have an account?{' '}


const SignIn = () => {
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-5xl font-bold">Welcome back</h1>
      <p className="text-xl mt-4">
        Sign in to your BuildLedger account.
      </p>
      <Button onClick={handleSignIn} className="mt-8">
        <IconBrandGoogle />
        Sign In with Google
      </Button>
      <p className="mt-4">
        Don't have an account?{" "}
main
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignIn;