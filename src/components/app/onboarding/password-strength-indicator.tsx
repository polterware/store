import type { PasswordStrength } from "@/lib/utils/password-strength";

const config: Record<PasswordStrength, { label: string; segments: number; color: string }> = {
  weak: { label: "Weak", segments: 1, color: "bg-destructive" },
  medium: { label: "Medium", segments: 2, color: "bg-amber-500" },
  strong: { label: "Strong", segments: 3, color: "bg-green-500" },
};

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
}

export function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  const { label, segments, color } = config[strength];

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < segments ? color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}
