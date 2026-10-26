/** The Odyssey O: a path that almost closes, the gold dot in the opening is the step still ahead.
    Same geometry as the favicon, app icons and social image (100-unit grid). */
export function OdysseyMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden focusable="false">
      <path fill="#0f2440" d="M59.5 14.24A37 37 0 1 0 85.76 40.5H67.45A19 24 0 1 1 59.5 29.22Z" />
      <circle cx="70.6" cy="29.4" r="6.5" fill="#b8843d" />
    </svg>
  );
}
