import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function ScanButton({ isScanning, onScan }) {
  const btnRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    // Pulse animation
    gsap.to(btnRef.current, {
      boxShadow: '0 0 20px #00f5ff',
      scale: 1.05,
      yoyo: true,
      repeat: -1,
      duration: 1.5,
      ease: 'sine.inOut'
    });
  }, []);

  const handleClick = () => {
    // Trigger the global captureFrame method
    if (window.captureFrame) {
      const imgData = window.captureFrame();
      if (imgData && onScan) {
        onScan(imgData);
      }
    }
  };

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={isScanning}
      className={`relative w-20 h-20 rounded-full flex items-center justify-center 
                  neon-border-cyan panel-bg 
                  transition-transform active:scale-95 group 
                  ${isScanning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div 
        ref={iconRef}
        className="w-8 h-8 border-2 border-neon-cyan/80 rounded-sm group-hover:scale-110 transition-transform flex items-center justify-center"
      >
        <div className="w-1/2 h-0.5 bg-neon-magenta animate-pulse"></div>
      </div>
      
      {/* Target scope markers */}
      <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-neon-cyan"></span>
      <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-neon-cyan"></span>
      <span className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-neon-cyan"></span>
      <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-neon-cyan"></span>
    </button>
  );
}
