import { useEffect, useRef, useState, useCallback } from 'react';
import { ARSceneManager } from '../lib/three-scene';

export default function useWebXR() {
  const containerRef = useRef(null);
  const managerRef = useRef(null);
  const [arSupported, setArSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [markerScreenPositions, setMarkerScreenPositions] = useState([]);

  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then(supported => setArSupported(supported))
        .catch(() => setArSupported(false));
    }
  }, []);

  const startAR = useCallback(async () => {
    if (!containerRef.current || !arSupported || managerRef.current) return;

    const manager = new ARSceneManager(containerRef.current);
    managerRef.current = manager;

    const success = await manager.startSession();
    if (!success) {
      // Session failed — clean up
      manager.dispose();
      managerRef.current = null;
      return;
    }

    // Only mark AR active after session is confirmed running
    setIsARActive(true);

    const interval = setInterval(() => {
      if (managerRef.current) {
        setMarkerScreenPositions(managerRef.current.getMarkerScreenPositions());
      }
    }, 100);
    managerRef.current._labelInterval = interval;
  }, [arSupported]);

  const captureHitPosition = useCallback(() => {
    return managerRef.current?.captureHitPosition() ?? null;
  }, []);

  const addARMarker = useCallback((objectType, worldPos) => {
    managerRef.current?.addMarker(objectType, worldPos);
  }, []);

  const removeARMarker = useCallback((objectType) => {
    managerRef.current?.removeMarker(objectType);
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
