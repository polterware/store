import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  refreshResolvedSupabaseConfig,
  type RuntimeSupabaseConfig,
} from "@/lib/supabase/runtime-config";
import { getSession, signInWithPassword } from "@/lib/supabase/auth";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const config = await refreshResolvedSupabaseConfig();
    if (!config) {
      throw redirect({ to: "/onboarding" });
    }

    const session = await getSession();
    if (session) {
      throw redirect({ to: "/tables/$table", params: { table: "products" } });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [config, setConfig] = useState<RuntimeSupabaseConfig | null>(null);

  useEffect(() => {
    let ignore = false;

    void refreshResolvedSupabaseConfig().then((resolvedConfig) => {
      if (ignore) {
        return;
      }

      setConfig(resolvedConfig);
      setConfigLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithPassword(email, password);
      await navigate({ to: "/tables/$table", params: { table: "products" } });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in",
      );
    } finally {
      setLoading(false);
    }
  }

  if (configLoading) {
    return (
      <section className="mx-auto mt-20 w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Loading connection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Checking runtime configuration and bootstrap payload.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-20 w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sign in to Ops</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/6 mb-4 rounded-md border border-primary/15 p-3 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">Connected project</p>
                <p className="text-muted-foreground break-all">{config?.url}</p>
                <p className="text-muted-foreground">
                  Source: {config?.source === "env" ? "Environment fallback" : "Runtime config"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground -mr-1 -mt-1 shrink-0 text-xs"
                onClick={() => void navigate({ to: "/onboarding", search: { reconfigure: true } })}
              >
                Change
              </Button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className="text-destructive text-sm">{error}</p> : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
