import { COOLER_MODELS, POWER_MODELS, ACHIEVEMENTS } from "./data";
import type { CosmeticsEquipped } from "./types";
import { PixelCooler } from "./PixelCooler";
import { PixelGenerator } from "./PixelGenerator";

const fmtBtc = (n: number) => {
  if (n >= 1000) return n.toFixed(2);
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(6);
};

const TIER_COLOR: Record<string, string> = {
  basic: "var(--neon-blue)",
  standard: "var(--neon-cyan)",
  advanced: "var(--neon-purple)",
  elite: "var(--neon-orange)",
  mythic: "var(--neon-green)",
};

/* ---------- SHELVES ---------- */
export function ShelvesPanel({ btc, shelves, maxShelves, shelfCost, capacity, onBuyShelf }:
  { btc: number; shelves: number; maxShelves: number; shelfCost: number; capacity: number; onBuyShelf: () => void }) {
  const can = btc >= shelfCost && shelves < maxShelves;
  const atMax = shelves >= maxShelves;
  return (
    <div className="p-3 space-y-3">
      <h2 className="font-pixel text-[11px] text-neon-cyan">▥ SHELVES</h2>
      <div className="font-mono-pixel text-[14px] text-muted-foreground">
        Each shelf adds 4 GPU slots, plus a slot for one cooler and one power supply.
      </div>
      <div className="metal-panel p-3 neon-frame">
        <div className="flex items-center justify-between mb-1">
          <span className="font-pixel text-[10px] text-neon-orange">CURRENT</span>
          <span className="font-pixel text-[14px] text-neon-cyan">{shelves} / {maxShelves}</span>
        </div>
        <div className="font-mono-pixel text-[12px] text-muted-foreground">
          Facility cap: {capacity} GPU slots ({maxShelves} shelves)
        </div>
      </div>
      <div className="metal-panel p-3">
        <div className="font-pixel text-[10px] text-neon-cyan mb-1">+ NEW SHELF</div>
        <div className="font-mono-pixel text-[12px] text-muted-foreground mb-3">
          Adds 4 GPU slots, 1 cooler slot, 1 power slot.
        </div>
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[12px] btc-text">₿ {fmtBtc(shelfCost)}</span>
          <button onClick={onBuyShelf} disabled={!can}
            className="btn-buy px-4 py-2 font-pixel text-[10px]">
            {atMax ? "MAX" : "BUY SHELF ▶"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- COOLERS (shop only) ---------- */
export function CoolersPanel({ btc, onBuy }:
  { btc: number; onBuy: (id: string) => void }) {
  return (
    <div className="p-3 space-y-3">
      <h2 className="font-pixel text-[11px] text-neon-cyan">❄ COOLERS</h2>
      <div className="font-mono-pixel text-[13px] text-muted-foreground">
        Buy coolers here — then drag from the bottom inventory dock onto a shelf's ❄ slot.
      </div>
      <div className="space-y-2">
        <div className="font-pixel text-[10px] text-neon-orange">▶ SHOP</div>
        {COOLER_MODELS.map(m => {
          const can = btc >= m.basePrice;
          return (
            <div key={m.id} className="metal-panel p-2 flex items-center gap-2">
              <PixelCooler model={m} size={36} />
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[10px]" style={{ color: TIER_COLOR[m.tier] }}>{m.name}</div>
                <div className="font-mono-pixel text-[12px] text-muted-foreground">−{m.cooling}° heat · {m.tier}</div>
              </div>
              <div className="font-pixel text-[10px] btc-text">₿{fmtBtc(m.basePrice)}</div>
              <button onClick={() => onBuy(m.id)} disabled={!can}
                className="btn-buy px-2 py-1 font-pixel text-[9px]">BUY</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- GENERATORS (shop only) ---------- */
export function GeneratorsPanel({ btc, onBuy }:
  { btc: number; onBuy: (id: string) => void }) {
  return (
    <div className="p-3 space-y-3">
      <h2 className="font-pixel text-[11px] text-neon-orange">⚡ GENERATORS</h2>
      <div className="font-mono-pixel text-[13px] text-muted-foreground">
        Buy generators here — drag from the bottom inventory dock onto a shelf's ⚡ slot.
      </div>
      <div className="space-y-2">
        <div className="font-pixel text-[10px] text-neon-orange">▶ SHOP</div>
        {POWER_MODELS.map(m => {
          const can = btc >= m.basePrice;
          return (
            <div key={m.id} className="metal-panel p-2 flex items-center gap-2">
              <PixelGenerator model={m} size={36} />
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[10px]" style={{ color: TIER_COLOR[m.tier] }}>{m.name}</div>
                <div className="font-mono-pixel text-[12px] text-muted-foreground">{m.capacity}kW · {m.tier}</div>
              </div>
              <div className="font-pixel text-[10px] btc-text">₿{fmtBtc(m.basePrice)}</div>
              <button onClick={() => onBuy(m.id)} disabled={!can}
                className="btn-buy px-2 py-1 font-pixel text-[9px]">BUY</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- ACHIEVEMENTS ---------- */
export function AchievementsPanel({ claimed, progress, onClaim }:
  { claimed: Record<string, boolean>; progress: (id: string) => number; onClaim: (id: string) => void }) {
  return (
    <div className="p-3 space-y-2">
      <h2 className="font-pixel text-[11px] text-neon-orange">★ ACHIEVEMENTS</h2>
      <div className="font-mono-pixel text-[13px] text-muted-foreground">
        Permanent — survive prestige. Reward: ◆ tokens + cosmetics.
      </div>
      {ACHIEVEMENTS.map(a => {
        const p = progress(a.id);
        const done = p >= a.target;
        const isClaimed = claimed[a.id];
        const pct = Math.min(100, (p / a.target) * 100);
        return (
          <div key={a.id} className="metal-panel p-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-pixel text-neon-orange">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[10px] text-neon-cyan">{a.name}</div>
                <div className="font-mono-pixel text-[12px] text-muted-foreground">{a.desc}</div>
              </div>
              <div className="font-pixel text-[9px] text-neon-purple text-right">
                ◆{a.reward.tokens ?? 0}
                {a.reward.cosmetic && <div className="text-[8px] text-neon-green">+SKIN</div>}
              </div>
            </div>
            <div className="mt-2 h-2 bg-black/60 border border-[color:var(--metal-dark)] overflow-hidden">
              <div className="h-full" style={{
                width: `${pct}%`,
                background: done ? "linear-gradient(90deg, var(--neon-green), var(--btc-gold))"
                                 : "linear-gradient(90deg, var(--neon-purple), var(--neon-cyan))",
                boxShadow: done ? "0 0 6px var(--neon-green)" : "none",
              }} />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono-pixel text-[11px] text-muted-foreground">
                {Math.min(p, a.target).toFixed(a.target < 10 ? 0 : 0)}/{a.target}
              </span>
              <button onClick={() => onClaim(a.id)} disabled={!done || isClaimed}
                className="btn-buy px-2 py-1 font-pixel text-[9px]">
                {isClaimed ? "✓ CLAIMED" : done ? "CLAIM ★" : "LOCKED"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- COSMETICS ---------- */
type CosmeticCat = "gpuFrame" | "gpuLed" | "shelfTrim" | "background";
export const COSMETIC_CATALOG: { id: string; name: string; cat: CosmeticCat; catLabel: string; cost: number; color: string }[] = [
  { id: "skin-frame-bronze",  name: "Bronze Frame",      cat: "gpuFrame",   catLabel: "GPU Frame", cost: 2,  color: "#b07a30" },
  { id: "skin-frame-silver",  name: "Silver Frame",      cat: "gpuFrame",   catLabel: "GPU Frame", cost: 4,  color: "#c0c4cc" },
  { id: "skin-frame-gold",    name: "Gold Frame",        cat: "gpuFrame",   catLabel: "GPU Frame", cost: 8,  color: "#e8c040" },
  { id: "skin-frame-neon",    name: "Neon Frame",        cat: "gpuFrame",   catLabel: "GPU Frame", cost: 12, color: "var(--neon-cyan)" },
  { id: "skin-led-cyan",      name: "Cyan LEDs",         cat: "gpuLed",     catLabel: "GPU LED",   cost: 3,  color: "var(--neon-cyan)" },
  { id: "skin-led-purple",    name: "Purple LEDs",       cat: "gpuLed",     catLabel: "GPU LED",   cost: 6,  color: "var(--neon-purple)" },
  { id: "skin-led-rainbow",   name: "Rainbow LEDs",      cat: "gpuLed",     catLabel: "GPU LED",   cost: 15, color: "var(--neon-green)" },
  { id: "shelf-neon-blue",    name: "Blue Shelf Trim",   cat: "shelfTrim",  catLabel: "Shelf",     cost: 4,  color: "var(--neon-blue)" },
  { id: "shelf-neon-purple",  name: "Purple Shelf Trim", cat: "shelfTrim",  catLabel: "Shelf",     cost: 8,  color: "var(--neon-purple)" },
  { id: "bg-rain",            name: "Rainstorm BG",      cat: "background", catLabel: "Background",cost: 5,  color: "#3060a0" },
  { id: "bg-storm",           name: "Cyber Storm BG",    cat: "background", catLabel: "Background",cost: 10, color: "var(--neon-purple)" },
  { id: "bg-aurora",          name: "Aurora BG",         cat: "background", catLabel: "Background",cost: 12, color: "var(--neon-green)" },
  { id: "bg-galaxy",          name: "Galaxy BG",         cat: "background", catLabel: "Background",cost: 20, color: "var(--neon-purple)" },
  { id: "bg-vault",           name: "Vault BG",          cat: "background", catLabel: "Background",cost: 25, color: "var(--neon-orange)" },
];

export function CosmeticsPanel({ tokens, unlocked, equipped, onBuy, onEquip, onUnequip }:
  { tokens: number; unlocked: Record<string, boolean>; equipped: CosmeticsEquipped;
    onBuy: (id: string) => void;
    onEquip: (cat: keyof CosmeticsEquipped, id: string) => void;
    onUnequip: (cat: keyof CosmeticsEquipped) => void; }) {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-[11px] text-neon-purple">◆ COSMETICS</h2>
        <span className="font-pixel text-[11px] text-neon-orange">◆ {tokens}</span>
      </div>
      <div className="font-mono-pixel text-[13px] text-muted-foreground">
        Earn ◆ from achievements or buy here. Equip one per category.
      </div>
      {COSMETIC_CATALOG.map(c => {
        const owned = !!unlocked[c.id];
        const isEquipped = equipped[c.cat] === c.id;
        const canBuy = !owned && tokens >= c.cost;
        return (
          <div key={c.id} className={`metal-panel p-2 flex items-center gap-2 ${isEquipped ? "neon-frame" : ""}`}>
            <div className="w-7 h-7 flex items-center justify-center font-pixel text-[10px]"
              style={{ background: c.color, color: "#000", border: "1px solid #000" }}>◆</div>
            <div className="flex-1 min-w-0">
              <div className="font-pixel text-[10px] text-neon-cyan truncate">{c.name}</div>
              <div className="font-mono-pixel text-[11px] text-muted-foreground">{c.catLabel}</div>
            </div>
            {!owned ? (
              <button onClick={() => onBuy(c.id)} disabled={!canBuy}
                className="btn-buy px-2 py-1 font-pixel text-[9px]">
                ◆ {c.cost}
              </button>
            ) : isEquipped ? (
              <button onClick={() => onUnequip(c.cat)} className="btn-cyber px-2 py-1 font-pixel text-[9px] text-neon-green">
                ✓ EQUIPPED
              </button>
            ) : (
              <button onClick={() => onEquip(c.cat, c.id)} className="btn-buy px-2 py-1 font-pixel text-[9px]">
                EQUIP
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}