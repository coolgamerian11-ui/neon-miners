import { useEffect, useRef, useState } from "react";
import { PixelFan } from "./PixelSprites";

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
          style={{ left: `${c.x}%`, animation: `float-up ${c.d * 1.4}s steps(8, end) forwards` }}>
          ₿
        </div>
      ))}

      <div className="absolute top-0 right-20 w-32 h-64 pixel-light" />
      <div className="absolute left-2 bottom-20"><PixelFan size={34} color="var(--metal-light)" slow /></div>

      {[0, 0.8, 1.6].map(d => (
        <div key={d} className="absolute right-6 bottom-16 w-5 h-5 pixel-steam"
          style={{ animationDelay: `${d}s` }} />
      ))}

      {/* Flickering ceiling LED strip */}
      <div className="absolute top-3 left-[18%] right-[40%] h-[2px] flicker"
        style={{ background: "var(--neon-cyan)", boxShadow: "0 2px 0 color-mix(in oklab, var(--neon-cyan) 32%, transparent)" }} />
    </div>
  );
}