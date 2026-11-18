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
    background: "linear-gradient(180deg, #2a2218 32%, #1a140c 32% 72%, #0d0a06 72%)",
    accent: "var(--neon-orange)",
    glow:   "var(--btc-gold-glow)",
    floor:  "linear-gradient(180deg, #2a1f14 32%, #14100a 32%)",
    label:  "// GARAGE · zone 1",
  },
  basement: {
    background: "linear-gradient(180deg, #1a1820 32%, #0e0d14 32% 72%, #08070c 72%)",
    accent: "var(--neon-green)",
    glow:   "color-mix(in oklab, var(--neon-green) 60%, transparent)",
    floor:  "linear-gradient(180deg, #14141a 32%, #08080c 32%)",
    label:  "// BASEMENT · sublevel B2",
  },
  warehouse: {
    background: "linear-gradient(180deg, #14202a 32%, #0a1018 32% 72%, #050810 72%)",
    accent: "var(--neon-cyan)",
    glow:   "color-mix(in oklab, var(--neon-cyan) 60%, transparent)",
    floor:  "linear-gradient(180deg, #1a2028 32%, #0a0e14 32%)",
    label:  "// WAREHOUSE · sector 7",
  },
  vault: {
    background: "linear-gradient(180deg, #2a0a0e 32%, #14060a 32% 72%, #08030a 72%)",
    accent: "var(--neon-red)",
    glow:   "color-mix(in oklab, var(--neon-red) 70%, transparent)",
    floor:  "linear-gradient(180deg, #1a0a0c 32%, #08040a 32%)",
    label:  "// VAULT · clearance Δ",
  },
  datacenter: {
    background: "linear-gradient(180deg, #0a1828 32%, #061020 32% 72%, #03070f 72%)",
    accent: "var(--neon-blue)",
    glow:   "color-mix(in oklab, var(--neon-blue) 70%, transparent)",
    floor:  "linear-gradient(180deg, #0c1420 32%, #04070d 32%)",
    label:  "// DATA-CENTER · row A14",
  },
  quantum: {
    background: "linear-gradient(180deg, #1a0a2a 32%, #0e0418 32% 72%, #06020c 72%)",
    accent: "var(--neon-purple)",
    glow:   "color-mix(in oklab, var(--neon-purple) 80%, transparent)",
    floor:  "linear-gradient(180deg, #160a24 32%, #06020c 32%)",
    label:  "// QUANTUM-LAB · cell Q-1",
  },
  space: {
    background: "linear-gradient(180deg, #02030a 32%, #050818 32% 72%, #0a0218 72%)",
    accent: "var(--neon-cyan)",
    glow:   "color-mix(in oklab, var(--neon-cyan) 80%, transparent)",
    floor:  "linear-gradient(180deg, #0a1020 32%, #02030a 32%)",
    label:  "// ORBITAL · station COIN-1",
  },
};

export function getFacilityVisuals(id: string): FacilityVisuals {
  return FACILITY_VISUALS[id] ?? FACILITY_VISUALS.garage;
}

