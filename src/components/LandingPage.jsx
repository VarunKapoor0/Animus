import { useState, useEffect } from 'react';

export default function LandingPage({ onEnter }) {
  const [glitch, setGlitch] = useState(false);
  const [booted, setBooted] = useState(false);

  // Subtle periodic glitch on title
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Boot sequence
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col" style={{ background: '#080b14' }}>
      {/* Scanlines */}
      <div className="pointer-events-none absolute inset-0 z-50" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.015) 2px, rgba(0,245,255,0.015) 4px)',
      }} />

      {/* Radial glow in center */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,245,255,0.04) 0%, transparent 70%)',
      }} />

      {/* Top bar */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
        <span className="font-mono text-xs tracking-widest text-neon-cyan/60">ANIMUS_OS_v1.0</span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
          <span className="font-mono text-xs text-white/20 tracking-widest">READY</span>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col items-center justify-center px-8 transition-opacity duration-700 ${
        booted ? 'opacity-100' : 'opacity-0'
      }`}>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1
            className="font-mono font-bold tracking-[0.3em] text-5xl md:text-7xl"
            style={{
              color: '#e8eaf0',
              textShadow: glitch
                ? '3px 0 0 rgba(255,0,200,0.6), -3px 0 0 rgba(0,245,255,0.6)'
                : '0 0 30px rgba(0,245,255,0.15)',
              transition: 'text-shadow 0.05s',
            }}
          >
            ANIMUS
          </h1>
        </div>

        {/* Divider line */}
        <div className="w-16 h-px mb-8" style={{ background: 'rgba(0,245,255,0.3)' }} />

        {/* Tagline */}
        <p
          className="font-serif italic text-xl md:text-2xl text-center mb-3 leading-relaxed"
          style={{ color: '#c8cad4', textShadow: '2px 0 0 rgba(255,0,0,0.3), -2px 0 0 rgba(0,255,255,0.3)' }}
        >
          Every object has a story.
        </p>
        <p className="font-mono text-sm text-center mb-12" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}>
          POINT YOUR CAMERA · LISTEN · SPEAK BACK
        </p>

        {/* CTA */}
        <button
          onClick={onEnter}
          className="group relative font-mono text-sm tracking-widest uppercase px-10 py-4 transition-all duration-300"
          style={{
            border: '1px solid rgba(0,245,255,0.5)',
            color: '#00f5ff',
            background: 'transparent',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0,245,255,0.08)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(0,245,255,0.15), inset 0 0 15px rgba(0,245,255,0.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          [ INITIATE ]
        </button>

        {/* Feature hints */}
        <div className="flex items-center gap-6 mt-12">
          {[
            { icon: '🎙', label: 'Voice' },
            { icon: '🌐', label: 'Multilingual' },
            { icon: '◈', label: 'AI Personality' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-xs" style={{ opacity: 0.4 }}>{icon}</span>
              <span className="font-mono text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-6 py-4 border-t border-white/5 flex justify-center">
        <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.12)', letterSpacing: '0.1em' }}>
          AI · CAMERA · VOICE
        </span>
      </div>
    </div>
  );
}
