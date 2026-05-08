import React from 'react';
import GlitchText from './GlitchText';

export default function ObjectCard({ visionData, onClose, onChatStart }) {
  if (!visionData) return null;

  return (
    <div className="panel-bg neon-border-magenta p-4 sm:p-6 w-[90vw] max-w-sm pointer-events-auto shadow-2xl animate-[fadeIn_0.5s_ease-out]">
      <div className="text-xs font-mono text-neon-magenta mb-2 bg-neon-magenta/10 py-1 px-2 uppercase inline-block font-bold max-w-full truncate">
        <GlitchText text={visionData.object_type} />
      </div>
      <p className="text-white text-base sm:text-lg leading-relaxed chromatic mb-4 select-text font-serif italic">
        "{visionData.opening_line}"
      </p>
      
      <div className="flex gap-3 mt-4">
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
    </div>
  );
}
