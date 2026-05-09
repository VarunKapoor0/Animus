// AnimatedBackground — particle network + scan pulse on canvas.
// Purely visual, pointer-events none, adapts to dark/light mode.

import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 200;
const PARTICLE_SPEED = 0.35;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function AnimatedBackground({ dark }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const darkRef = useRef(dark);

  useEffect(() => { darkRef.current = dark; }, [dark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      vx: randomBetween(-PARTICLE_SPEED, PARTICLE_SPEED),
      vy: randomBetween(-PARTICLE_SPEED, PARTICLE_SPEED),
      r: randomBetween(1.2, 2.4),
      pulse: randomBetween(0, Math.PI * 2),
    }));

    let scanY = 0;
    const SCAN_SPEED = 0.6;

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);

      const isDark = darkRef.current;
      const particleColor = isDark ? '0,245,255' : '0,100,180';
      const lineColor = isDark ? '0,245,255' : '0,100,180';
      const scanGlow = isDark ? 'rgba(0,245,255,0.06)' : 'rgba(0,100,180,0.04)';
      const scanCore = isDark ? 'rgba(0,245,255,0.12)' : 'rgba(0,100,180,0.08)';

      ctx.clearRect(0, 0, W, H);

      // Scan pulse
      ctx.fillStyle = scanGlow;
      ctx.fillRect(0, scanY - 6, W, 12);
      ctx.fillStyle = scanCore;
      ctx.fillRect(0, scanY - 1, W, 2);
      scanY += SCAN_SPEED;
      if (scanY > H + 20) scanY = -20;

      // Particles + connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        const pulseOpacity = 0.35 + Math.sin(p.pulse) * 0.2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor},${pulseOpacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const lineOpacity = (1 - dist / CONNECTION_DISTANCE) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${lineColor},${lineOpacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
