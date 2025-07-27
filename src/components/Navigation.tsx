"use client";

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";
import { IconBrandGoogle } from "@tabler/icons-react";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Navigation = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="p-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">BuildLedger</span>
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/pricing">Pricing</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/about">About</Link>
      </nav>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
            <Button onClick={handleSignOut} variant="secondary">
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="secondary">Sign In</Button>
            </Link>
            <Button onClick={handleSignIn}>
              <IconBrandGoogle />
              Sign Up with Google
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}; 