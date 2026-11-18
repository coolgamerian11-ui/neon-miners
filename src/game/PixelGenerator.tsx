import { memo } from "react";
import type { PowerModel } from "./types";

function PixelGeneratorInner({ model, size = 36 }: { model: PowerModel; size?: number }) {
  const c = model.color;
  const isSolar = model.id.includes("solar");
  const isFusion = model.id.includes("fusion") || model.id.includes("zpe");
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" as const }}>
      {/* main body */}
      <rect x="3" y="6" width="26" height="22" fill="#1a1a22" stroke="#000" />
      <rect x="3" y="6" width="26" height="3" fill="#2a2a32" />
      {/* vents */}
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x={5} y={11 + i * 3} width="10" height="1" fill="#000" />
      ))}
      {/* digital screen */}
      <rect x="17" y="11" width="10" height="6" fill="#020608" stroke={c} strokeWidth="0.5" />
      <rect x="18" y="13" width="3" height="1" fill={c} />
      <rect x="22" y="13" width="4" height="1" fill={c} className="pulse-glow" />
      <rect x="18" y="15" width={4} height="1" fill={c} opacity="0.7" />
      {/* outlets */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={18 + i * 3} y="20" width="2" height="3" fill="#000" />
          <rect x={18.5 + i * 3} y="21" width="1" height="1" fill={c} />
        </g>
      ))}
      {/* power switch */}
      <rect x="6" y="22" width="6" height="3" fill="#000" />
      <rect x="7" y="22.5" width="2" height="2" fill={c} />
      {/* solar panel hat */}
      {isSolar && (
        <g>
          <rect x="2" y="2" width="28" height="4" fill="#0a1830" stroke={c} strokeWidth="0.5" />
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={3 + i * 4} y="2.5" width="3" height="3" fill="#1e3a6e" />
          ))}
        </g>
      )}
      {/* fusion core */}
      {isFusion && (
        <g>
          <path d="M8 13h3v1h1v3h-1v1H8v-1H7v-3h1z" fill="none" stroke={c} className="pulse-glow" />
          <rect x="9" y="15" width="1" height="1" fill={c} />
        </g>
      )}
      {/* warning sticker */}
      <rect x="3" y="28" width="6" height="2" fill="#caa018" />
      <rect x="3" y="28" width="6" height="2" fill="none" stroke="#000" />
      {/* cable */}
      <path d="M29 26h2v3h-1v3" stroke={c} strokeWidth="1" fill="none" opacity="0.6" />
    </svg>
  );
}

export const PixelGenerator = memo(PixelGeneratorInner);