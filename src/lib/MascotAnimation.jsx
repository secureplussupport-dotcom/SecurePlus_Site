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
    renderMode: "layered-rig",
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
  const resolvedAnimation = Object.hasOwn(CIPHER_ANIMATION_ROWS, animation) ? animation : "idle";
  const accessibleLabel = label || `Cipher ${resolvedAnimation} animation`;

  return (
    <span
      className={`cipher-mascot cipher-motion-${resolvedAnimation} ${className}`.trim()}
      role="img"
      aria-label={accessibleLabel}
      style={{
        "--cipher-size": typeof size === "number" ? `${size}px` : size,
        ...style,
      }}
    >
      <span className="cipher-rig" aria-hidden="true">
        <span className="cipher-aura" />
        <span className="cipher-ground-shadow" />
        <span className="cipher-leg cipher-leg-left"><span className="cipher-foot" /></span>
        <span className="cipher-leg cipher-leg-right"><span className="cipher-foot" /></span>
        <span className="cipher-arm cipher-arm-left"><span className="cipher-hand" /></span>
        <span className="cipher-arm cipher-arm-right"><span className="cipher-hand" /></span>
        <span className="cipher-body">
          <span className="cipher-chest"><span>+</span></span>
        </span>
        <span className="cipher-head">
          <span className="cipher-screen">
            <span className="cipher-eye cipher-eye-left" />
            <span className="cipher-eye cipher-eye-right" />
            <span className="cipher-mouth" />
          </span>
          <span className="cipher-spark"><span>+</span></span>
        </span>
        <span className="cipher-effect cipher-effect-check">✓</span>
        <span className="cipher-effect cipher-effect-alert">!</span>
        <span className="cipher-effect cipher-effect-lock">⌁</span>
        <span className="cipher-effect cipher-effect-flame">◆</span>
        <span className="cipher-effect cipher-effect-thought">•••</span>
        <span className="cipher-effect cipher-effect-tip">✦</span>
      </span>
    </span>
  );
}
