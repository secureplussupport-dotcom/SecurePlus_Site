import { useEffect, useRef, useState } from "react";

const CIPHER_ANIMATION_ROWS = {
  idle: 0,
  blink: 1,
  correct: 2,
  wrong: 3,
  unlock: 4,
  streak: 5,
  thinking: 6,
  tip: 7,
  wave: 8,
  dance: 9,
  scan: 10,
  focus: 11,
  cheer: 12,
  surprised: 13,
};

const DEFAULT_REACTION_ANIMATIONS = Object.freeze(["surprised", "dance", "cheer"]);

export const mascotAnimations = Object.freeze({
  cipher: {
    name: "Cipher",
    renderMode: "pixel-rig",
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
  interactive = false,
  hoverAnimation = "wave",
  reactionAnimations = DEFAULT_REACTION_ANIMATIONS,
  onInteract,
}) {
  const baseAnimation = Object.hasOwn(CIPHER_ANIMATION_ROWS, animation) ? animation : "idle";
  const resolvedHoverAnimation = Object.hasOwn(CIPHER_ANIMATION_ROWS, hoverAnimation) ? hoverAnimation : "wave";
  const safeReactionAnimations = (Array.isArray(reactionAnimations)?reactionAnimations:DEFAULT_REACTION_ANIMATIONS).filter(item=>Object.hasOwn(CIPHER_ANIMATION_ROWS,item));
  const [reactionAnimation,setReactionAnimation]=useState("");
  const reactionTimerRef=useRef(null);
  const reactionIndexRef=useRef(0);
  const pointerHoverRef=useRef(false);
  const resolvedAnimation = reactionAnimation || baseAnimation;
  const accessibleLabel = label || `Cipher ${baseAnimation} animation`;

  const clearReactionTimer=()=>{
    if(reactionTimerRef.current)window.clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current=null;
  };
  const showReaction=(nextAnimation,source,duration=1650)=>{
    if(!interactive||!Object.hasOwn(CIPHER_ANIMATION_ROWS,nextAnimation))return;
    clearReactionTimer();
    setReactionAnimation(nextAnimation);
    onInteract?.({animation:nextAnimation,source});
    if(duration>0){
      reactionTimerRef.current=window.setTimeout(()=>{
        setReactionAnimation(pointerHoverRef.current?resolvedHoverAnimation:"");
        reactionTimerRef.current=null;
      },duration);
    }
  };
  const handlePointerEnter=event=>{
    if(!interactive||event.pointerType!=="mouse")return;
    pointerHoverRef.current=true;
    clearReactionTimer();
    setReactionAnimation(resolvedHoverAnimation);
    onInteract?.({animation:resolvedHoverAnimation,source:"hover"});
  };
  const handlePointerLeave=event=>{
    if(!interactive||event.pointerType!=="mouse")return;
    pointerHoverRef.current=false;
    clearReactionTimer();
    setReactionAnimation("");
  };
  const handlePointerDown=event=>{
    if(!interactive)return;
    const sequence=safeReactionAnimations.length?safeReactionAnimations:DEFAULT_REACTION_ANIMATIONS;
    const nextAnimation=sequence[reactionIndexRef.current%sequence.length];
    reactionIndexRef.current+=1;
    showReaction(nextAnimation,event.pointerType==="touch"?"touch":"press");
  };
  const handleKeyDown=event=>{
    if(!interactive||(event.key!=="Enter"&&event.key!==" "))return;
    event.preventDefault();
    const sequence=safeReactionAnimations.length?safeReactionAnimations:DEFAULT_REACTION_ANIMATIONS;
    const nextAnimation=sequence[reactionIndexRef.current%sequence.length];
    reactionIndexRef.current+=1;
    showReaction(nextAnimation,"keyboard");
  };

  useEffect(()=>()=>clearReactionTimer(),[]);

  const Root=interactive?"button":"span";

  return (
    <Root
      className={`cipher-mascot cipher-motion-${resolvedAnimation} ${interactive?"cipher-mascot-interactive":""} ${className}`.trim()}
      type={interactive?"button":undefined}
      role={interactive?undefined:"img"}
      aria-label={interactive?`${accessibleLabel}. Hover or tap to interact.`:accessibleLabel}
      data-animation={resolvedAnimation}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
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
        <span className="cipher-effect cipher-effect-note">♪</span>
        <span className="cipher-effect cipher-effect-scan" />
      </span>
    </Root>
  );
}
