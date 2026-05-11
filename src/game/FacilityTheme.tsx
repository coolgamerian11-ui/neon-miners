import type { CSSProperties } from "react";

export interface FacilityVisuals {
  /** wrapper background gradient */
  background: string;
  /** main accent color (CSS color or var) */
  accent: string;
  /** secondary glow */
  glow: string;
  /** floor gradient */
  floor: string;
  /** label shown bottom-left */
  label: string;
}

export const FACILITY_VISUALS: Record<string, FacilityVisuals> = {
  garage: {
    background: "linear-gradient(180deg, #2a2218 0%, #1a140c 60%, #0d0a06 100%)",
    accent: "var(--neon-orange)",
    glow:   "var(--btc-gold-glow)",
    floor:  "linear-gradient(180deg, #2a1f14 0%, #14100a 100%)",
    label:  "// GARAGE · zone 1",
  },
  basement: {
    background: "linear-gradient(180deg, #1a1820 0%, #0e0d14 60%, #08070c 100%)",
    accent: "var(--neon-green)",
    glow:   "color-mix(in oklab, var(--neon-green) 60%, transparent)",
    floor:  "linear-gradient(180deg, #14141a 0%, #08080c 100%)",
    label:  "// BASEMENT · sublevel B2",
  },
  warehouse: {
    background: "linear-gradient(180deg, #14202a 0%, #0a1018 60%, #050810 100%)",
    accent: "var(--neon-cyan)",
    glow:   "color-mix(in oklab, var(--neon-cyan) 60%, transparent)",
    floor:  "linear-gradient(180deg, #1a2028 0%, #0a0e14 100%)",
    label:  "// WAREHOUSE · sector 7",
  },
  vault: {
    background: "linear-gradient(180deg, #2a0a0e 0%, #14060a 60%, #08030a 100%)",
    accent: "var(--neon-red)",
    glow:   "color-mix(in oklab, var(--neon-red) 70%, transparent)",
    floor:  "linear-gradient(180deg, #1a0a0c 0%, #08040a 100%)",
    label:  "// VAULT · clearance Δ",
  },
  datacenter: {
    background: "linear-gradient(180deg, #0a1828 0%, #061020 60%, #03070f 100%)",
    accent: "var(--neon-blue)",
    glow:   "color-mix(in oklab, var(--neon-blue) 70%, transparent)",
    floor:  "linear-gradient(180deg, #0c1420 0%, #04070d 100%)",
    label:  "// DATA-CENTER · row A14",
  },
  quantum: {
    background: "linear-gradient(180deg, #1a0a2a 0%, #0e0418 60%, #06020c 100%)",
    accent: "var(--neon-purple)",
    glow:   "color-mix(in oklab, var(--neon-purple) 80%, transparent)",
    floor:  "linear-gradient(180deg, #160a24 0%, #06020c 100%)",
    label:  "// QUANTUM-LAB · cell Q-1",
  },
  space: {
    background: "linear-gradient(180deg, #02030a 0%, #050818 50%, #0a0218 100%)",
    accent: "var(--neon-cyan)",
    glow:   "color-mix(in oklab, var(--neon-cyan) 80%, transparent)",
    floor:  "linear-gradient(180deg, #0a1020 0%, #02030a 100%)",
    label:  "// ORBITAL · station COIN-1",
  },
};

export function getFacilityVisuals(id: string): FacilityVisuals {
  return FACILITY_VISUALS[id] ?? FACILITY_VISUALS.garage;
}

