// Shown when a new object is scanned and history has at least 1 item.
import { useState } from 'react';

export default function DebatePrompt({ newObject, history, onConnect, onTalkAlone }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = history[selectedIndex];

  // Truncate long object names for display
  const truncate = (str, n = 20) => str.length > n ? str.substring(0, n) + '...' : str;

  return (
    <div className="panel-bg border border-neon-cyan/50 p-5 w-[320px] max-w-[90vw] pointer-events-auto shadow-2xl">
      <div className="font-mono text-[10px] text-neon-cyan/50 uppercase tracking-widest mb-3">
        New object detected
      </div>

      {/* New object name — truncated, wraps safely */}
      <div className="font-mono text-sm text-neon-magenta uppercase tracking-wider mb-5 font-bold break-words leading-tight">
        {truncate(newObject.object_type, 30)}
      </div>

      <div className="mb-5">
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">
          Connect with:
        </p>
        {history.length === 1 ? (
          <div className="font-mono text-sm text-neon-cyan border border-neon-cyan/30 px-3 py-2 rounded break-words">
            {truncate(history[0].object_type, 30)}
          </div>
        ) : (
          <select
            value={selectedIndex}
            onChange={e => setSelectedIndex(Number(e.target.value))}
            className="w-full font-mono text-sm text-neon-cyan bg-black border border-neon-cyan/30 px-3 py-2 rounded focus:outline-none focus:border-neon-cyan"
          >
            {history.map((item, i) => (
              <option key={i} value={i}>{truncate(item.object_type, 25)}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onConnect(selected)}
          className="flex-1 py-2 font-mono text-sm uppercase tracking-wider bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30 transition-colors rounded"
        >
          Connect
        </button>
        <button
          onClick={onTalkAlone}
          className="px-4 py-2 font-mono text-sm uppercase text-white/40 hover:text-white transition-colors"
        >
          Alone
        </button>
      </div>
    </div>
  );
}
