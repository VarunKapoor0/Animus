// Spatial markers — two rendering modes:
// AR mode: positions come from Three.js projection (3D → screen)
// Fallback mode: positions are stored clientX/clientY screen coords

export default function SpatialMarkers({ markers, onTap, arMode = false, arScreenPositions = [] }) {
  // In AR mode, use Three.js projected positions
  // In fallback mode, use stored screen coordinates
  const displayMarkers = arMode
    ? arScreenPositions
        .filter(m => !m.screen.behind)
        .map(m => {
          // Find matching history data from markers array
          const historyItem = markers.find(h => h.object_type === m.objectType);
          return historyItem ? { ...historyItem, screenX: m.screen.x, screenY: m.screen.y } : null;
        })
        .filter(Boolean)
    : markers.map(m => ({ ...m, screenX: m.x, screenY: m.y }));

  if (displayMarkers.length === 0) return null;

  return (
    <>
      {displayMarkers.map((marker, i) => (
        <button
          key={`${marker.object_type}-${i}`}
          onClick={() => onTap(marker)}
          className="absolute group"
          style={{
            left: marker.screenX,
            top: marker.screenY,
            transform: 'translate(-50%, -50%)',
            zIndex: 35,
            pointerEvents: 'auto',
          }}
        >
          <div className="relative flex items-center">
            <div className="relative w-3 h-3 flex-none">
              <div className="absolute inset-0 rounded-full bg-neon-cyan/30 animate-ping" />
              <div className="relative w-3 h-3 rounded-full bg-neon-cyan shadow-[0_0_10px_#00f5ff] group-hover:shadow-[0_0_20px_#00f5ff] transition-shadow" />
            </div>
            <div
              className="ml-2 whitespace-nowrap font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded"
              style={{
                color: 'rgba(0,245,255,0.7)',
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(0,245,255,0.2)',
                textShadow: '0 0 6px rgba(0,245,255,0.5)',
              }}
            >
              {marker.object_type.length > 16
                ? marker.object_type.substring(0, 16) + '...'
                : marker.object_type}
            </div>
          </div>
        </button>
      ))}
    </>
  );
}
