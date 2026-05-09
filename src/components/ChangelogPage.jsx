import { useState, useEffect } from 'react';
import { CHANGELOG } from '../changelog';
import AnimatedBackground from './AnimatedBackground';

const TYPE_STYLES = {
  new: { label: 'NEW', color: '#00f5ff', bg: 'rgba(0,245,255,0.08)', border: 'rgba(0,245,255,0.25)' },
  improved: { label: 'IMPROVED', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' },
  fixed: { label: 'FIXED', color: '#ff2d78', bg: 'rgba(255,45,120,0.08)', border: 'rgba(255,45,120,0.25)' },
};

export default function ChangelogPage({ onBack }) {
  const [dark, setDark] = useState(true);

  // Override body overflow so the changelog page can scroll
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'hidden'; };
  }, []);

  const bg = dark ? '#080b14' : '#f0f4f8';
  const borderColor = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
  const labelColor = dark ? 'rgba(0,245,255,0.6)' : 'rgba(0,100,180,0.7)';
  const backColor = dark ? 'rgba(0,245,255,0.6)' : 'rgba(0,100,180,0.7)';
  const backHover = dark ? '#00f5ff' : '#0078c8';
  const titleColor = dark ? '#e8eaf0' : '#1a1f2e';
  const subtitleColor = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';
  const versionColor = dark ? '#00f5ff' : '#0078c8';
  const versionGlow = dark ? '0 0 20px rgba(0,245,255,0.3)' : 'none';
  const dateColor = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)';
  const dividerColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const changeTextColor = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const footerColor = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)';
  const footerHover = dark ? '#00f5ff' : '#0078c8';
  const toggleBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const toggleBorder = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
  const toggleColor = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)';
  const latestColor = dark ? '#00f5ff' : '#0078c8';
  const latestBg = dark ? 'rgba(0,245,255,0.1)' : 'rgba(0,100,180,0.08)';
  const latestBorder = dark ? 'rgba(0,245,255,0.2)' : 'rgba(0,100,180,0.2)';

  return (
    <div
      className="relative w-screen min-h-screen flex flex-col transition-colors duration-500"
      style={{ background: bg }}
    >
      <AnimatedBackground dark={dark} />

      <div className="pointer-events-none fixed inset-0" style={{
        zIndex: 1,
        background: dark
          ? 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.015) 2px, rgba(0,245,255,0.015) 4px)'
          : 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,120,200,0.04) 2px, rgba(0,120,200,0.04) 4px)',
      }} />

      <div className="relative flex flex-col" style={{ zIndex: 2 }}>

        {/* Sticky top bar */}
        <div
          className="flex justify-between items-center px-4 sm:px-8 py-4 sticky top-0"
          style={{
            borderBottom: `1px solid ${borderColor}`,
            background: dark ? 'rgba(8,11,20,0.92)' : 'rgba(240,244,248,0.92)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            onClick={onBack}
            className="font-mono text-xs tracking-widest uppercase transition-colors duration-200"
            style={{ color: backColor }}
            onMouseEnter={e => e.currentTarget.style.color = backHover}
            onMouseLeave={e => e.currentTarget.style.color = backColor}
          >
            ← ANIMUS
          </button>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tracking-widest" style={{ color: labelColor }}>
              CHANGELOG
            </span>
            <button
              onClick={() => setDark(d => !d)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] tracking-widest uppercase transition-all duration-200"
              style={{ background: toggleBg, border: `1px solid ${toggleBorder}`, color: toggleColor }}
            >
              {dark ? '◑ Light' : '◐ Dark'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-8 py-12 sm:py-16">
          <div className="mb-12">
            <h1
              className="font-mono font-bold tracking-[0.2em] text-3xl sm:text-4xl mb-3 transition-colors duration-500"
              style={{ color: titleColor }}
            >
              CHANGELOG
            </h1>
            <p className="font-serif italic transition-colors duration-500" style={{ color: subtitleColor }}>
              A record of what's been built.
            </p>
          </div>

          <div className="space-y-12">
            {CHANGELOG.map((entry, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-4 mb-5 flex-wrap">
                  <span
                    className="font-mono font-bold text-lg tracking-widest transition-colors duration-500"
                    style={{ color: versionColor, textShadow: versionGlow }}
                  >
                    {entry.version}
                  </span>
                  <span className="font-mono text-xs tracking-widest transition-colors duration-500" style={{ color: dateColor }}>
                    {entry.date}
                  </span>
                  {i === 0 && (
                    <span
                      className="font-mono text-[10px] tracking-widest px-2 py-0.5 rounded"
                      style={{ color: latestColor, background: latestBg, border: `1px solid ${latestBorder}` }}
                    >
                      LATEST
                    </span>
                  )}
                </div>

                <div className="w-full h-px mb-5 transition-colors duration-500" style={{ background: dividerColor }} />

                <ul className="space-y-3">
                  {entry.changes.map((change, j) => {
                    const style = TYPE_STYLES[change.type] || TYPE_STYLES.new;
                    return (
                      <li key={j} className="flex items-start gap-3">
                        <span
                          className="font-mono text-[10px] tracking-widest px-1.5 py-0.5 rounded flex-none mt-0.5"
                          style={{ color: style.color, background: style.bg, border: `1px solid ${style.border}` }}
                        >
                          {style.label}
                        </span>
                        <span
                          className="font-mono text-sm leading-relaxed transition-colors duration-500"
                          style={{ color: changeTextColor }}
                        >
                          {change.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8" style={{ borderTop: `1px solid ${dividerColor}` }}>
            <a
              href="https://varkapoor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-widest uppercase transition-colors duration-200"
              style={{ color: footerColor }}
              onMouseEnter={e => e.currentTarget.style.color = footerHover}
              onMouseLeave={e => e.currentTarget.style.color = footerColor}
            >
              Built by Varun Kapoor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
