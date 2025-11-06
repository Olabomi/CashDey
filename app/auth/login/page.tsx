"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      // Wait a moment for cookies to be set, then redirect
      await new Promise((resolve) => setTimeout(resolve, 100));
      window.location.href = "/dashboard";
    }
  };

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-naija-green/5 via-light-bg to-eko-teal/5 p-4">
      <Card className="w-full max-w-md shadow-elevated border-gray-200/50 animate-scale-in">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-naija-green to-eko-teal rounded-2xl flex items-center justify-center shadow-glow">
              <span className="text-white text-2xl font-bold">₦</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center tracking-tight text-text-dark">
            Welcome to CashDey
          </CardTitle>
          <CardDescription className="text-center text-text-muted font-medium">
            Your Nigerian Financial Co-pilot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-red-50 border border-red-200 p-3 rounded-xl font-medium">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-text-muted font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthLogin("google")}
              disabled={loading}
              className="font-semibold"
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthLogin("apple")}
              disabled={loading}
              className="font-semibold"
            >
              Apple
            </Button>
          </div>

          <div className="text-center text-sm pt-2">
            <span className="text-text-muted">Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="text-naija-green font-bold hover:text-eko-teal transition-colors">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

