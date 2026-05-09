import { CHANGELOG } from '../changelog';
import AnimatedBackground from './AnimatedBackground';

const TYPE_STYLES = {
  new: { label: 'NEW', color: '#00f5ff', bg: 'rgba(0,245,255,0.08)', border: 'rgba(0,245,255,0.25)' },
  improved: { label: 'IMPROVED', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' },
  fixed: { label: 'FIXED', color: '#ff2d78', bg: 'rgba(255,45,120,0.08)', border: 'rgba(255,45,120,0.25)' },
};

export default function ChangelogPage({ onBack }) {
  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden flex flex-col" style={{ background: '#080b14' }}>
      <AnimatedBackground dark={true} />

      {/* Scanlines */}
      <div className="pointer-events-none fixed inset-0" style={{
        zIndex: 1,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.015) 2px, rgba(0,245,255,0.015) 4px)',
      }} />

      <div className="relative flex flex-col" style={{ zIndex: 2 }}>

        {/* Top bar */}
        <div className="flex justify-between items-center px-4 sm:px-8 py-4 border-b border-white/5 sticky top-0" style={{ background: 'rgba(8,11,20,0.9)', backdropFilter: 'blur(8px)' }}>
          <button
            onClick={onBack}
            className="font-mono text-xs tracking-widest uppercase transition-colors duration-200"
            style={{ color: 'rgba(0,245,255,0.6)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#00f5ff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,245,255,0.6)'}
          >
            ← ANIMUS
          </button>
          <span className="font-mono text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
            CHANGELOG
          </span>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-8 py-12 sm:py-16">

          <div className="mb-12">
            <h1 className="font-mono font-bold tracking-[0.2em] text-3xl sm:text-4xl mb-3" style={{ color: '#e8eaf0' }}>
              CHANGELOG
            </h1>
            <p className="font-serif italic" style={{ color: 'rgba(255,255,255,0.35)' }}>
              A record of what's been built.
            </p>
          </div>

          <div className="space-y-12">
            {CHANGELOG.map((entry, i) => (
              <div key={i} className="relative">
                {/* Version header */}
                <div className="flex items-baseline gap-4 mb-5">
                  <span
                    className="font-mono font-bold text-lg tracking-widest"
                    style={{ color: '#00f5ff', textShadow: '0 0 20px rgba(0,245,255,0.3)' }}
                  >
                    {entry.version}
                  </span>
                  <span className="font-mono text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {entry.date}
                  </span>
                  {i === 0 && (
                    <span
                      className="font-mono text-[10px] tracking-widest px-2 py-0.5 rounded"
                      style={{ color: '#00f5ff', background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)' }}
                    >
                      LATEST
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="w-full h-px mb-5" style={{ background: 'rgba(255,255,255,0.06)' }} />

                {/* Changes */}
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
                        <span className="font-mono text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {change.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <a
              href="https://varkapoor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-widest uppercase transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#00f5ff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
            >
              Built by Varun Kapoor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
