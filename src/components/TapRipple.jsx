// Neon ripple that expands from tap point and fades out.
import { useEffect, useRef } from 'react';

export default function TapRipple({ x, y }) {
  const rippleRef = useRef(null);

  useEffect(() => {
    if (x === null || y === null || !rippleRef.current) return;
    const el = rippleRef.current;
    // Reset
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, -50%) scale(0)';
    el.style.transition = 'none';

    // Force reflow
    void el.offsetWidth;

    // Animate
    el.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    el.style.transform = 'translate(-50%, -50%) scale(1)';
    el.style.opacity = '0';
  }, [x, y]);

  if (x === null || y === null) return null;

  return (
    <div
      ref={rippleRef}
      className="absolute pointer-events-none z-30"
      style={{
        left: x,
        top: y,
        width: 120,
        height: 120,
        borderRadius: '50%',
        border: '2px solid #00f5ff',
        boxShadow: '0 0 12px #00f5ff, inset 0 0 12px rgba(0,245,255,0.2)',
        transform: 'translate(-50%, -50%) scale(0)',
        opacity: 1,
      }}
    />
  );
}
