import React from 'react';

export default function GlitchText({ text, className = "", glitchSpeed = "normal" }) {
  const isFast = glitchSpeed === "fast";
  
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      
      {/* Glitch layers */}
      <span 
        className={`absolute top-0 left-[-2px] text-neon-magenta opacity-70 z-0 ${isFast ? 'animate-[glitch_0.5s_linear_infinite]' : 'animate-glitch'} select-none`}
        aria-hidden="true"
      >
        {text}
      </span>
      <span 
        className={`absolute top-0 left-[2px] text-neon-blue opacity-70 z-0 ${isFast ? 'animate-[glitch_0.3s_linear_infinite_reverse]' : 'animate-[glitch_1.2s_linear_infinite_reverse]'} select-none`}
        aria-hidden="true"
      >
        {text}
      </span>
    </div>
  );
}
