import { useEffect, useRef, useState } from 'react';
import { ARSceneManager } from '../lib/three-scene';

export default function useWebXR() {
  const containerRef = useRef(null);
  const managerRef = useRef(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  
  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsSupported(supported);
      });
    }
  }, []);
  
  const initAR = (onHit) => {
    if (!containerRef.current || !isSupported) return;
    
    // Cleanup any existing
    if(managerRef.current) managerRef.current.dispose();
    
    managerRef.current = new ARSceneManager(containerRef.current, (pos) => {
      // Provide hit coordinates back to React
      if (onHit) onHit(pos);
    });
    
    // Simulate clicking the standard Three.js AR button
    if (managerRef.current.arButton) {
      managerRef.current.arButton.click();
      setIsARActive(true);
      managerRef.current.startARRenderLoop();
    }
  };
  
  const stopAR = () => {
    if (managerRef.current) {
      try {
        managerRef.current.renderer.xr.getSession()?.end();
      } catch(e) {}
      managerRef.current.stopARRenderLoop();
      setIsARActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if(managerRef.current) managerRef.current.dispose();
    };
  }, []);

  return {
    containerRef,
    isSupported,
    isARActive,
    initAR,
    stopAR
  };
}
