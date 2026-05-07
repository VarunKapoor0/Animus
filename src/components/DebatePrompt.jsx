// Shown when a new object is scanned and history has at least 1 item.
// Lets user pick which history object to connect with, or talk alone.

import { useState } from 'react';

export default function DebatePrompt({ newObject, history, onConnect, onTalkAlone }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selected = history[selectedIndex];

  return (
    <div className="panel-bg border border-neon-cyan/50 p-6 max-w-sm pointer-events-auto shadow-2xl">
      <div className="font-mono text-[10px] text-neon-cyan/50 uppercase tracking-widest mb-3">
        New object detected
      </div>

      <div className="font-mono text-sm text-neon-magenta uppercase tracking-wider mb-5 font-bold">
        {newObject.object_type}
      </div>

      <div className="mb-5">
        <p className="font-mono text-xs text-white/50 uppercase tracking-widest mb-2">
          Connect with:
        </p>
        {history.length === 1 ? (
          <div className="font-mono text-sm text-neon-cyan border border-neon-cyan/30 px-3 py-2 rounded">
            {history[0].object_type}
          </div>
        ) : (
          <select
            value={selectedIndex}
            onChange={e => setSelectedIndex(Number(e.target.value))}
            className="w-full font-mono text-sm text-neon-cyan bg-black border border-neon-cyan/30 px-3 py-2 rounded focus:outline-none focus:border-neon-cyan"
          >
            {history.map((item, i) => (
              <option key={i} value={i}>{item.object_type}</option>
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
          Talk alone
        </button>
      </div>
    </div>
  );
}
