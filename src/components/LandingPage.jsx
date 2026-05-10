import { useState, useEffect } from 'react';
import AnimatedBackground from './AnimatedBackground';

export default function LandingPage({ onEnter }) {
  const [glitch, setGlitch] = useState(false);
  const [booted, setBooted] = useState(false);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('animus-theme') === 'dark'; }
    catch { return false; }
  });

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem('animus-theme', next ? 'dark' : 'light'); } catch {}
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 600);
    return () => clearTimeout(t);
  }, []);

  const theme = {
    bg: dark ? '#080b14' : '#f0f4f8',
    scanlineColor: dark ? 'rgba(0,245,255,0.015)' : 'rgba(0,120,200,0.04)',
    glowColor: dark ? 'rgba(0,245,255,0.04)' : 'rgba(0,120,200,0.06)',
    borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
    labelColor: dark ? 'rgba(0,245,255,0.6)' : 'rgba(0,100,180,0.7)',
    readyColor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
    dotColor: dark ? '#00f5ff' : '#0078c8',
    titleColor: dark ? '#e8eaf0' : '#1a1f2e',
    titleGlow: dark
      ? (glitch ? '3px 0 0 rgba(255,0,200,0.6), -3px 0 0 rgba(0,245,255,0.6)' : '0 0 30px rgba(0,245,255,0.15)')
      : (glitch ? '3px 0 0 rgba(255,0,150,0.4), -3px 0 0 rgba(0,100,200,0.4)' : '0 0 20px rgba(0,100,200,0.1)'),
    dividerColor: dark ? 'rgba(0,245,255,0.3)' : 'rgba(0,100,180,0.3)',
    taglineColor: dark ? '#c8cad4' : '#2a3550',
    taglineShadow: dark
      ? '2px 0 0 rgba(255,0,0,0.3), -2px 0 0 rgba(0,255,255,0.3)'
      : '1px 0 0 rgba(200,0,100,0.15), -1px 0 0 rgba(0,100,200,0.15)',
    subtitleColor: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
    ctaBorder: dark ? 'rgba(0,245,255,0.5)' : 'rgba(0,100,180,0.5)',
    ctaColor: dark ? '#00f5ff' : '#0078c8',
    ctaHoverBg: dark ? 'rgba(0,245,255,0.08)' : 'rgba(0,100,180,0.08)',
    ctaHoverShadow: dark
      ? '0 0 25px rgba(0,245,255,0.15), inset 0 0 15px rgba(0,245,255,0.05)'
      : '0 0 20px rgba(0,100,180,0.1)',
    featureColor: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)',
    footerColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.3)',
    creditColor: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)',
    creditHoverColor: dark ? '#00f5ff' : '#0078c8',
    toggleBg: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    toggleBorder: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
    toggleColor: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
    changelogColor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
    changelogHover: dark ? '#00f5ff' : '#0078c8',
    glassesBg: dark ? 'rgba(0,245,255,0.06)' : 'rgba(0,100,180,0.06)',
    glassesBorder: dark ? 'rgba(0,245,255,0.4)' : 'rgba(0,100,180,0.35)',
    glassesShadow: dark
      ? '0 0 30px rgba(0,245,255,0.12), inset 0 0 20px rgba(0,245,255,0.04)'
      : '0 0 20px rgba(0,100,180,0.08)',
    glassesLabel: dark ? 'rgba(0,245,255,0.5)' : 'rgba(0,100,180,0.55)',
    glassesHeading: dark ? '#00f5ff' : '#0060b0',
    glassesHeadingGlow: dark ? '0 0 20px rgba(0,245,255,0.4)' : 'none',
    glassesBody: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
    glassesBtnBg: dark ? 'rgba(0,245,255,0.1)' : 'rgba(0,100,180,0.08)',
    glassesBtnBorder: dark ? 'rgba(0,245,255,0.6)' : 'rgba(0,100,180,0.5)',
    glassesBtnColor: dark ? '#00f5ff' : '#0078c8',
    glassesBtnHoverBg: dark ? 'rgba(0,245,255,0.18)' : 'rgba(0,100,180,0.15)',
    glassesBtnHoverShadow: dark ? '0 0 20px rgba(0,245,255,0.25)' : '0 0 15px rgba(0,100,180,0.15)',
    glassesSecondaryColor: dark ? 'rgba(0,245,255,0.6)' : 'rgba(0,100,180,0.65)',
    glassesSecondaryHover: dark ? '#00f5ff' : '#0060b0',
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col transition-colors duration-500"
      style={{ background: theme.bg }}
    >
      <AnimatedBackground dark={dark} />

      <div className="pointer-events-none absolute inset-0" style={{
        zIndex: 1,
        background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${theme.scanlineColor} 2px, ${theme.scanlineColor} 4px)`,
      }} />

      <div className="pointer-events-none absolute inset-0 transition-all duration-500" style={{
        zIndex: 1,
        background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${theme.glowColor} 0%, transparent 70%)`,
      }} />

      <div className="relative flex flex-col h-full" style={{ zIndex: 2 }}>

        {/* Top bar */}
        <div
          className="flex justify-between items-center px-4 sm:px-6 py-4"
          style={{ borderBottom: `1px solid ${theme.borderColor}` }}
        >
          <span className="font-mono text-xs tracking-widest" style={{ color: theme.labelColor }}>
            ANIMUS_OS_v1.0
          </span>
          <div className="flex items-center gap-3">
            <a
              href="/changelog"
              className="font-mono text-[10px] tracking-widest uppercase transition-colors duration-200"
              style={{ color: theme.changelogColor }}
              onMouseEnter={e => e.currentTarget.style.color = theme.changelogHover}
              onMouseLeave={e => e.currentTarget.style.color = theme.changelogColor}
            >
              Changelog
            </a>
            <button
              onClick={toggleDark}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] tracking-widest uppercase transition-all duration-200"
              style={{
                background: theme.toggleBg,
                border: `1px solid ${theme.toggleBorder}`,
                color: theme.toggleColor,
              }}
            >
              {dark ? '◑ Light' : '◐ Dark'}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.dotColor }} />
              <span className="font-mono text-xs tracking-widest" style={{ color: theme.readyColor }}>READY</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex-1 flex flex-col items-center justify-center px-6 sm:px-8 transition-opacity duration-700 ${
          booted ? 'opacity-100' : 'opacity-0'
        }`}>

          <div className="mb-8 text-center">
            <h1
              className="font-mono font-bold tracking-[0.3em] text-5xl md:text-7xl"
              style={{
                color: theme.titleColor,
                textShadow: theme.titleGlow,
                transition: 'text-shadow 0.05s, color 0.5s',
              }}
            >
              ANIMUS
            </h1>
          </div>

          <div className="w-16 h-px mb-8 transition-all duration-500" style={{ background: theme.dividerColor }} />

          <p
            className="font-serif italic text-xl md:text-2xl text-center mb-3 leading-relaxed transition-all duration-500"
            style={{ color: theme.taglineColor, textShadow: theme.taglineShadow }}
          >
            Every object has a story.
          </p>
          <p
            className="font-mono text-sm text-center mb-10 sm:mb-12 transition-all duration-500"
            style={{ color: theme.subtitleColor, letterSpacing: '0.15em' }}
          >
            POINT YOUR CAMERA · LISTEN · SPEAK BACK
          </p>

          <button
            onClick={onEnter}
            className="font-mono text-sm tracking-widest uppercase px-8 sm:px-10 py-4 transition-all duration-300"
            style={{
              border: `1px solid ${theme.ctaBorder}`,
              color: theme.ctaColor,
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = theme.ctaHoverBg;
              e.currentTarget.style.boxShadow = theme.ctaHoverShadow;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            [ INITIATE ]
          </button>

          <div className="flex items-center gap-4 sm:gap-6 mt-10 sm:mt-12 flex-wrap justify-center">
            {[
              { icon: '🎙', label: 'Voice' },
              { icon: '🌐', label: 'Multilingual' },
              { icon: '◈', label: 'AI Personality' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-xs" style={{ opacity: 0.4 }}>{icon}</span>
                <span
                  className="font-mono text-xs tracking-widest transition-colors duration-500"
                  style={{ color: theme.featureColor }}
                >
                  {label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {/* AnimusGlasses — big feature block */}
          <div
            className="mt-12 w-full max-w-lg px-7 py-6 transition-all duration-500"
            style={{
              border: `1px solid ${theme.glassesBorder}`,
              background: theme.glassesBg,
              boxShadow: theme.glassesShadow,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.glassesHeading }} />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: theme.glassesLabel }}>
                New — Hardware Edition
              </span>
            </div>

            <p
              className="font-mono font-bold text-xl sm:text-2xl tracking-widest mb-2 transition-all duration-500"
              style={{ color: theme.glassesHeading, textShadow: theme.glassesHeadingGlow }}
            >
              NOW ON META GLASSES
            </p>

            <p
              className="font-mono text-xs leading-relaxed mb-5 transition-all duration-500"
              style={{ color: theme.glassesBody, letterSpacing: '0.05em' }}
            >
              Animus runs on Meta Ray-Ban Display glasses. Point your glasses at any object —
              it identifies it and speaks to you in its own voice through the glasses speakers.
              No screen. Just look and listen.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://varkapoor.com/AnimusGlasses.apk"
                download
                className="font-mono text-xs tracking-widest uppercase px-5 py-2.5 transition-all duration-200"
                style={{
                  border: `1px solid ${theme.glassesBtnBorder}`,
                  color: theme.glassesBtnColor,
                  background: theme.glassesBtnBg,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = theme.glassesBtnHoverBg;
                  e.currentTarget.style.boxShadow = theme.glassesBtnHoverShadow;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = theme.glassesBtnBg;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                [ Download APK ]
              </a>
              <a
                href="https://varkapoor.com/projects/animusglasses"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs tracking-widest uppercase px-5 py-2.5 transition-all duration-200"
                style={{
                  border: `1px solid ${theme.glassesBorder}`,
                  color: theme.glassesSecondaryColor,
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = theme.glassesSecondaryHover;
                  e.currentTarget.style.borderColor = theme.glassesSecondaryHover;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = theme.glassesSecondaryColor;
                  e.currentTarget.style.borderColor = theme.glassesBorder;
                }}
              >
                [ Setup Guide ]
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div
          className="px-4 sm:px-6 py-4 flex justify-between items-center"
          style={{ borderTop: `1px solid ${theme.borderColor}` }}
        >
          <a
            href="https://varkapoor.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs tracking-widest uppercase transition-colors duration-200"
            style={{ color: theme.creditColor }}
            onMouseEnter={e => e.currentTarget.style.color = theme.creditHoverColor}
            onMouseLeave={e => e.currentTarget.style.color = theme.creditColor}
          >
            Built by Varun Kapoor
          </a>
          <span
            className="font-mono text-xs transition-colors duration-500"
            style={{ color: theme.footerColor, letterSpacing: '0.1em' }}
          >
            AI · CAMERA · VOICE
          </span>
        </div>
      </div>
    </div>
  );
}
