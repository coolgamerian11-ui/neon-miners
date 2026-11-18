import { memo } from "react";
import type { OwnedGpu, OwnedCooler, OwnedPower, Carry, ShelfType } from "./types";
import { Ambience } from "./Ambience";
import { Clutter } from "./Clutter";
import { MiningRack, type RackTier } from "./MiningRack";
import { FacilityDecor, getFacilityVisuals } from "./FacilityTheme";

// Fixed, repeatable sprite placement keeps the skyline stable between mining ticks.
const dust = Array.from({ length: 18 }, (_, key) => ({ key, x: (key * 37 + 7) % 100, y: (key * 29 + 17) % 100, d: key * 0.37, s: 4 + key % 6 }));
const rain = Array.from({ length: 30 }, (_, key) => ({ key, x: (key * 43 + 3) % 100, d: (key * 7 % 20) / 10, s: 0.6 + key % 7 / 10 }));

/** Garage / facility room with deep environmental detail */
function RoomSceneInner({ owned, hashrate, heat, shelves = 2, facility = "garage",
  shelfTypes = [], coolers = [], powers = [], carry = null,
  onSlotClick, onCoolerSlotClick, onPowerSlotClick }: {
    owned: OwnedGpu[]; hashrate: number; heat: number; shelves?: number; facility?: string;
    shelfTypes?: ShelfType[]; coolers?: OwnedCooler[]; powers?: OwnedPower[];
    carry?: Carry | null;
    onSlotClick?: (s: number, i: number) => void;
    onCoolerSlotClick?: (s: number) => void;
    onPowerSlotClick?: (s: number) => void;
  }) {
  const perShelf = 4;
  const slots = shelves * perShelf;
  const filled = owned.slice(0, slots);
  const cableThickness = Math.min(6, 2 + Math.floor(owned.length * 0.15));
  const serverBlades = Math.min(40, 8 + Math.floor(hashrate * 0.2));
  const tier: RackTier =
    facility === "garage" || facility === "basement" ? "starter"
    : facility === "warehouse" || facility === "vault" ? "mid"
    : "endgame";
  const v = getFacilityVisuals(facility);
  return (
    <div className="relative w-full h-full overflow-hidden neon-frame"
      style={{ background: v.background }}>
      {/* Wall: concrete blocks + grid */}
      <div className="absolute inset-0 bg-grid opacity-40"
        style={{ filter: `hue-rotate(${facility === "vault" ? 320 : facility === "quantum" ? 280 : facility === "warehouse" ? 180 : 0}deg)` }} />
      <div className="absolute inset-0 pixel-wall opacity-80 pointer-events-none" />

      {/* BACKGROUND LAYER: server-wall silhouette behind shelves */}
      <div className="absolute inset-y-0 left-0 right-0 z-0 opacity-50 pointer-events-none">
        <div className="absolute left-2 top-12 bottom-20 w-[44%] grid grid-cols-4 gap-1 p-2"
          style={{ background: "linear-gradient(180deg, #07080d 50%, #0a0c12 50%)", border: "1px solid var(--metal-dark)" }}>
          {Array.from({ length: serverBlades }).map((_, i) => (
            <div key={i} className="h-3 relative"
              style={{ background: "linear-gradient(180deg,#1a1d24 30%,#0a0c12 30%)", border: "1px solid #000" }}>
              <span className="absolute right-0.5 top-0.5 w-1 h-1 "
                style={{
                  background: i % 3 === 0 ? "var(--neon-cyan)" : i % 3 === 1 ? "var(--neon-green)" : "var(--neon-orange)",
                  boxShadow: "0 0 3px currentColor",
                  animation: `blink-led ${1 + (i % 5) * 0.3}s steps(1, end) ${i * 0.1}s infinite`,
                }} />
            </div>
          ))}
        </div>
      </div>
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 60px)," +
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 90px)",
        }}
      />

      {/* Window with rainy city skyline */}
      <div className="absolute top-4 right-6 w-[220px] h-[140px] metal-panel p-1">
        <div className="relative w-full h-full overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0a0e1f 35%, #1a1532 35% 68%, #2a1820 68%)" }}>
          {/* Skyline buildings */}
          <svg viewBox="0 0 220 140" className="absolute inset-0 w-full h-full" shapeRendering="crispEdges">
            {[
              [10,70,18,70], [30,55,14,85], [46,40,22,100], [70,60,16,80],
              [88,30,18,110], [108,50,20,90], [130,25,16,115], [148,55,18,85],
              [168,38,22,102], [192,60,20,80],
            ].map(([x,y,w,h], i) => (
              <g key={i}>
                <rect x={x} y={y} width={w} height={h} fill="#0a0a10" />
                {Array.from({ length: Math.floor(h/8) }).map((_, r) =>
                  Array.from({ length: Math.floor(w/4) }).map((_, c) => (
                    <rect key={`${r}-${c}`} x={x + 1 + c * 4} y={y + 3 + r * 8} width="2" height="3"
                      fill={(i * 11 + r * 7 + c * 13) % 17 > 8 ? "#f0c060" : "#1a1a20"}
                      opacity={(i + r + c) % 3 > 0 ? 1 : 0.6} />
                  ))
                )}
              </g>
            ))}
            {/* Neon billboards */}
            <rect x="50" y="46" width="14" height="4" fill="var(--neon-cyan)" opacity="0.9" />
            <rect x="170" y="44" width="10" height="3" fill="var(--neon-purple)" />
          </svg>
          {/* Rain */}
          {rain.map(r => (
            <div key={r.key}
              className="absolute w-[2px] h-3"
              style={{
                left: `${r.x}%`, top: 0,
                background: "linear-gradient(180deg, transparent 0 30%, var(--neon-blue) 30% 75%, var(--neon-cyan) 75%)",
                opacity: 0.5,
                animation: `rain-fall ${r.s}s steps(14, end) ${r.d}s infinite`,
              }}
            />
          ))}
          {/* Window frame cross */}
          <div className="absolute inset-0 pointer-events-none border border-[color:var(--metal-light)]" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[color:var(--metal-light)]" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[color:var(--metal-light)]" />
        </div>
        <div className="absolute -bottom-2 left-2 right-2 h-2 metal-panel" />
      </div>

      {/* Wall posters */}
      <div className="absolute top-6 left-6 metal-panel p-2 flex flex-col gap-1 text-[10px]"
        style={{ width: 90 }}>
        <div className="font-pixel btc-text" style={{ fontSize: 9 }}>HODL</div>
        <div className="text-neon-orange font-mono-pixel">to the moon ↗</div>
        <div className="h-px bg-[color:var(--metal-light)]" />
        <div className="text-neon-cyan font-mono-pixel">21M MAX</div>
      </div>
      <div className="absolute top-32 left-4 text-[9px] font-mono-pixel text-yellow-300/70"
        style={{ width: 100, padding: 4, background: "rgba(60,50,20,0.8)" }}>
        NOTE:<br/>don't unplug<br/>rig #4 !!
      </div>
      <div className="absolute top-44 left-8 metal-panel px-1.5 py-1 flex items-center gap-1">
        <span className="led-blink inline-block w-1.5 h-1.5 "
          style={{ background: "var(--neon-red)", boxShadow: "0 0 6px var(--neon-red)" }} />
        <span className="text-[9px] font-pixel text-neon-red">ZONE 1</span>
      </div>

      {/* FOREGROUND: Hanging cables (sway). Thicker as more rigs are owned. */}
      <svg className="absolute top-0 left-0 right-0 h-32 w-full pointer-events-none z-30 cable-sway"
        shapeRendering="crispEdges" viewBox="0 0 800 120" preserveAspectRatio="none">
        <path d="M120 0v20h8v20h8v20h8v16h8v16h8v8" stroke="#000" strokeWidth={cableThickness} fill="none" />
        <path d="M120 0v20h8v20h8v20h8v16h8v16h8v8" stroke="var(--neon-orange)" strokeWidth="0.6" fill="none" opacity="0.4" />
        <path d="M280 0v16h8v16h8v32h-6v26" stroke="#1a1a1a" strokeWidth={cableThickness - 0.5} fill="none" />
        <path d="M520 0v24h8v20h8v20h8v20h8v16h8v5" stroke="#000" strokeWidth={cableThickness} fill="none" />
        <path d="M520 0v24h8v20h8v20h8v20h8v16h8v5" stroke="var(--neon-cyan)" strokeWidth="0.6" fill="none" opacity="0.4" />
        <path d="M620 0v20h-8v16h8v12h12v12h8v10" stroke="#1a1a1a" strokeWidth={cableThickness - 0.5} fill="none" />
        <path d="M380 0v16h-8v20h-8v24h8v12h8v16h10v12h10v10" stroke="#000" strokeWidth={cableThickness} fill="none" />
        <path d="M380 0v16h-8v20h-8v24h8v12h8v16h10v12h10v10" stroke="var(--neon-purple)" strokeWidth="0.6" fill="none" opacity="0.4" />
      </svg>

      {/* Pipes */}
      <div className="absolute top-0 left-0 right-0 h-2"
        style={{ background: "linear-gradient(180deg, #2a2a30 35%, #1a1a20 35%)" }} />
      <div className="absolute top-2 left-0 right-0 h-1 bg-black/60" />

      {/* Industrial lamp */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <div className="w-8 h-3 mx-auto bg-[color:var(--metal-mid)] border-x border-b border-[color:var(--metal-light)]" />
        <div className="w-12 h-2 -mt-px mx-auto bg-btc border-b-2 border-neon-orange" />
        <div className="w-40 h-44 -mt-1 mx-auto pointer-events-none flicker pixel-light" />
      </div>

      {/* Dust particles */}
      {dust.map(p => (
        <div key={p.key}
          className="absolute w-[2px] h-[2px] "
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            background: "rgba(255,210,140,0.7)",
            animation: `dust-float ${p.s}s steps(8, end) ${p.d}s infinite`,
          }}
        />
      ))}

      {/* Neon Bitcoin sign on wall */}
      <div className="absolute top-44 right-4 px-3 py-2 rounded-sm flicker"
        style={{
          background: "rgba(20,15,5,0.7)",
          border: "1px solid var(--btc-gold)",
          boxShadow: "2px 2px 0 color-mix(in oklab, var(--btc-gold) 35%, transparent)",
        }}>
        <div className="font-pixel btc-text text-sm">₿ BITCOIN</div>
      </div>

      {/* Tall vertical wall of separate shelves — scrolls if many */}
      <div className="absolute left-[46%] right-2 top-2 bottom-20 overflow-y-auto cyber-scroll z-10"
        style={{ scrollbarGutter: "stable" }}>
        <div className="flex flex-col gap-6 py-2 pr-2">
          {Array.from({ length: shelves }).map((_, si) => {
            const row = filled.slice(si * perShelf, si * perShelf + perShelf);
            const padded: (OwnedGpu | undefined)[] = Array.from({ length: perShelf }, (_, i) => row[i]);
            const sType: ShelfType = shelfTypes[si] ?? "standard";
            const cooler = coolers.find(c => c.shelf === si) ?? null;
            const power = powers.find(p => p.shelf === si) ?? null;
            return (
              <MiningRack key={si} index={si} perShelf={perShelf} row={padded}
                tier={tier} shelfType={sType}
                cooler={cooler} power={power} carry={carry}
                onSlotClick={onSlotClick}
                onCoolerSlotClick={onCoolerSlotClick}
                onPowerSlotClick={onPowerSlotClick} />
            );
          })}
        </div>
      </div>

      {/* Floor: cracked concrete + cables */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pixel-grain"
        style={{
          background: v.floor,
          borderTop: `1px solid ${v.accent}`,
          boxShadow: `0 -4px 16px color-mix(in oklab, ${v.accent} 30%, transparent)`,
        }}>
        <svg className="absolute inset-0 w-full h-full opacity-50">
          <path d="M0 30h120v-4h80v4h200v4h120v-2h280" stroke="#3a2a1a" strokeWidth="1" fill="none" />
          <path d="M0 50h160v-2h180v4h260v-2h600" stroke="#2a1a10" strokeWidth="1" fill="none" />
        </svg>
        {/* cables */}
        <svg className="absolute inset-0 w-full h-full">
          <path d="M40 4h32v6h40v8h80v-4h48v-2h100v6h180v-6h110v-4h150" stroke="#000" strokeWidth="3" fill="none" />
          <path d="M40 4h32v6h40v8h80v-4h48v-2h100v6h180v-6h110v-4h150" stroke="var(--neon-orange)" strokeWidth="0.8" fill="none" opacity="0.4" />
          <path d="M0 36h80v6h64v4h180v-8h76v-2h220v6h180" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
        {/* soda cans + tools */}
        <div className="absolute bottom-1 left-6 w-3 h-5 rounded-sm" style={{ background: "linear-gradient(180deg, #cc2222 30%, #661111 30%)" }} />
        <div className="absolute bottom-1 left-12 w-2.5 h-4 rounded-sm" style={{ background: "linear-gradient(180deg, #2266cc 30%, #113366 30%)" }} />
        <div className="absolute bottom-1 left-24 w-6 h-2 metal-panel" />
        <div className="absolute bottom-1 right-10 w-8 h-3 metal-panel" />
        {/* Facility label tag */}
        <div className="absolute -top-5 left-2 px-2 py-0.5 font-pixel text-[8px] pointer-events-none"
          style={{
            background: "rgba(0,0,0,0.6)",
            color: v.accent,
            border: `1px solid ${v.accent}`,
            textShadow: `0 0 4px ${v.accent}`,
          }}>
          {v.label}
        </div>
      </div>

      {/* Per-facility decor (workbench, vault door, robot arm, stars, etc.) */}
      <FacilityDecor facility={facility} />

      {/* Heat warning if too hot */}
      {heat > 70 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 font-pixel text-[10px] text-neon-red flicker"
          style={{ background: "rgba(40,5,5,0.8)", border: "1px solid var(--neon-red)" }}>
          ⚠ HEAT CRITICAL ⚠
        </div>
      )}

      {/* HUD overlay: hashrate equalizer */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-6 mt-12 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-1 pixel-meter"
            style={{
              animation: `equalizer ${0.8 + (i % 5) * 0.1}s steps(1, end) ${i * 0.05}s infinite`,
            }} />
        ))}
      </div>

      {/* Ambient layer (BTC particles, scanline sweep, fan, steam) */}
      <Ambience active intensity={Math.min(4, 1 + owned.length * 0.15)} />
      {/* Decorative clutter on the floor */}
      <Clutter />

      <div className="vignette" />
      <div className="crt-overlay" />
    </div>
  );
}

export const RoomScene = memo(RoomSceneInner);
