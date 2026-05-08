import type { GpuModel } from "./types";

/** Detailed pixel-art GPU rendered in pure SVG. */
export function PixelGpu({ model, idx }: { model: GpuModel; idx: number }) {
  const c = model.color;
  const tier = model.tier;
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

  return (
    <div className="relative" style={{ width: 124, height: 76 }}>
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
      <svg viewBox="0 0 124 76" width="124" height="76" shapeRendering="crispEdges" style={{ imageRendering: "pixelated" }}>
        {/* PCB shadow */}
        <rect x="2" y="62" width="120" height="6" fill="#000" opacity="0.6" />
        {/* Backplate */}
        <rect x="4" y="14" width="116" height="48" fill={body} stroke={trim} strokeWidth="1" />
        <rect x="4" y="14" width="116" height="2" fill={trim} opacity="0.6" />
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
            {/* RGB ring */}
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
