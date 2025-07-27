"use client";

import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";
import { IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";

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
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignIn;