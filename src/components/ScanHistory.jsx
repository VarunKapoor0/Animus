// Shows a horizontal strip of previously linked objects.
// Tapping one resumes the conversation without a new scan.

export default function ScanHistory({ history, onResume }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-2 mb-2">
      <p className="font-mono text-[9px] tracking-widest text-white/20 uppercase">Previously linked</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {history.map((item, i) => (
          <button
            key={i}
            onClick={() => onResume(item)}
            className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 border border-neon-cyan/25 text-neon-cyan/50 hover:border-neon-cyan/60 hover:text-neon-cyan hover:bg-neon-cyan/5 transition-all rounded"
          >
            {item.object_type}
          </button>
        ))}
      </div>
    </div>
  );
}
