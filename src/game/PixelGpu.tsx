import type { GpuModel } from "./types";
import { MFG_BY_TIER } from "./data";

/** Detailed pixel-art GPU rendered in pure SVG. */
export function PixelGpu({ model, idx, large = false, heatPct = 0.4 }:
  { model: GpuModel; idx: number; large?: boolean; heatPct?: number }) {
  const c = model.color;
  const tier = model.tier;
  const scale = large ? 1.9 : 1;
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
            <span key={i} className="absolute w-[2px] h-[2px] rounded-full"
              style={{
                left: `${20 + i * 30}%`, top: `${10 + (i % 2) * 30}%`,
                background: c,
                boxShadow: `0 0 4px ${c}`,
                ["--sx" as string]: `${(i - 1) * 18}px`,
                ["--sy" as string]: `-${20 + i * 6}px`,
                animation: `spark ${1.6 + i * 0.4}s ease-out ${i * 0.6}s infinite`,
              }} />
          ))}
        </div>
      )}
      {/* heat shimmer */}
      {tier !== "quantum" && (
        <div
          className="absolute -top-2 left-2 right-2 h-3 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, color-mix(in oklab, ${c} 40%, transparent), transparent)`,
            filter: "blur(3px)",
            animation: "heat-shimmer 0.5s ease-in-out infinite",
          }}
        />
      )}
      <svg viewBox="0 0 124 76" width={W * scale} height={H * scale} shapeRendering="crispEdges" style={{ imageRendering: "pixelated" }}>
        {/* PCB shadow */}
        <rect x="2" y="62" width="120" height="6" fill="#000" opacity="0.6" />
        {/* Backplate */}
        <rect x="4" y="14" width="116" height="48" fill={body} stroke={trim} strokeWidth="1" />
        <rect x="4" y="14" width="116" height="2" fill={trim} opacity="0.6" />
        {/* Neon strip across top edge — single accent color per model */}
        <g>
          {Array.from({ length: 28 }).map((_, i) => (
            <rect key={i} x={6 + i * 4} y={16} width="3" height="1.5" fill={c}
              opacity="0.9" style={{ filter: `drop-shadow(0 0 2px ${c})` }}>
              <animate attributeName="opacity" values="0.45;1;0.45"
                dur={`${1 + (i % 3) * 0.3}s`} begin={`${i * 0.04}s`} repeatCount="indefinite" />
            </rect>
          ))}
        </g>
        {/* Neon strip across bottom edge */}
        <g>
          {Array.from({ length: 28 }).map((_, i) => (
            <rect key={i} x={6 + i * 4} y={59} width="3" height="1.5" fill={c}
              opacity="0.85" style={{ filter: `drop-shadow(0 0 2px ${c})` }}>
              <animate attributeName="opacity" values="1;0.4;1"
                dur={`${1.2 + (i % 4) * 0.2}s`} begin={`${i * 0.05}s`} repeatCount="indefinite" />
            </rect>
          ))}
        </g>
        {/* Top heatsink fins */}
        {Array.from({ length: 28 }).map((_, i) => (
          <rect key={i} x={6 + i * 4} y={8} width="2" height="8" fill={trim} />
        ))}
        {/* Two fans */}
        {[28, 84].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy="38" r="20" fill="#0a0a0e" stroke={trim} strokeWidth="1" />
            <circle cx={cx} cy="38" r="18" fill="none" stroke="#1a1a22" strokeWidth="1" />
            {/* Spinning blades — nested svg so rotation centers cleanly */}
            <svg x={cx - 20} y={18} width="40" height="40" viewBox="-20 -20 40 40" overflow="visible">
              <g className={tier === "starter" ? "spin-fan-slow" : "spin-fan"}>
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <path
                    key={a}
                    d={`M0,0 Q6,-10 14,-14`}
                    fill="none"
                    stroke={tier === "starter" ? "#444" : c}
                    strokeWidth="2"
                    opacity={tier === "starter" ? 0.6 : 0.9}
                    transform={`rotate(${a + i * 30 + idx * 13})`}
                  />
                ))}
                <circle r="4" fill={trim} />
                <circle r="2" fill="#000" />
              </g>
            </svg>
            {/* Neon ring */}
            {tier !== "starter" && (
              <circle cx={cx} cy="38" r="20" fill="none" stroke={c} strokeWidth="1" opacity="0.8"
                style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
            )}
          </g>
        ))}
        {/* Center divider with logo */}
        <rect x="55" y="20" width="14" height="36" fill={body} stroke={trim} />
        <text x="62" y="40" textAnchor="middle" fontSize="6" fill={c}
          style={{ fontFamily: "Press Start 2P, monospace", filter: `drop-shadow(0 0 2px ${c})` }}>
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
          fill={heatPct > 0.7 ? "var(--neon-red)" : heatPct > 0.4 ? "var(--neon-orange)" : "var(--neon-green)"}>
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.4s" repeatCount="indefinite" />
        </rect>
        {/* Status LEDs */}
        <circle cx="9" cy="20" r="1.4" fill={c} className="led-blink" style={{ filter: `drop-shadow(0 0 3px ${c})` }} />
        <circle cx="9" cy="26" r="1.4" fill="#ff5e5e" className="led-blink" style={{ animationDelay: "0.4s" }} />
        <circle cx="9" cy="32" r="1.4" fill="#5eff8c" className="led-blink" style={{ animationDelay: "0.8s" }} />
        {/* Screws */}
        {[[7,17],[117,17],[7,59],[117,59]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="1" fill="#888" />
        ))}
        {/* Power cable */}
        <rect x="100" y="62" width="14" height="4" fill="#2a2a30" />
        <path d="M114,64 Q120,68 124,76" stroke="#1a1a1a" strokeWidth="3" fill="none" />
        <path d="M114,64 Q120,68 124,76" stroke={c} strokeWidth="1" fill="none" opacity="0.4" />

        {/* Liquid cooling tubes for high tier */}
        {showLiquid && (
          <>
            <path d="M10,12 Q60,4 114,12" stroke={c} strokeWidth="2" fill="none" opacity="0.9"
              style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
            <path d="M10,12 Q60,2 114,12" stroke="#fff" strokeWidth="0.6" fill="none" opacity="0.6" />
          </>
        )}

        {/* Quantum holo rings */}
        {showHolo && (
          <>
            <ellipse cx="62" cy="38" rx="58" ry="10" fill="none" stroke={c} strokeWidth="0.6" opacity="0.7"
              style={{ filter: `drop-shadow(0 0 6px ${c})` }} />
            <ellipse cx="62" cy="38" rx="58" ry="10" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.4"
              transform="rotate(20 62 38)" />
          </>
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
