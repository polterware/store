export function SupabaseIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cloud shape — upper arcs only, no bottom mask needed */}
      <path
        d="M90,72 Q90,43 120,43 Q135,20 160,30 Q185,20 200,43 Q230,43 230,72 Z"
        className="fill-muted-foreground/8 stroke-muted-foreground/25"
        strokeWidth="1.5"
      />

      {/* Connection lines */}
      <line x1="130" y1="80" x2="130" y2="110" className="stroke-primary/40" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="160" y1="80" x2="160" y2="110" className="stroke-primary/40" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="190" y1="80" x2="190" y2="110" className="stroke-primary/40" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Database cylinder */}
      <ellipse cx="160" cy="120" rx="50" ry="12" className="fill-primary/15 stroke-primary/40" strokeWidth="1.5" />
      <rect x="110" y="120" width="100" height="40" className="fill-primary/10" />
      <line x1="110" y1="120" x2="110" y2="160" className="stroke-primary/40" strokeWidth="1.5" />
      <line x1="210" y1="120" x2="210" y2="160" className="stroke-primary/40" strokeWidth="1.5" />
      <ellipse cx="160" cy="160" rx="50" ry="12" className="fill-primary/15 stroke-primary/40" strokeWidth="1.5" />

      {/* Data rows inside cylinder */}
      <rect x="125" y="130" width="70" height="4" rx="1" className="fill-primary/25" />
      <rect x="125" y="138" width="55" height="4" rx="1" className="fill-primary/20" />
      <rect x="125" y="146" width="62" height="4" rx="1" className="fill-primary/15" />

      {/* Shield on the right */}
      <path
        d="M250 100 L250 130 Q250 150 270 160 Q290 150 290 130 L290 100 L270 90 Z"
        className="fill-primary/10 stroke-primary/50"
        strokeWidth="1.5"
      />
      <polyline
        points="259,125 267,133 281,117"
        className="stroke-primary/60"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Key icon on the left */}
      <circle cx="50" cy="125" r="12" className="stroke-muted-foreground/30" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="125" r="4" className="fill-muted-foreground/20" />
      <line x1="62" y1="125" x2="80" y2="125" className="stroke-muted-foreground/30" strokeWidth="1.5" />
      <line x1="74" y1="125" x2="74" y2="132" className="stroke-muted-foreground/30" strokeWidth="1.5" />
      <line x1="80" y1="125" x2="80" y2="132" className="stroke-muted-foreground/30" strokeWidth="1.5" />
    </svg>
  );
}
