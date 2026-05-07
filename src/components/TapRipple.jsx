// Neon ripple that expands from tap point and fades out.
import { useEffect, useRef } from 'react';

export default function TapRipple({ x, y, trigger }) {
  const rippleRef = useRef(null);

  useEffect(() => {
    if (!trigger || x === null || y === null) return;
    const t = setTimeout(() => {
      const el = rippleRef.current;
      if (!el) return;
      // Reset without transition
      el.style.transition = 'none';
      el.style.opacity = '1';
      el.style.transform = 'translate(-50%, -50%) scale(0)';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      void el.offsetWidth;
      // Animate outward
      el.style.transition = 'transform 0.7s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.7s ease-out';
      el.style.transform = 'translate(-50%, -50%) scale(1)';
      el.style.opacity = '0';
    }, 10);
    return () => clearTimeout(t);
  }, [trigger, x, y]);

  return (
    <div
      ref={rippleRef}
      className="absolute pointer-events-none"
      style={{
        left: x ?? -9999,
        top: y ?? -9999,
        width: 260,
        height: 260,
        zIndex: 50,
        borderRadius: '50%',
        border: '1.5px solid rgba(0,245,255,0.8)',
        boxShadow: '0 0 20px rgba(0,245,255,0.4), 0 0 40px rgba(0,245,255,0.15)',
        transform: 'translate(-50%, -50%) scale(0)',
        opacity: 0,
      }}
    />
  );
}
