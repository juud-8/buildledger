"use client";

import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";
import { IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";

const SignUp = () => {
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-5xl font-bold">Create an account</h1>
      <p className="text-xl mt-4">
        Get started with BuildLedger for free.
      </p>
      <Button onClick={handleSignIn} className="mt-8">
        <IconBrandGoogle />
        Sign Up with Google
      </Button>
      <p className="mt-4">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUp; 