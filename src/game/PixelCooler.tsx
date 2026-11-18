import { memo } from "react";
import { PixelFan } from "./PixelSprites";
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
      <PixelFan x={7} y={7} size={18} color={c} trim={c} />
      {/* liquid tubes */}
      {isLiquid && (
        <>
          <path d="M2 4h6V2h16v2h6" stroke={c} strokeWidth="1.5" fill="none" opacity="0.9" />
          <path d="M4 28h6v2h12v-2h6" stroke={c} strokeWidth="1.5" fill="none" opacity="0.7" />
        </>
      )}
      {/* extreme: ice frost */}
      {isExtreme && (
        <g opacity="0.85">
          <path d="M16 2 L16 30 M2 16 L30 16 M6 6 L26 26 M26 6 L6 26" stroke={c} strokeWidth="0.5" />
        </g>
      )}
      {/* tier LED */}
      <rect x="2" y="2" width="3" height="2" fill={c} />
    </svg>
  );
}

export const PixelCooler = memo(PixelCoolerInner);