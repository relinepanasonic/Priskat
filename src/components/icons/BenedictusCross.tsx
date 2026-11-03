/** The Saint Benedict cross: a cross with the initials C S P B in its four corners (and C S S M L / N D S M D on its arms). */
export default function BenedictusCross({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      {/* the cross */}
      <path d="M9.5 2.5h5v6h6v5h-6v8h-5v-8h-6v-5h6z" />
      {/* the four corner letters: C S P B */}
      <g fill="currentColor" stroke="none" fontFamily="Georgia, serif" fontWeight="700" fontSize="3.2" textAnchor="middle">
        <text x="5.4" y="6.4">C</text>
        <text x="18.6" y="6.4">S</text>
        <text x="5.4" y="21.6">P</text>
        <text x="18.6" y="21.6">B</text>
      </g>
      {/* the heart of the cross */}
      <path d="M12 5v14M7 11h10" strokeWidth="0.8" opacity=".6" />
    </svg>
  );
}
