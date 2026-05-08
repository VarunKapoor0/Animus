import React, { useState } from 'react';
import GlitchText from './GlitchText';
import { shareCard, shareToX } from '../hooks/useShare';

export default function ObjectCard({ visionData, onClose, onChatStart }) {
  if (!visionData) return null;

  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareCard(visionData.object_type, visionData.opening_line);
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="panel-bg neon-border-magenta p-4 sm:p-6 w-[92vw] max-w-sm pointer-events-auto shadow-2xl animate-[fadeIn_0.5s_ease-out]">
      {/* Object type label */}
      <div className="text-xs font-mono text-neon-magenta mb-3 bg-neon-magenta/10 py-1 px-2 uppercase inline-block font-bold max-w-full truncate">
        <GlitchText text={visionData.object_type} />
      </div>

      {/* Opening line */}
      <p className="text-white text-sm sm:text-base leading-relaxed chromatic mb-5 select-text font-serif italic">
        "{visionData.opening_line}"
      </p>

      {/* Primary actions */}
      <div className="flex gap-2 mb-2">
        <button
          className="flex-1 py-2 text-xs sm:text-sm font-mono bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/50 hover:bg-neon-magenta hover:text-white transition-colors uppercase"
          onClick={onChatStart}
        >
          [Initiate Link]
        </button>
        <button
          className="px-3 py-2 text-xs sm:text-sm font-mono text-gray-400 hover:text-white transition-colors uppercase"
          onClick={onClose}
        >
          [Discard]
        </button>
      </div>

      {/* Share row */}
      <div className="flex gap-2 pt-2 border-t border-white/5">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 py-1.5 text-[11px] font-mono text-white/40 hover:text-neon-cyan border border-white/10 hover:border-neon-cyan/30 transition-colors uppercase disabled:opacity-40"
        >
          {sharing ? 'Generating...' : '↑ Share'}
        </button>
        <button
          onClick={() => shareToX(visionData.object_type, visionData.opening_line)}
          className="flex-1 py-1.5 text-[11px] font-mono text-white/40 hover:text-white border border-white/10 hover:border-white/30 transition-colors uppercase"
        >
          Post on X
        </button>
      </div>
    </div>
  );
}
