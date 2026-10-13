import Link from "next/link";

/** The Ufora mark: yellow circle with the condensed wordmark. */
export function Logo({ size = 44, href = "/" }: { size?: number; href?: string | null }) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Ufora">
      <circle cx="50" cy="50" r="50" fill="var(--ufora-yellow)" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Barlow Condensed, Barlow, sans-serif"
        fontWeight={500}
        fontSize="20"
        letterSpacing="2.4"
        fill="var(--ufora-plum)"
      >
        UFORA
      </text>
    </svg>
  );
  return href ? (
    <Link href={href} className="inline-flex shrink-0" aria-label="Ufora home">
      {mark}
    </Link>
  ) : (
    mark
  );
}
