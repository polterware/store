export function WelcomeIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dashboard frame */}
      <rect
        x="40"
        y="20"
        width="240"
        height="160"
        rx="8"
        className="stroke-muted-foreground/40"
        strokeWidth="1.5"
      />

      {/* Top bar */}
      <rect
        x="40"
        y="20"
        width="240"
        height="24"
        rx="8"
        className="fill-muted-foreground/10"
      />
      <rect x="40" y="36" width="240" height="1" className="fill-muted-foreground/20" />
      <circle cx="56" cy="32" r="4" className="fill-primary/50" />
      <circle cx="68" cy="32" r="4" className="fill-muted-foreground/30" />
      <circle cx="80" cy="32" r="4" className="fill-muted-foreground/30" />

      {/* Sidebar */}
      <rect x="40" y="44" width="52" height="136" className="fill-muted-foreground/5" />
      <rect x="92" y="44" width="1" height="136" className="fill-muted-foreground/15" />
      <rect x="50" y="56" width="32" height="6" rx="2" className="fill-primary/40" />
      <rect x="50" y="70" width="28" height="6" rx="2" className="fill-muted-foreground/20" />
      <rect x="50" y="84" width="30" height="6" rx="2" className="fill-muted-foreground/20" />
      <rect x="50" y="98" width="26" height="6" rx="2" className="fill-muted-foreground/20" />

      {/* Chart bars */}
      <rect x="110" y="130" width="20" height="36" rx="3" className="fill-primary/25" />
      <rect x="138" y="110" width="20" height="56" rx="3" className="fill-primary/40" />
      <rect x="166" y="90" width="20" height="76" rx="3" className="fill-primary/55" />
      <rect x="194" y="70" width="20" height="96" rx="3" className="fill-primary/70" />
      <rect x="222" y="56" width="20" height="110" rx="3" className="fill-primary/85" />

      {/* Stat cards */}
      <rect x="110" y="52" width="56" height="28" rx="4" className="fill-muted-foreground/8 stroke-muted-foreground/15" strokeWidth="1" />
      <rect x="118" y="60" width="24" height="5" rx="1.5" className="fill-muted-foreground/25" />
      <rect x="118" y="69" width="16" height="4" rx="1" className="fill-primary/40" />

      <rect x="174" y="52" width="56" height="28" rx="4" className="fill-muted-foreground/8 stroke-muted-foreground/15" strokeWidth="1" />
      <rect x="182" y="60" width="20" height="5" rx="1.5" className="fill-muted-foreground/25" />
      <rect x="182" y="69" width="28" height="4" rx="1" className="fill-primary/40" />
    </svg>
  );
}
