export function GuardianLogo({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield shape */}
      <path
        d="M50 5 L90 20 L90 50 C90 75 70 92 50 97 C30 92 10 75 10 50 L10 20 Z"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {/* Inner shield */}
      <path
        d="M50 15 L80 27 L80 50 C80 70 65 83 50 87 C35 83 20 70 20 50 L20 27 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {/* Human figure - head */}
      <circle cx="50" cy="35" r="6" fill="currentColor" />
      {/* Human figure - body */}
      <path
        d="M50 41 L50 60"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Human figure - arms */}
      <path
        d="M38 48 L50 44 L62 48"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Human figure - legs */}
      <path
        d="M50 60 L40 75"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M50 60 L60 75"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Checkmark */}
      <path
        d="M60 55 L67 62 L78 45"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}
