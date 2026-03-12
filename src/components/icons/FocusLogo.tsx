export function FocusLogo({ className = "h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crosshair/focus icon */}
      <circle cx="25" cy="25" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="25" cy="25" r="4" fill="currentColor" />
      <line x1="25" y1="8" x2="25" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="36" x2="25" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="25" x2="14" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="25" x2="42" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Text: FOCUS */}
      <text x="55" y="32" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="24" fill="currentColor" letterSpacing="3">
        FOCUS
      </text>
    </svg>
  );
}
