import { useEffect, useRef, useState, useCallback } from 'react';
import { ARSceneManager } from '../lib/three-scene';

export default function useWebXR() {
  const containerRef = useRef(null);
  const managerRef = useRef(null);
  const [arSupported, setArSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [markerScreenPositions, setMarkerScreenPositions] = useState([]);

  // Check AR support on mount
  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then(supported => setArSupported(supported))
        .catch(() => setArSupported(false));
    }
  }, []);

  // Start AR session — called when first scan happens on a supported device
  const startAR = useCallback(() => {
    if (!containerRef.current || !arSupported || managerRef.current) return;

    managerRef.current = new ARSceneManager(containerRef.current, (worldPos) => {
      // Controller select callback — not used directly, we use captureHitPosition instead
    });

    managerRef.current.startSession();
    setIsARActive(true);

    // Poll marker screen positions for React label overlay
    const interval = setInterval(() => {
      if (managerRef.current) {
        setMarkerScreenPositions(managerRef.current.getMarkerScreenPositions());
      }
    }, 100);

    managerRef.current._labelInterval = interval;
  }, [arSupported]);

  // Capture the current reticle hit position when user taps to scan
  const captureHitPosition = useCallback(() => {
    if (!managerRef.current) return null;
    return managerRef.current.captureHitPosition();
  }, []);

  // Add a 3D marker when conversation is terminated
  const addARMarker = useCallback((objectType, worldPos) => {
    if (!managerRef.current || !worldPos) return;
    managerRef.current.addMarker(objectType, worldPos);
  }, []);

  // Remove a 3D marker
  const removeARMarker = useCallback((objectType) => {
    if (!managerRef.current) return;
    managerRef.current.removeMarker(objectType);
  }, []);

  const stopAR = useCallback(() => {
    if (!managerRef.current) return;
    clearInterval(managerRef.current._labelInterval);
    managerRef.current.stopSession();
    managerRef.current.dispose();
    managerRef.current = null;
    setIsARActive(false);
    setMarkerScreenPositions([]);
  }, []);

  useEffect(() => {
    return () => {
      if (managerRef.current) {
        clearInterval(managerRef.current._labelInterval);
        managerRef.current.dispose();
      }
    };
  }, []);

  return {
    containerRef,
    arSupported,
    isARActive,
    markerScreenPositions,
    startAR,
    stopAR,
    captureHitPosition,
    addARMarker,
    removeARMarker,
  };
}
