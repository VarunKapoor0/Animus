import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function BoundingBox({ x, y, isScanning }) {
  const boxRef = useRef(null);

  useEffect(() => {
    // Glitch entry animation
    gsap.fromTo(boxRef.current,
      { opacity: 0, scale: 1.5, skewX: 20 },
      { 
        opacity: 1, 
        scale: 1, 
        skewX: 0, 
        duration: 0.4, 
        ease: "back.out(1.7)",
        onComplete: () => {
          gsap.to(boxRef.current, {
            opacity: 0.8,
            duration: 0.1,
            repeat: 5,
            yoyo: true
          });
        }
      }
    );
  }, [x, y]);

  // If x, y are provided, absolute position. Else center.
  const style = (x !== null && y !== null) 
    ? { left: x, top: y, transform: 'translate(-50%, -50%)' }
    : { left: '50%', top: '40%', transform: 'translate(-50%, -50%)' };

  return (
    <div 
      ref={boxRef}
      className="absolute pointer-events-none flex items-center justify-center z-40"
      style={{ ...style, width: '180px', height: '180px' }}
    >
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-cyan shadow-[inset_2px_2px_8px_transparent,-2px_-2px_8px_#00f5ff]"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-cyan shadow-[inset_-2px_2px_8px_transparent,2px_-2px_8px_#00f5ff]"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-cyan shadow-[inset_2px_-2px_8px_transparent,-2px_2px_8px_#00f5ff]"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-cyan shadow-[inset_-2px_-2px_8px_transparent,2px_2px_8px_#00f5ff]"></div>

      {/* Internal scanning line */}
      {isScanning && (
        <div 
           className="absolute top-0 left-2 right-2 h-[2px] bg-neon-cyan opacity-80 shadow-[0_0_10px_#00f5ff]"
           style={{ animation: 'boxScan 1.5s linear infinite' }}
        ></div>
      )}
    </div>
  );
}
