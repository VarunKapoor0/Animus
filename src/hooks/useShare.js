// useShare — generates a shareable card image and triggers share/download.
// Uses Canvas API to render the card client-side.

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
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
  return lines;
}

export async function generateShareCard(objectType, openingLine) {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#080b14';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(0, 245, 255, 0.02)';
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);

  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
  glow.addColorStop(0, 'rgba(0, 245, 255, 0.05)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const bSize = 60;
  const bOff = 48;
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.45)';
  ctx.lineWidth = 3;
  const corners = [
    [[bOff, bOff + bSize], [bOff, bOff], [bOff + bSize, bOff]],
    [[W - bOff - bSize, bOff], [W - bOff, bOff], [W - bOff, bOff + bSize]],
    [[bOff, H - bOff - bSize], [bOff, H - bOff], [bOff + bSize, H - bOff]],
    [[W - bOff - bSize, H - bOff], [W - bOff, H - bOff], [W - bOff, H - bOff - bSize]],
  ];
  for (const [[x1, y1], [x2, y2], [x3, y3]] of corners) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
  }

  const LABEL_Y = 200;
  const QUOTE_START_Y = 300;
  const QUOTE_MAX_BOTTOM = 800;
  const BRAND_Y = 900;

  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  const labelText = objectType.toUpperCase().slice(0, 30);
  const labelMetrics = ctx.measureText(labelText);
  const labelPadX = 32;
  const labelH = 44;
  const labelW = labelMetrics.width + labelPadX * 2;
  const labelX = W / 2 - labelW / 2;
  const labelBoxY = LABEL_Y - labelH + 8;

  ctx.fillStyle = 'rgba(0, 245, 255, 0.07)';
  ctx.fillRect(labelX, labelBoxY, labelW, labelH);
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.28)';
  ctx.lineWidth = 1;
  ctx.strokeRect(labelX, labelBoxY, labelW, labelH);
  ctx.fillStyle = '#00f5ff';
  ctx.fillText(labelText, W / 2, LABEL_Y);

  const quote = `"${openingLine}"`;
  const maxQuoteWidth = W - 160;
  const lineHeight = 60;
  let fontSize = 44;
  ctx.font = `italic ${fontSize}px Georgia, serif`;
  let lines = wrapText(ctx, quote, maxQuoteWidth);

  while (lines.length * lineHeight > QUOTE_MAX_BOTTOM - QUOTE_START_Y && fontSize > 28) {
    fontSize -= 3;
    ctx.font = `italic ${fontSize}px Georgia, serif`;
    lines = wrapText(ctx, quote, maxQuoteWidth);
  }

  const midZoneCenter = (QUOTE_START_Y + QUOTE_MAX_BOTTOM) / 2;
  const recalcHeight = lines.length * lineHeight;
  let textY = midZoneCenter - recalcHeight / 2 + lineHeight * 0.8;

  ctx.fillStyle = '#e8eaf0';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(255, 45, 120, 0.25)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;

  for (const line of lines) {
    ctx.fillText(line, W / 2, textY);
    textY += lineHeight;
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;

  ctx.strokeStyle = 'rgba(0, 245, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 72, BRAND_Y - 32);
  ctx.lineTo(W / 2 + 72, BRAND_Y - 32);
  ctx.stroke();

  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = 'rgba(0, 245, 255, 0.55)';
  ctx.textAlign = 'center';
  ctx.fillText('A N I M U S', W / 2, BRAND_Y);

  ctx.font = '16px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillText('animusai.app', W / 2, BRAND_Y + 32);

  return canvas;
}

export async function shareCard(objectType, openingLine) {
  const canvas = await generateShareCard(objectType, openingLine);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const file = new File([blob], 'animus.png', { type: 'image/png' });
  const shareText = `"${openingLine}" — ${objectType} on Animus\n\nanimusai.app`;

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Animus', text: shareText });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `animus-${objectType.toLowerCase().replace(/\s+/g, '-')}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

export function shareToX(objectType, openingLine) {
  const text = encodeURIComponent(`"${openingLine.slice(0, 200)}"\n\n— ${objectType} on Animus`);
  const url = encodeURIComponent('https://animusai.app');
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}
