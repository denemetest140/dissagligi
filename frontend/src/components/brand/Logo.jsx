import React from "react";

/**
 * Dentalin Logo
 * Premium medical-tech mark: stylized "D" merged with tooth silhouette + smile arc,
 * navy → turquoise gradient. Inspired by Apple-level health tech brands.
 *
 * Variants:
 *  - <LogoIcon /> for favicon / mobile / loading.
 *  - <Logo />     full horizontal with wordmark.
 */

export function LogoIcon({ size = 40, theme = "light", className = "" }) {
  const id = React.useId();
  const gradId = `dentalin-grad-${id}`;
  const shineId = `dentalin-shine-${id}`;
  const isDark = theme === "dark";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Dentalin logo"
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1F3B" />
          <stop offset="55%" stopColor="#0E4A6B" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>
        <linearGradient id={shineId} x1="20" y1="14" x2="44" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Rounded square base */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill={`url(#${gradId})`}
      />

      {/* Soft inner highlight */}
      <rect x="2" y="2" width="60" height="30" rx="16" fill={`url(#${shineId})`} />

      {/* Tooth silhouette (subtle, behind the D) */}
      <path
        d="M19 22c0-5 4-9 9-9 3 0 5 1.5 7 1.5S39 13 42 13c5 0 9 4 9 9 0 4-2 7-3 11-1 3-1 7-2 11-0.8 3-2.4 5-4 5-1.6 0-2.5-2-3-5l-1-6c-0.4-2-1-3-2-3s-1.6 1-2 3l-1 6c-0.5 3-1.4 5-3 5-1.6 0-3.2-2-4-5-1-4-1-8-2-11-1-4-3-7-3-11Z"
        fill="#FFFFFF"
        fillOpacity="0.10"
      />

      {/* Stylized D + smile arc */}
      {/* Vertical stroke of D */}
      <path
        d="M22 17h8c8 0 14 6.4 14 15s-6 15-14 15h-8V17Z"
        fill="#FFFFFF"
        fillOpacity="0.96"
      />
      {/* Inner negative space of D forming a tooth */}
      <path
        d="M28 23v18h2c4.4 0 8-3.6 8-9s-3.6-9-8-9h-2Z"
        fill={`url(#${gradId})`}
      />

      {/* Smile arc — turquoise accent at the bottom */}
      <path
        d="M18 49c4 4 9 6 14 6s10-2 14-6"
        stroke="#2DD4BF"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Spark dot above for "tech" feel */}
      <circle cx="46" cy="18" r="2.5" fill="#2DD4BF" />
      {isDark && null}
    </svg>
  );
}

export function Logo({ size = 40, theme = "light", className = "", showTagline = true }) {
  const isDark = theme === "dark";
  return (
    <div className={`flex items-center gap-2.5 ${className}`} aria-label="Dentalin">
      <LogoIcon size={size} theme={theme} />
      <div className="leading-none">
        <div
          className={`font-display font-bold tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
          style={{ fontSize: size * 0.5 }}
        >
          Dentalin
        </div>
        {showTagline && (
          <div
            className={`mt-0.5 uppercase tracking-[0.18em] font-semibold ${
              isDark ? "text-cyan-300" : "text-cyan-700"
            }`}
            style={{ fontSize: Math.max(9, size * 0.22) }}
          >
            Ağız ve Diş Sağlığı
          </div>
        )}
      </div>
    </div>
  );
}

export default Logo;