/** Per-facility decorative overlay layer (background props, foreground props). */
export function FacilityDecor({ facility }: { facility: string }) {

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
            background: "linear-gradient(180deg, #4a2818 32%, #2a1408 32%)",
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
            <div className="w-3 h-3 -mt-px mx-auto "
              style={{ background: "linear-gradient(180deg, var(--btc-gold) 60%, var(--neon-orange) 60%)", boxShadow: "2px 2px 0 var(--pixel-light)" }} />
          </div>
        ))}
        {/* Concrete pillar */}
        <div className="absolute top-0 bottom-16 left-[20%] w-6 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, #1a1a1f 32%, #2a2a30 32% 72%, #1a1a1f 72%)",
            border: "1px solid #0a0a0c",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.6)",
          }}>
          <div className="absolute top-4 left-0 right-0 h-px bg-black/50" />
          <div className="absolute bottom-8 left-0 right-0 h-px bg-black/50" />
        </div>
        {/* Mold/water stain */}
        <div className="absolute bottom-20 left-32 w-20 h-8 pointer-events-none opacity-50"
          style={{ background: "repeating-conic-gradient(#2a3a20 0 25%, transparent 0 50%) 0 0 / 4px 4px", clipPath: "polygon(0 55%,20% 55%,20% 25%,55% 25%,55% 40%,80% 40%,80% 65%,100% 65%,100% 100%,0 100%)" }} />
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
          style={{ background: "repeating-conic-gradient(#d4a020 0 25%, #1a1410 0 50%) 0 0 / 12px 12px" }} />
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
          style={{ background: "linear-gradient(180deg, #5a3a20 32%, #3a2410 32%)", border: "1px solid #1a1008" }}>
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
            background: "radial-gradient(circle at 50% 40%, #2a1010 32%, #14080a 32% 72%, #08020a 72%)",
            border: "2px solid #4a1a1a",
            
            boxShadow: "inset 0 0 18px rgba(0,0,0,0.8), 0 0 12px color-mix(in oklab, var(--neon-red) 40%, transparent)",
          }}>
          {/* bolts */}
          {[0,1,2,3,4,5,6,7].map(i => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <div key={i} className="absolute w-1.5 h-1.5 "
                style={{
                  left: `${50 + Math.cos(a) * 38}%`, top: `${40 + Math.sin(a) * 32}%`,
                  background: "#7a3a3a", border: "1px solid #2a0a0a",
                }} />
            );
          })}
          {/* spinner wheel */}
          <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 "
            style={{
              background: "linear-gradient(180deg, #5a2020 50%, #2a0a0a 50%)",
              border: "2px solid #7a3030",
              boxShadow: "inset 0 0 8px rgba(0,0,0,0.8)",
            }}>
            <div className="absolute inset-0  border-t-2 border-[color:var(--neon-red)]"
              style={{ animation: "pulse-soft 2s steps(1, end) infinite" }} />
          </div>
        </div>
        {/* Red emergency strobe */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3  pointer-events-none flicker"
          style={{ background: "var(--neon-red)", boxShadow: "0 0 30px var(--neon-red), 0 0 60px var(--neon-red)" }} />
        {/* Caution tape */}
        <div className="absolute top-2 left-0 right-0 h-2 opacity-60 pointer-events-none"
          style={{ background: "repeating-conic-gradient(#d4a020 0 25%, #1a1410 0 50%) 0 0 / 8px 8px" }} />
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
          <g className="pixel-arm" style={{ animationDelay: "-0.75s" }}>
            <path d="M40 60v16H30v12H20v12" stroke="#5a5a62" strokeWidth="6" fill="none" />
            <rect x="14" y="98" width="12" height="6" fill="#7a7a82" />
            <rect x="18" y="104" width="4" height="2" fill="var(--neon-blue)" />
          </g>
          <g className="pixel-arm" style={{ animationDelay: "-2.25s" }}>
            <path d="M40 60v12H26v8H14v12" stroke="#5a5a62" strokeWidth="6" fill="none" />
            <rect x="8" y="90" width="12" height="6" fill="#7a7a82" />
            <rect x="12" y="96" width="4" height="2" fill="var(--neon-blue)" />
          </g>
        </svg>
        {/* Cooling pipes overhead */}
        <div className="absolute top-3 left-[10%] right-[10%] h-2 pointer-events-none"
          style={{ background: "linear-gradient(180deg, #4a5058 32%, #1a1f24 32%)", borderRadius: "2px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.6)" }} />
      </>
    );
  }

  if (facility === "quantum") {
    return (
      <>
        <svg viewBox="0 0 40 40" className="absolute top-8 left-6 w-20 h-20 pointer-events-none" shapeRendering="crispEdges" aria-hidden="true">
          <path d="M14 2h12v3h7v4h4v7h3v8h-3v7h-4v4h-7v3H14v-3H7v-4H3v-7H0v-8h3V9h4V5h7z" fill="none" stroke="var(--neon-purple)" />
          <path d="M15 8h10v3h6v6h3v6h-3v6h-6v3H15v-3H9v-6H6v-6h3v-6h6z" fill="none" stroke="var(--neon-cyan)" className="pulse-glow" />
          <path d="M16 15h8v8h-8zm5 7v3h4" fill="none" stroke="var(--neon-purple)" />
        </svg>
        {/* Floor energy lines */}
        <svg className="absolute bottom-16 left-0 right-0 h-12 w-full pointer-events-none" viewBox="0 0 800 48" preserveAspectRatio="none">
          <path d="M0 24h80V18h100v-4h90v4h70v6h60v4h90v6h130v-6h100v-4h80" stroke="var(--neon-purple)" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M0 30h90v7h100v4h100v-5h110v-6h110v-6h110v-4h90v6h90" stroke="var(--neon-cyan)" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
        {/* Floating qubit nodes */}
        {[15, 50, 80].map((x, i) => (
          <div key={i} className="absolute w-1.5 h-1.5  pointer-events-none"
            style={{
              left: `${x}%`, top: `${20 + i * 10}%`,
              background: "var(--neon-cyan)", boxShadow: "0 0 10px var(--neon-cyan)",
              animation: `dust-float ${4 + i}s steps(8, end) ${i * 0.7}s infinite`,
            }} />
        ))}
      </>
    );
  }

  if (facility === "space") {
    return (
      <>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} className="absolute bg-foreground pulse-glow" style={{ top: `${(17 + i * 29) % 87}%`, left: `${(5 + i * 41) % 100}%`, width: i % 4 ? 2 : 4, height: i % 4 ? 2 : 4, animationDelay: `${i * -0.17}s` }} />
          ))}
        </div>
        <svg className="absolute bottom-12 -left-20 w-72 h-72 pointer-events-none" viewBox="0 0 48 48" shapeRendering="crispEdges" aria-hidden="true">
          <path d="M16 2h16v2h5v3h4v4h3v5h2v16h-2v5h-3v4h-4v3h-5v2H16v-2h-5v-3H7v-4H4v-5H2V16h2v-5h3V7h4V4h5z" fill="#164677" stroke="var(--neon-blue)" />
          <path d="M13 6h13v4h4v6h-6v4h-6v6h-5v-4H8v-7H5v-4h8zm16 21h6v3h5v7h-5v4H25v-6h4z" fill="#348579" />
          <path d="M7 14h4v-2h12v2h-7v3H7zm16 9h10v2h5v3H27v-2h-4zm-5 12h8v2h-8z" fill="#90b8bc" opacity="0.8" />
          <path d="M44 16h2v16h-2v5h-3v4h-4v3h-5v2H16v-2h-5v-3h21v-4h5v-6h4v-9h3z" fill="#0b253f" opacity="0.8" />
        </svg>
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