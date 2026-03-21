import { useEffect, useState } from 'react';
import useWebXR from '../hooks/useWebXR';

export default function AROverlay({ children, isSupported }) {
  const { containerRef, isARActive, initAR, stopAR } = useWebXR();
  const [hitPos, setHitPos] = useState(null);

  // If we have WebXR support, we show an 'ENTER AR' button or initialize automatically
  // For MVP, we will just use the container to hold the Three.js canvas

  return (
    <>
      {/* Container for Three.js Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />
      
      {isSupported && !isARActive && (
        <button 
           onClick={() => initAR(setHitPos)}
           className="absolute top-20 right-6 z-50 text-xs font-mono panel-bg neon-border-cyan px-2 py-1 text-neon-cyan opacity-50 hover:opacity-100 uppercase"
        >
          [Init WebXR]
        </button>
      )}

      {isARActive && (
         <button 
           onClick={stopAR}
           className="absolute top-20 right-6 z-50 text-xs font-mono panel-bg neon-border-magenta px-2 py-1 text-neon-magenta opacity-50 hover:opacity-100 uppercase"
         >
           [Exit WebXR]
         </button>
      )}

      {/* When in AR Active mode, if we get a hit pos, we'd theoretically anchor children to it. 
          For now, just render children (like ChatPanel) in normal DOM flow since we use DOM Overlay. */}
      {children}
    </>
  );
}
