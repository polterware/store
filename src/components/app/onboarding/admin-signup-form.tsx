import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthIndicator } from "@/components/app/onboarding/password-strength-indicator";
import { evaluatePasswordStrength } from "@/lib/utils/password-strength";
import {
  signUpWithPassword,
  signInWithPassword,
  bootstrapFirstAdmin,
} from "@/lib/supabase/auth";

interface AdminSignupFormProps {
  onDone: () => void;
  onGoToLogin?: () => void;
}

export function AdminSignupForm({ onDone, onGoToLogin }: AdminSignupFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [adminExists, setAdminExists] = useState(false);

  const strength = evaluatePasswordStrength(password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setAdminExists(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (strength.strength === "weak") {
      setError("Password is too weak. Use at least 8 characters with uppercase, lowercase, digits, and special characters.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Sign up (creates user in auth.users)
      try {
        await signUpWithPassword(email, password, fullName);
      } catch (signUpErr) {
        const msg = signUpErr instanceof Error ? signUpErr.message : "";
        if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already been registered")) {
          // User exists — will try to sign in after bootstrap
        } else {
          throw signUpErr;
        }
      }

      // 2. Bootstrap admin role (also auto-confirms email)
      const isFirstAdmin = await bootstrapFirstAdmin(email);

      if (!isFirstAdmin) {
        setAdminExists(true);
        return;
      }

      // 3. Sign in (email was confirmed by the RPC, so this should work)
      await signInWithPassword(email, password);

      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create admin account</CardTitle>
        <CardDescription>
          Set up the first administrator for your Ops instance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {adminExists ? (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm">
              An administrator has already been configured for this project.
              Please sign in with the existing admin account.
            </p>
            {onGoToLogin && (
              <Button className="w-full" onClick={onGoToLogin}>
                Go to login
              </Button>
            )}
          </div>
        ) : (
          <>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="admin-full-name">Full name</Label>
                <Input
                  id="admin-full-name"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {password.length > 0 && (
                  <PasswordStrengthIndicator strength={strength.strength} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-confirm-password">Confirm password</Label>
                <Input
                  id="admin-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Create admin account"}
              </Button>

              {error && <p className="text-destructive text-sm">{error}</p>}
            </form>

            {onGoToLogin && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
                  onClick={onGoToLogin}
                >
                  Already have an account? Sign in
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
