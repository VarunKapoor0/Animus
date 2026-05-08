// useShare — generates a shareable card image and triggers share/download.
// Uses Canvas API to render the card client-side.
// Falls back gracefully across mobile/desktop.

export async function generateShareCard(objectType, openingLine) {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#080b14';
  ctx.fillRect(0, 0, W, H);

  // Scanlines
  ctx.fillStyle = 'rgba(0, 245, 255, 0.025)';
  for (let y = 0; y < H; y += 4) {
    ctx.fillRect(0, y, W, 1);
  }

  // Subtle radial glow
  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
  glow.addColorStop(0, 'rgba(0, 245, 255, 0.06)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Corner brackets
  const bracketSize = 60;
  const bracketOffset = 48;
  const bracketColor = 'rgba(0, 245, 255, 0.5)';
  ctx.strokeStyle = bracketColor;
  ctx.lineWidth = 3;
  // Top left
  ctx.beginPath(); ctx.moveTo(bracketOffset, bracketOffset + bracketSize); ctx.lineTo(bracketOffset, bracketOffset); ctx.lineTo(bracketOffset + bracketSize, bracketOffset); ctx.stroke();
  // Top right
  ctx.beginPath(); ctx.moveTo(W - bracketOffset - bracketSize, bracketOffset); ctx.lineTo(W - bracketOffset, bracketOffset); ctx.lineTo(W - bracketOffset, bracketOffset + bracketSize); ctx.stroke();
  // Bottom left
  ctx.beginPath(); ctx.moveTo(bracketOffset, H - bracketOffset - bracketSize); ctx.lineTo(bracketOffset, H - bracketOffset); ctx.lineTo(bracketOffset + bracketSize, H - bracketOffset); ctx.stroke();
  // Bottom right
  ctx.beginPath(); ctx.moveTo(W - bracketOffset - bracketSize, H - bracketOffset); ctx.lineTo(W - bracketOffset, H - bracketOffset); ctx.lineTo(W - bracketOffset, H - bracketOffset - bracketSize); ctx.stroke();

  // Object type label
  ctx.font = 'bold 28px monospace';
  ctx.fillStyle = '#00f5ff';
  ctx.letterSpacing = '6px';
  ctx.textAlign = 'center';
  const labelText = objectType.toUpperCase();
  // Label background pill
  const labelMetrics = ctx.measureText(labelText);
  const labelW = labelMetrics.width + 48;
  const labelH = 50;
  const labelX = W / 2 - labelW / 2;
  const labelY = H / 2 - 160;
  ctx.fillStyle = 'rgba(0, 245, 255, 0.08)';
  ctx.fillRect(labelX, labelY, labelW, labelH);
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(labelX, labelY, labelW, labelH);
  ctx.fillStyle = '#00f5ff';
  ctx.fillText(labelText, W / 2, labelY + 33);

  // Opening line — word wrapped serif italic
  ctx.font = 'italic 42px Georgia, serif';
  ctx.fillStyle = '#e8eaf0';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(255, 45, 120, 0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;

  const quote = `"${openingLine}"`;
  const maxWidth = W - 160;
  const lineHeight = 58;
  const words = quote.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const totalTextHeight = lines.length * lineHeight;
  let textY = H / 2 - totalTextHeight / 2 + 20;
  for (const line of lines) {
    ctx.fillText(line, W / 2, textY);
    textY += lineHeight;
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;

  // Divider line
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 80, H - 160);
  ctx.lineTo(W / 2 + 80, H - 160);
  ctx.stroke();

  // ANIMUS wordmark
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = 'rgba(0, 245, 255, 0.5)';
  ctx.letterSpacing = '8px';
  ctx.fillText('ANIMUS', W / 2, H - 128);

  // URL
  ctx.font = '18px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.letterSpacing = '2px';
  ctx.fillText('animus-jade.vercel.app', W / 2, H - 96);

  return canvas;
}

export async function shareCard(objectType, openingLine) {
  const canvas = await generateShareCard(objectType, openingLine);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const file = new File([blob], 'animus.png', { type: 'image/png' });
  const shareText = `"${openingLine}" — ${objectType} on Animus\n\nanimus-jade.vercel.app`;
  const shareUrl = 'https://animus-jade.vercel.app';

  // Try Web Share API (mobile)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Animus', text: shareText });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // user cancelled
    }
  }

  // Fallback: download the image
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `animus-${objectType.toLowerCase().replace(/\s+/g, '-')}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

export function shareToX(objectType, openingLine) {
  const text = encodeURIComponent(`"${openingLine.slice(0, 200)}"\n\n— ${objectType} on Animus`);
  const url = encodeURIComponent('https://animus-jade.vercel.app');
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}