/** Per-facility decorative overlay layer (background props, foreground props). */
export function FacilityDecor({ facility }: { facility: string }) {
  const v = getFacilityVisuals(facility);

  if (facility === "garage") {
    return (
      <>
        {/* Wooden workbench backdrop */}
        <div className="absolute bottom-16 left-2 w-40 h-20 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(90deg, #4a3220 0 6px, #382514 6px 8px)",
            border: "1px solid #1a1008",
            boxShadow: "inset 0 1px 0 #5a3a22, 0 4px 8px rgba(0,0,0,0.6)",
          }} />
        {/* Hanging tools */}
        <svg className="absolute top-6 left-[20%] w-24 h-16 pointer-events-none" viewBox="0 0 96 64">
          <line x1="0" y1="2" x2="96" y2="2" stroke="#3a2a1a" strokeWidth="1" />
          {/* wrench */}
          <rect x="10" y="3" width="3" height="22" fill="#7a7a82" />
          <circle cx="11.5" cy="28" r="4" fill="none" stroke="#7a7a82" strokeWidth="2" />
          {/* hammer */}
          <rect x="34" y="3" width="2" height="20" fill="#3a2a1a" />
          <rect x="30" y="22" width="10" height="5" fill="#5a5a62" />
          {/* screwdriver */}
          <rect x="58" y="3" width="2" height="18" fill="#cc4422" />
          <rect x="58.5" y="20" width="1" height="6" fill="#aaa" />
          {/* pliers */}
          <rect x="78" y="3" width="2" height="18" fill="#7a7a82" />
        </svg>
        {/* Oil drum */}
        <div className="absolute bottom-16 right-32 w-7 h-12 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, #4a2818 0%, #2a1408 100%)",
            border: "1px solid #6a3a22",
            borderRadius: "1px",
            boxShadow: "inset -2px 0 0 rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.7)",
          }}>
          <div className="absolute top-2 left-0 right-0 h-px bg-[#1a0a04]" />
          <div className="absolute bottom-2 left-0 right-0 h-px bg-[#1a0a04]" />
          <div className="absolute top-4 left-1 font-pixel text-[6px] text-yellow-300/80">OIL</div>
        </div>
        {/* Garage-door slats on right wall */}
        <div className="absolute top-2 right-2 bottom-20 w-1 opacity-40 pointer-events-none"
          style={{ background: "repeating-linear-gradient(0deg, #4a3220 0 6px, #2a1d10 6px 8px)" }} />
      </>
    );
  }

  if (facility === "basement") {
    return (
      <>
        {/* Bare hanging bulbs */}
        {[20, 55, 80].map((x, i) => (
          <div key={i} className="absolute top-0 pointer-events-none flicker" style={{ left: `${x}%` }}>
            <div className="w-px h-12 bg-[#3a3a3a] mx-auto" />
            <div className="w-3 h-3 -mt-px mx-auto rounded-full"
              style={{ background: "radial-gradient(circle at 30% 30%, #fff8c0, #aa8030)", boxShadow: `0 0 16px ${v.glow}` }} />
          </div>
        ))}
        {/* Concrete pillar */}
        <div className="absolute top-0 bottom-16 left-[20%] w-6 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, #1a1a1f 0%, #2a2a30 50%, #1a1a1f 100%)",
            border: "1px solid #0a0a0c",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.6)",
          }}>
          <div className="absolute top-4 left-0 right-0 h-px bg-black/50" />
          <div className="absolute bottom-8 left-0 right-0 h-px bg-black/50" />
        </div>
        {/* Mold/water stain */}
        <div className="absolute bottom-20 left-32 w-20 h-8 pointer-events-none opacity-50"
          style={{ background: "radial-gradient(ellipse, #2a3a20 0%, transparent 70%)" }} />
      </>
    );
  }

  if (facility === "warehouse") {
    return (
      <>
        {/* High ceiling beams */}
        <svg className="absolute top-0 left-0 right-0 h-8 w-full pointer-events-none" viewBox="0 0 800 32" preserveAspectRatio="none">
          {[60, 200, 340, 480, 620, 760].map((x, i) => (
            <g key={i}>
              <rect x={x - 4} y="0" width="8" height="32" fill="#2a3038" />
              <rect x={x - 5} y="6" width="10" height="2" fill="#3a4048" />
              <rect x={x - 5} y="22" width="10" height="2" fill="#3a4048" />
            </g>
          ))}
        </svg>
        {/* Yellow warning floor stripes */}
        <div className="absolute bottom-16 left-0 right-0 h-3 pointer-events-none opacity-70"
          style={{ background: "repeating-linear-gradient(135deg, #d4a020 0 8px, #1a1410 8px 14px)" }} />
        {/* Forklift silhouette */}
        <svg className="absolute bottom-16 left-12 w-20 h-14 pointer-events-none" viewBox="0 0 80 56">
          <rect x="20" y="10" width="34" height="22" fill="#d4a020" stroke="#000" />
          <rect x="44" y="14" width="14" height="14" fill="#0a1828" stroke="#000" />
          <line x1="14" y1="32" x2="14" y2="48" stroke="#5a5a62" strokeWidth="3" />
          <line x1="6" y1="48" x2="20" y2="48" stroke="#5a5a62" strokeWidth="2" />
          <circle cx="28" cy="44" r="5" fill="#1a1a1f" stroke="#3a3a3f" />
          <circle cx="52" cy="44" r="5" fill="#1a1a1f" stroke="#3a3a3f" />
        </svg>
        {/* Crates */}
        <div className="absolute bottom-16 left-44 w-10 h-10 pointer-events-none"
          style={{ background: "linear-gradient(180deg, #5a3a20, #3a2410)", border: "1px solid #1a1008" }}>
          <div className="absolute inset-1 border border-[#3a2410]" />
        </div>
      </>
    );
  }

  if (facility === "vault") {
    return (
      <>
        {/* Vault door silhouette */}
        <div className="absolute bottom-16 left-2 w-24 h-32 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 40%, #2a1010 0%, #14080a 60%, #08020a 100%)",
            border: "2px solid #4a1a1a",
            borderRadius: "8px",
            boxShadow: "inset 0 0 18px rgba(0,0,0,0.8), 0 0 12px color-mix(in oklab, var(--neon-red) 40%, transparent)",
          }}>
          {/* bolts */}
          {[0,1,2,3,4,5,6,7].map(i => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <div key={i} className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  left: `${50 + Math.cos(a) * 38}%`, top: `${40 + Math.sin(a) * 32}%`,
                  background: "#7a3a3a", border: "1px solid #2a0a0a",
                }} />
            );
          })}
          {/* spinner wheel */}
          <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full"
            style={{
              background: "radial-gradient(circle, #5a2020, #2a0a0a)",
              border: "2px solid #7a3030",
              boxShadow: "inset 0 0 8px rgba(0,0,0,0.8)",
            }}>
            <div className="absolute inset-0 rounded-full border-t-2 border-[color:var(--neon-red)]"
              style={{ animation: "spin-fast 8s linear infinite" }} />
          </div>
        </div>
        {/* Red emergency strobe */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full pointer-events-none flicker"
          style={{ background: "var(--neon-red)", boxShadow: "0 0 30px var(--neon-red), 0 0 60px var(--neon-red)" }} />
        {/* Caution tape */}
        <div className="absolute top-2 left-0 right-0 h-2 opacity-60 pointer-events-none"
          style={{ background: "repeating-linear-gradient(135deg, #d4a020 0 10px, #1a1410 10px 16px)" }} />
      </>
    );
  }

  if (facility === "datacenter") {
    return (
      <>
        {/* Raised floor tiles */}
        <div className="absolute bottom-16 left-0 right-0 h-2 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(90deg, #1a2028 0 24px, #0a1018 24px 26px)",
            borderTop: "1px solid var(--neon-blue)",
            boxShadow: "0 -2px 14px color-mix(in oklab, var(--neon-blue) 40%, transparent)",
          }} />
        {/* Robot arm */}
        <svg className="absolute top-12 left-4 w-20 h-32 pointer-events-none" viewBox="0 0 80 128">
          <rect x="34" y="0" width="12" height="20" fill="#3a3a42" stroke="#000" />
          <line x1="40" y1="20" x2="40" y2="60" stroke="#5a5a62" strokeWidth="6" />
          <circle cx="40" cy="60" r="5" fill="#0a1828" stroke="#5a5a62" />
          <line x1="40" y1="60" x2="20" y2="100" stroke="#5a5a62" strokeWidth="5">
            <animateTransform attributeName="transform" type="rotate" from="0 40 60" to="20 40 60" dur="3s" repeatCount="indefinite" values="0 40 60;20 40 60;0 40 60" />
          </line>
          <rect x="14" y="98" width="12" height="6" fill="#7a7a82" />
          <circle cx="20" cy="104" r="2" fill="var(--neon-blue)" style={{ filter: "drop-shadow(0 0 4px var(--neon-blue))" }} />
        </svg>
        {/* Cooling pipes overhead */}
        <div className="absolute top-3 left-[10%] right-[10%] h-2 pointer-events-none"
          style={{ background: "linear-gradient(180deg, #4a5058, #1a1f24)", borderRadius: "2px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.6)" }} />
      </>
    );
  }

  if (facility === "quantum") {
    return (
      <>
        {/* Holographic torus */}
        <div className="absolute top-8 left-6 w-20 h-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--neon-purple) 30%, transparent) 0%, transparent 70%)",
            animation: "pulse-glow 3s ease-in-out infinite",
          }}>
          <div className="absolute inset-0 rounded-full border-2 border-[color:var(--neon-purple)] opacity-70"
            style={{ animation: "spin-fast 6s linear infinite" }} />
          <div className="absolute inset-3 rounded-full border border-[color:var(--neon-cyan)] opacity-60"
            style={{ animation: "spin-fast 4s linear reverse infinite" }} />
          <div className="absolute inset-0 flex items-center justify-center font-pixel text-[10px] text-neon-purple">Q</div>
        </div>
        {/* Floor energy lines */}
        <svg className="absolute bottom-16 left-0 right-0 h-12 w-full pointer-events-none" viewBox="0 0 800 48" preserveAspectRatio="none">
          <path d="M0 24 Q200 4 400 24 T800 24" stroke="var(--neon-purple)" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M0 30 Q200 50 400 30 T800 30" stroke="var(--neon-cyan)" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
        {/* Floating qubit nodes */}
        {[15, 50, 80].map((x, i) => (
          <div key={i} className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{
              left: `${x}%`, top: `${20 + i * 10}%`,
              background: "var(--neon-cyan)", boxShadow: "0 0 10px var(--neon-cyan)",
              animation: `dust-float ${4 + i}s linear ${i * 0.7}s infinite`,
            }} />
        ))}
      </>
    );
  }

  if (facility === "space") {
    return (
      <>
        {/* Star field */}
        <div className="absolute inset-0 pointer-events-none opacity-90"
          style={{
            background: "radial-gradient(2px 2px at 12% 18%, white, transparent), \
                         radial-gradient(1px 1px at 28% 64%, white, transparent), \
                         radial-gradient(2px 2px at 48% 22%, #aac8ff, transparent), \
                         radial-gradient(1px 1px at 71% 56%, white, transparent), \
                         radial-gradient(1.5px 1.5px at 85% 12%, white, transparent), \
                         radial-gradient(1px 1px at 92% 78%, #ffd28a, transparent)",
          }} />
        {/* Earth on horizon */}
        <div className="absolute bottom-12 -left-20 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 30% 30%, #4ab4e0 0%, #2060a0 40%, #0a2040 70%, transparent 75%)",
            boxShadow: "0 0 60px color-mix(in oklab, var(--neon-cyan) 40%, transparent)",
          }} />
        {/* Solar panel array */}
        <svg className="absolute top-6 right-2 w-32 h-20 pointer-events-none" viewBox="0 0 128 80">
          <rect x="60" y="36" width="8" height="6" fill="#5a5a62" />
          <rect x="0" y="20" width="56" height="40" fill="#1a2a4a" stroke="#3a4a6a" />
          <g stroke="#3a5a8a" strokeWidth="0.5">
            {Array.from({ length: 7 }).map((_, i) => <line key={i} x1={i * 8} y1="20" x2={i * 8} y2="60" />)}
            {Array.from({ length: 5 }).map((_, i) => <line key={i} x1="0" y1={20 + i * 10} x2="56" y2={20 + i * 10} />)}
          </g>
          <rect x="68" y="20" width="56" height="40" fill="#1a2a4a" stroke="#3a4a6a" />
          <g stroke="#3a5a8a" strokeWidth="0.5">
            {Array.from({ length: 7 }).map((_, i) => <line key={i} x1={68 + i * 8} y1="20" x2={68 + i * 8} y2="60" />)}
            {Array.from({ length: 5 }).map((_, i) => <line key={i} x1="68" y1={20 + i * 10} x2="124" y2={20 + i * 10} />)}
          </g>
        </svg>
      </>
    );
  }
  return null;
}