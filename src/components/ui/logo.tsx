import Link from "next/link";

interface LogoProps {
  className?: string;
  isDark?: boolean;
  href?: string | null;
  iconSize?: number;
}

export function Logo({
  className = "text-[1.02rem]",
  isDark = false,
  href = "/",
  iconSize = 34,
}: LogoProps) {
  const content = (
    <>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        className="shrink-0"
      >
        <rect width="100" height="100" rx="20" fill="#12213A" />
        <g transform="translate(4,4) scale(0.8)">
          <g fill="none" stroke="#F5F6F3" strokeWidth="3.5" strokeLinecap="round">
            <path d="M60,8 A52,52 0 0,1 108,44" />
            <path d="M112,58 A52,52 0 0,1 100,98" />
            <path d="M88,108 A52,52 0 0,1 46,111" />
            <path d="M20,96 A52,52 0 0,1 10,56" />
            <path d="M16,42 A52,52 0 0,1 44,12" />
          </g>
          <rect
            x="30"
            y="34"
            width="42"
            height="42"
            rx="5"
            fill="#12213A"
            stroke="#F5F6F3"
            strokeWidth="3.5"
          />
          <rect x="56" y="58" width="36" height="36" rx="5" fill="#E8A33D" />
          <rect x="66" y="52" width="16" height="8" rx="2" fill="#E8A33D" />
          <path
            d="M62,74 L70,82 L84,64"
            fill="none"
            stroke="#12213A"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <span className="flex flex-col leading-[1.15] text-left">
        <span className={isDark ? "text-paper" : "text-graphite"}>
          EnergyGurus<span className="text-amber">.Online</span>
        </span>
        <span className="font-ibm-plex-mono font-medium text-[0.56rem] tracking-[0.08em] text-slate-custom uppercase">
          Authenticity Guaranteed
        </span>
      </span>
    </>
  );

  const baseClassName = `font-space-grotesk font-bold flex items-center gap-[10px] ${className}`;

  if (href === null) {
    return <div className={baseClassName}>{content}</div>;
  }

  return (
    <Link href={href} className={baseClassName}>
      {content}
    </Link>
  );
}
