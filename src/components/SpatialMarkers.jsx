// Floating spatial markers at positions where objects were previously scanned.
export default function SpatialMarkers({ markers, onTap }) {
  if (!markers || markers.length === 0) return null;

  return (
    <>
      {markers.map((marker, i) => (
        <button
          key={i}
          onClick={() => onTap(marker)}
          className="absolute pointer-events-auto z-30 group"
          style={{
            left: marker.x,
            top: marker.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f5ff] group-hover:shadow-[0_0_16px_#00f5ff] transition-shadow" />
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-widest text-neon-cyan/60 group-hover:text-neon-cyan transition-colors"
              style={{ textShadow: '0 0 8px rgba(0,245,255,0.4)' }}
            >
              {marker.object_type.length > 18 ? marker.object_type.substring(0, 18) + '...' : marker.object_type}
            </div>
          </div>
        </button>
      ))}
    </>
  );
}
