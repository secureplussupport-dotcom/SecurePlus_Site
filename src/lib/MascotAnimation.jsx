const CIPHER_ANIMATION_ROWS = {
  idle: 0,
  blink: 1,
  correct: 2,
  wrong: 3,
  unlock: 4,
  streak: 5,
  thinking: 6,
  tip: 7,
};

export const mascotAnimations = Object.freeze({
  cipher: {
    name: "Cipher",
    sheet: "/mascots/cipher-animation-sheet.png",
    frameCount: 4,
    rowCount: 8,
    frameAspectRatio: "4 / 3",
    animations: CIPHER_ANIMATION_ROWS,
  },
});

export function MascotAnimation({
  animation = "idle",
  size = 96,
  label,
  className = "",
  style,
}) {
  const row = CIPHER_ANIMATION_ROWS[animation] ?? CIPHER_ANIMATION_ROWS.idle;
  const accessibleLabel = label || `Cipher ${animation} animation`;

  return (
    <span
      className={`cipher-mascot cipher-motion-${animation} ${className}`.trim()}
      role="img"
      aria-label={accessibleLabel}
      style={{
        "--cipher-row": row,
        "--cipher-size": typeof size === "number" ? `${size}px` : size,
        ...style,
      }}
    >
      <span className="cipher-mascot-sprite" aria-hidden="true" />
    </span>
  );
}
