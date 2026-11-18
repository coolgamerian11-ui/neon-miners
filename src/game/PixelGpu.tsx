import { memo } from "react";
import type { GpuModel } from "./types";
import { MFG_BY_TIER } from "./data";
import { PixelFan } from "./PixelSprites";

/** Detailed pixel-art GPU rendered in pure SVG. */
function PixelGpuInner({ model, idx, large = false, heatPct = 0.4 }:
  { model: GpuModel; idx: number; large?: boolean; heatPct?: number }) {
  const c = model.color;
  const tier = model.tier;
  const scale = large ? 2 : 1;
  const W = 124, H = 76;
  // Per-tier base colors
  const body = tier === "starter" ? "#1a1a1f"
             : tier === "mid"     ? "#0f1218"
             : tier === "high"    ? "#0a0d12"
             :                       "#080a14";
  const trim = tier === "starter" ? "#3a3a42"
             : tier === "mid"     ? "#4a4a55"
             : tier === "high"    ? "#5a5a68"
             :                       "#6a6a82";
  const showLiquid = tier === "high";
  const showHolo = tier === "quantum";
  const dust = tier === "starter";
  const showSparks = tier === "high" || tier === "quantum";
  const mfg = MFG_BY_TIER[tier];

  return (
    <div className="relative" style={{ width: W * scale, height: H * scale }}>
      {/* Sparks for high-tier */}
      {showSparks && (
        <div className="absolute inset-0 pointer-events-none">
          {[0,1,2].map(i => (
            <span key={i} className="absolute w-[2px] h-[2px] "
              style={{
                left: `${20 + i * 30}%`, top: `${10 + (i % 2) * 30}%`,
                background: c,
                
                ["--sx" as string]: `${(i - 1) * 18}px`,
                ["--sy" as string]: `-${20 + i * 6}px`,
                animation: `spark ${1.6 + i * 0.4}s steps(6, end) ${i * 0.6}s infinite`,
              }} />
          ))}
        </div>
      )}
      {tier !== "quantum" && <div className="absolute -top-1 left-2 right-2 h-2 pointer-events-none pixel-heat" style={{ color: c }} />}
      <svg viewBox="0 0 124 76" width={W * scale} height={H * scale} shapeRendering="crispEdges" style={{ imageRendering: "pixelated" }}>
        {/* PCB shadow */}
        <rect x="2" y="62" width="120" height="6" fill="#000" opacity="0.6" />
        {/* Backplate */}
        <rect x="4" y="14" width="116" height="48" fill={body} stroke={trim} strokeWidth="1" />
        <rect x="4" y="14" width="116" height="2" fill={trim} opacity="0.6" />
        {[16, 59].map(y => (
          <g key={y} className="led-blink" style={{ animationDelay: `${(idx % 3) * -0.2}s` }}>
            {Array.from({ length: 28 }, (_, i) => (
              <rect key={i} x={6 + i * 4} y={y} width="3" height="1" fill={c} />
            ))}
          </g>
        ))}
        {/* Top heatsink fins */}
        {Array.from({ length: 28 }).map((_, i) => (
          <rect key={i} x={6 + i * 4} y={8} width="2" height="8" fill={trim} />
        ))}
        {/* Two fans: four hand-sized pixel-grid frames, not a rotating SVG. */}
        {[28, 94].map(cx => (
          <PixelFan key={cx} x={cx - 20} y={21} size={34} color={tier === "starter" ? trim : c}
            trim={tier === "starter" ? trim : c} slow={tier === "starter"} />
        ))}
        {/* Center divider with logo */}
        <rect x="55" y="20" width="14" height="36" fill={body} stroke={trim} />
        <text x="62" y="40" textAnchor="middle" fontSize="6" fill={c}
          style={{ fontFamily: "Press Start 2P, monospace" }}>
          {tier === "quantum" ? "Q" : tier === "high" ? "X" : tier === "mid" ? "N" : "G"}
        </text>
        {/* Manufacturer tag */}
        <rect x="46" y="50" width="32" height="6" fill="#000" opacity="0.7" />
        <text x="62" y="55" textAnchor="middle" fontSize="4" fill={c}
          style={{ fontFamily: "Press Start 2P, monospace", letterSpacing: "0.1em" }}>
          {mfg}
        </text>
        {/* Heat bar on left edge */}
        <rect x="2" y="36" width="2" height="22" fill="#000" opacity="0.7" />
        <rect x="2" y={36 + 22 - Math.max(1, Math.min(22, heatPct * 22))} width="2"
          height={Math.max(1, Math.min(22, heatPct * 22))}
          className="led-blink" fill={heatPct > 0.7 ? "var(--neon-red)" : heatPct > 0.4 ? "var(--neon-orange)" : "var(--neon-green)"}/>
        {/* Status LEDs */}
        <rect x="8" y="19" width="2" height="2" fill={c} className="led-blink" />
        <rect x="8" y="25" width="2" height="2" fill="#ff5e5e" className="led-blink" style={{ animationDelay: "0.4s" }} />
        <rect x="8" y="31" width="2" height="2" fill="#5eff8c" className="led-blink" style={{ animationDelay: "0.8s" }} />
        {/* Screws */}
        {[[7,17],[117,17],[7,59],[117,59]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="1" fill="#888" />
        ))}
        {/* Power cable */}
        <rect x="100" y="62" width="14" height="4" fill="#2a2a30" />
        <path d="M114 64h4v4h3v4h3v4" stroke="#1a1a1a" strokeWidth="3" fill="none" />
        <path d="M114 64h4v4h3v4h3v4" stroke={c} strokeWidth="1" fill="none" opacity="0.4" />

        {/* Liquid cooling tubes for high tier */}
        {showLiquid && (
          <>
            <path d="M10 12h14V9h22V7h34v2h20v3h14" stroke={c} strokeWidth="2" fill="none" opacity="0.9"
              />
            <path d="M10 11h14V8h22V6h34v2h20v3h14" stroke="#fff" strokeWidth="0.6" fill="none" opacity="0.6" />
          </>
        )}

        {showHolo && (
          <g className="led-blink" fill="none" stroke={c}>
            <path d="M2 34h12v-4h24v-4h48v4h24v4h12v8h-12v4H86v4H38v-4H14v-4H2z" />
            <path d="M10 33v-5h14v-4h12m52 28h12v-4h14v-5" opacity="0.5" />
          </g>
        )}
        {/* Dust on starter */}
        {dust && (
          <>
            <circle cx="20" cy="22" r="0.8" fill="#7a6a4a" opacity="0.6" />
            <circle cx="42" cy="50" r="0.6" fill="#7a6a4a" opacity="0.6" />
            <circle cx="78" cy="24" r="0.7" fill="#7a6a4a" opacity="0.5" />
            <circle cx="100" cy="48" r="0.6" fill="#7a6a4a" opacity="0.5" />
          </>
        )}
      </svg>
    </div>
  );
}

export const PixelGpu = memo(PixelGpuInner);
