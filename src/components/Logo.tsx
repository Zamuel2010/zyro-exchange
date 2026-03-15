export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="100" height="100" rx="24" fill="url(#zyro_grad)" />
      {/* The Z shape */}
      <path d="M30 35H70L45 65H70" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      {/* The vertical crypto lines */}
      <path d="M45 20V35M55 65V80" stroke="white" strokeWidth="8" strokeLinecap="round" />
      <defs>
        <linearGradient id="zyro_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#991B1B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
