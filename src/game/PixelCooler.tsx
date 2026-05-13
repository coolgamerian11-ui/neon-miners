import { memo } from "react";
import type { CoolerModel } from "./types";

function PixelCoolerInner({ model, size = 36 }: { model: CoolerModel; size?: number }) {
  const c = model.color;
  const isLiquid = model.tier === "advanced" || model.tier === "elite";
  const isExtreme = model.tier === "mythic";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" as const }}>
      {/* radiator backplate */}
      <rect x="2" y="6" width="28" height="20" fill="#0a0a0e" stroke="#000" />
      {/* fins */}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={3 + i * 2} y={7} width="1" height="18" fill="#3a3a44" />
      ))}
      {/* fan circle */}
      <circle cx="16" cy="16" r="9" fill="#06060a" stroke={c} strokeWidth="1"
        style={{ filter: `drop-shadow(0 0 3px ${c})` }} />
      {/* spinning blades */}
      <g className="spin-fan" style={{ transformOrigin: "16px 16px" }}>
        {[0, 90, 180, 270].map(a => (
          <path key={a} d="M16,16 Q12,10 18,8" fill="none" stroke={c} strokeWidth="1.4"
            transform={`rotate(${a} 16 16)`} opacity="0.9" />
        ))}
        <circle cx="16" cy="16" r="2" fill="#222" />
      </g>
      {/* liquid tubes */}
      {isLiquid && (
        <>
          <path d="M2,4 Q16,2 30,4" stroke={c} strokeWidth="1.5" fill="none" opacity="0.9"
            style={{ filter: `drop-shadow(0 0 3px ${c})` }} />
          <path d="M4,28 Q16,30 28,28" stroke={c} strokeWidth="1.5" fill="none" opacity="0.7" />
        </>
      )}
      {/* extreme: ice frost */}
      {isExtreme && (
        <g opacity="0.85" style={{ filter: `drop-shadow(0 0 4px ${c})` }}>
          <path d="M16 2 L16 30 M2 16 L30 16 M6 6 L26 26 M26 6 L6 26" stroke={c} strokeWidth="0.5" />
        </g>
      )}
      {/* tier LED */}
      <rect x="2" y="2" width="3" height="2" fill={c} style={{ filter: `drop-shadow(0 0 2px ${c})` }} />
    </svg>
  );
}

export const PixelCooler = memo(PixelCoolerInner);