import { memo, type CSSProperties } from "react";

// Plot onto a native pixel grid rather than rotating a vector layer in the browser.
function fanFrame(frame: number) {
  let path = "";
  for (let y = 1; y < 16; y++) {
    for (let x = 1; x < 16; x++) {
      const r = Math.hypot(x - 8, y - 8);
      const angle = Math.atan2(y - 8, x - 8) / (Math.PI / 2);
      const blade = angle + r * 0.07 - frame / 4;
      if (r > 1.5 && r < 7 && blade - Math.floor(blade) < 0.38) {
        path += `M${x} ${y}h1v1h-1z`;
      }
    }
  }
  return path;
}

const fanFrames = Array.from({ length: 4 }, (_, i) => fanFrame(i));

export const PixelFan = memo(function PixelFan({ x = 0, y = 0, size, color, trim = "var(--metal-light)", active = true, slow = false }: {
  x?: number; y?: number; size: number; color: string; trim?: string; active?: boolean; slow?: boolean;
}) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 17 17" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M5 0h7v1h2v2h2v2h1v7h-1v2h-2v2h-2v1H5v-1H3v-2H1v-2H0V5h1V3h2V1h2z" fill="var(--metal-dark)" stroke={trim} />
      {fanFrames.map((d, frame) => (
        (active || frame === 0) && <path key={frame} d={d} fill={color} className={active ? "pixel-frame" : undefined}
          style={{ "--frame-offset": `${(slow ? 0.8 : 0.4) * frame / -4}s`, "--frame-cycle": slow ? "0.8s" : "0.4s", opacity: frame === 0 ? 1 : 0 } as CSSProperties} />
      ))}
      <path d="M7 6h3v1h1v3h-1v1H7v-1H6V7h1z" fill={trim} />
      <rect x="8" y="8" width="1" height="1" fill="var(--metal-dark)" />
    </svg>
  );
});