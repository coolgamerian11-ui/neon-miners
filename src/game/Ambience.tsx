import { useEffect, useRef, useState } from "react";

/** Drifting BTC particles, scanline sweep, dust shaft, oscillating wall fan, steam vent. */
export function Ambience({ active = true, intensity = 1 }: { active?: boolean; intensity?: number }) {
  const [coins, setCoins] = useState<Array<{ id: number; x: number; d: number }>>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      const id = ++idRef.current;
      const c = { id, x: 10 + Math.random() * 80, d: 1.2 + Math.random() * 0.8 };
      setCoins(p => [...p, c]);
      setTimeout(() => setCoins(p => p.filter(x => x.id !== id)), 2200);
    }, Math.max(400, 1400 / intensity));
    return () => clearInterval(t);
  }, [active, intensity]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden scan-sweep">
      {/* Floating BTC pixels */}
      {coins.map(c => (
        <div key={c.id}
          className="absolute bottom-16 font-pixel text-[10px] btc-text"
          style={{ left: `${c.x}%`, animation: `float-up ${c.d * 1.4}s ease-out forwards` }}>
          ₿
        </div>
      ))}

      {/* Light shaft from window with dust */}
      <div className="absolute top-0 right-20 w-32 h-72 opacity-40"
        style={{
          background: "linear-gradient(180deg, color-mix(in oklab, var(--neon-orange) 20%, transparent), transparent 70%)",
          transform: "skewX(-12deg)",
          mixBlendMode: "screen",
        }} />

      {/* Oscillating wall fan, bottom-left corner */}
      <div className="absolute left-2 bottom-20 w-8 h-8">
        <svg viewBox="-20 -20 40 40" width="32" height="32" overflow="visible">
          <circle r="18" fill="#0a0a0e" stroke="var(--metal-light)" strokeWidth="1" />
          <g className="osc-fan-blade">
            {[0,72,144,216,288].map(a => (
              <ellipse key={a} cx="0" cy="-9" rx="3" ry="8" fill="var(--metal-mid)"
                transform={`rotate(${a})`} />
            ))}
            <circle r="3" fill="var(--neon-orange)" />
          </g>
        </svg>
      </div>

      {/* Steam vent puffs, bottom-right */}
      {[0, 0.8, 1.6].map(d => (
        <div key={d} className="absolute right-6 bottom-16 w-4 h-4 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(200,210,230,0.45), transparent 70%)",
            animation: `steam 2.4s ease-out ${d}s infinite`,
          }} />
      ))}

      {/* Flickering ceiling LED strip */}
      <div className="absolute top-3 left-[18%] right-[40%] h-[2px] flicker"
        style={{ background: "var(--neon-cyan)", boxShadow: "0 0 8px var(--neon-cyan)" }} />
    </div>
  );
}