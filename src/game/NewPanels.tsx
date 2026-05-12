import { COOLER_MODELS, POWER_MODELS, ACHIEVEMENTS } from "./data";
import type { OwnedCooler, OwnedPower } from "./types";

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

/* ---------- COOLERS ---------- */
export function CoolersPanel({ btc, coolers, shelves, onBuy, onAssign, onUnassign, onSell }:
  { btc: number; coolers: OwnedCooler[]; shelves: number;
    onBuy: (id: string) => void; onAssign: (cid: string, shelf: number) => void;
    onUnassign: (cid: string) => void; onSell: (cid: string) => void }) {
  return (
    <div className="p-3 space-y-3">
      <h2 className="font-pixel text-[11px] text-neon-cyan">❄ COOLERS</h2>
      <div className="font-mono-pixel text-[13px] text-muted-foreground">
        One cooler per shelf. Higher tier = more heat removed = more hashrate.
      </div>

      {/* Shelf assignments */}
      <div className="metal-panel p-2 space-y-1">
        <div className="font-pixel text-[10px] text-neon-orange mb-1">SHELF SLOTS</div>
        {Array.from({ length: shelves }).map((_, s) => {
          const c = coolers.find(x => x.shelf === s);
          const m = c ? COOLER_MODELS.find(x => x.id === c.modelId) : null;
          return (
            <div key={s} className="flex items-center justify-between gap-2 px-2 py-1 border border-[color:var(--metal-dark)]"
              style={{ background: "rgba(0,0,0,0.4)" }}>
              <span className="font-pixel text-[9px] text-neon-cyan">SHELF {String(s+1).padStart(2,"0")}</span>
              {m ? (
                <>
                  <span className="font-mono-pixel text-[12px]" style={{ color: TIER_COLOR[m.tier] }}>{m.name} · −{m.cooling}°</span>
                  <button onClick={() => onUnassign(c!.id)} className="btn-cyber px-2 py-0.5 font-pixel text-[8px] text-neon-red">REMOVE</button>
                </>
              ) : (
                <span className="font-pixel text-[9px] text-muted-foreground">— EMPTY —</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Inventory */}
      <div className="metal-panel p-2">
        <div className="font-pixel text-[10px] text-neon-purple mb-1">INVENTORY ({coolers.filter(c=>c.shelf==null).length})</div>
        {coolers.filter(c => c.shelf == null).length === 0 ? (
          <div className="text-center py-2 font-pixel text-[8px] text-muted-foreground">— EMPTY — buy below</div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {coolers.filter(c => c.shelf == null).map(c => {
              const m = COOLER_MODELS.find(x => x.id === c.modelId)!;
              return (
                <div key={c.id} className="flex items-center gap-1 p-1 border border-[color:var(--metal-dark)]"
                  style={{ background: "rgba(0,0,0,0.4)" }}>
                  <span className="font-pixel text-[9px] flex-1" style={{ color: TIER_COLOR[m.tier] }}>{m.name}</span>
                  <span className="font-mono-pixel text-[11px] text-neon-cyan">−{m.cooling}°</span>
                  <select onChange={(e) => { if (e.target.value) onAssign(c.id, +e.target.value); }}
                    defaultValue=""
                    className="font-mono-pixel text-[11px] bg-black/60 border border-[color:var(--metal-dark)] px-1 py-0.5">
                    <option value="">→ shelf…</option>
                    {Array.from({ length: shelves }).map((_, s) => (
                      <option key={s} value={s}>S{s+1}</option>
                    ))}
                  </select>
                  <button onClick={() => onSell(c.id)} className="btn-cyber px-1.5 py-0.5 font-pixel text-[8px] text-neon-red">SELL</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shop */}
      <div className="space-y-2">
        <div className="font-pixel text-[10px] text-neon-orange">▶ SHOP</div>
        {COOLER_MODELS.map(m => {
          const can = btc >= m.basePrice;
          return (
            <div key={m.id} className="metal-panel p-2 flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center font-pixel text-[10px]"
                style={{ background: TIER_COLOR[m.tier], color: "#000" }}>❄</div>
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

/* ---------- GENERATORS ---------- */
export function GeneratorsPanel({ btc, powers, shelves, onBuy, onAssign, onUnassign, onSell }:
  { btc: number; powers: OwnedPower[]; shelves: number;
    onBuy: (id: string) => void; onAssign: (pid: string, shelf: number) => void;
    onUnassign: (pid: string) => void; onSell: (pid: string) => void }) {
  return (
    <div className="p-3 space-y-3">
      <h2 className="font-pixel text-[11px] text-neon-orange">⚡ GENERATORS</h2>
      <div className="font-mono-pixel text-[13px] text-muted-foreground">
        One PSU per shelf. If supplied power &lt; demand, hashrate drops fast.
      </div>
      <div className="metal-panel p-2 space-y-1">
        <div className="font-pixel text-[10px] text-neon-orange mb-1">SHELF SLOTS</div>
        {Array.from({ length: shelves }).map((_, s) => {
          const p = powers.find(x => x.shelf === s);
          const m = p ? POWER_MODELS.find(x => x.id === p.modelId) : null;
          return (
            <div key={s} className="flex items-center justify-between gap-2 px-2 py-1 border border-[color:var(--metal-dark)]"
              style={{ background: "rgba(0,0,0,0.4)" }}>
              <span className="font-pixel text-[9px] text-neon-cyan">SHELF {String(s+1).padStart(2,"0")}</span>
              {m ? (
                <>
                  <span className="font-mono-pixel text-[12px]" style={{ color: TIER_COLOR[m.tier] }}>{m.name} · {m.capacity}kW</span>
                  <button onClick={() => onUnassign(p!.id)} className="btn-cyber px-2 py-0.5 font-pixel text-[8px] text-neon-red">REMOVE</button>
                </>
              ) : (
                <span className="font-pixel text-[9px] text-neon-red">— NO POWER —</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="metal-panel p-2">
        <div className="font-pixel text-[10px] text-neon-purple mb-1">INVENTORY ({powers.filter(p=>p.shelf==null).length})</div>
        {powers.filter(p => p.shelf == null).length === 0 ? (
          <div className="text-center py-2 font-pixel text-[8px] text-muted-foreground">— EMPTY — buy below</div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {powers.filter(p => p.shelf == null).map(p => {
              const m = POWER_MODELS.find(x => x.id === p.modelId)!;
              return (
                <div key={p.id} className="flex items-center gap-1 p-1 border border-[color:var(--metal-dark)]"
                  style={{ background: "rgba(0,0,0,0.4)" }}>
                  <span className="font-pixel text-[9px] flex-1" style={{ color: TIER_COLOR[m.tier] }}>{m.name}</span>
                  <span className="font-mono-pixel text-[11px] text-neon-orange">{m.capacity}kW</span>
                  <select onChange={(e) => { if (e.target.value) onAssign(p.id, +e.target.value); }}
                    defaultValue=""
                    className="font-mono-pixel text-[11px] bg-black/60 border border-[color:var(--metal-dark)] px-1 py-0.5">
                    <option value="">→ shelf…</option>
                    {Array.from({ length: shelves }).map((_, s) => (
                      <option key={s} value={s}>S{s+1}</option>
                    ))}
                  </select>
                  <button onClick={() => onSell(p.id)} className="btn-cyber px-1.5 py-0.5 font-pixel text-[8px] text-neon-red">SELL</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="font-pixel text-[10px] text-neon-orange">▶ SHOP</div>
        {POWER_MODELS.map(m => {
          const can = btc >= m.basePrice;
          return (
            <div key={m.id} className="metal-panel p-2 flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center font-pixel text-[10px]"
                style={{ background: TIER_COLOR[m.tier], color: "#000" }}>⚡</div>
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
const COSMETIC_CATALOG = [
  { id: "skin-frame-bronze",  name: "Bronze Frame",      cat: "GPU Skin",   cost: 2 },
  { id: "skin-frame-silver",  name: "Silver Frame",      cat: "GPU Skin",   cost: 4 },
  { id: "skin-frame-gold",    name: "Gold Frame",        cat: "GPU Skin",   cost: 8 },
  { id: "skin-frame-neon",    name: "Neon Frame",        cat: "GPU Skin",   cost: 12 },
  { id: "skin-led-cyan",      name: "Cyan LEDs",         cat: "GPU LED",    cost: 3 },
  { id: "skin-led-purple",    name: "Purple LEDs",       cat: "GPU LED",    cost: 6 },
  { id: "skin-led-rainbow",   name: "Rainbow LEDs",      cat: "GPU LED",    cost: 15 },
  { id: "shelf-neon-blue",    name: "Blue Shelf Trim",   cat: "Shelf",      cost: 4 },
  { id: "shelf-neon-purple",  name: "Purple Shelf Trim", cat: "Shelf",      cost: 8 },
  { id: "bg-rain",            name: "Rainstorm BG",      cat: "Background", cost: 5 },
  { id: "bg-storm",           name: "Cyber Storm BG",    cat: "Background", cost: 10 },
  { id: "bg-aurora",          name: "Aurora BG",         cat: "Background", cost: 12 },
  { id: "bg-galaxy",          name: "Galaxy BG",         cat: "Background", cost: 20 },
  { id: "bg-vault",           name: "Vault BG",          cat: "Background", cost: 25 },
];

export function CosmeticsPanel({ tokens, unlocked }:
  { tokens: number; unlocked: Record<string, boolean> }) {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-[11px] text-neon-purple">◆ COSMETICS</h2>
        <span className="font-pixel text-[11px] text-neon-orange">◆ {tokens}</span>
      </div>
      <div className="font-mono-pixel text-[13px] text-muted-foreground">
        Earn ◆ tokens from achievements. Cosmetic-only — no stat boost.
      </div>
      {COSMETIC_CATALOG.map(c => {
        const owned = unlocked[c.id];
        return (
          <div key={c.id} className={`metal-panel p-2 flex items-center gap-2 ${owned ? "neon-frame" : ""}`}>
            <div className="w-6 h-6 flex items-center justify-center font-pixel text-[10px]"
              style={{ background: owned ? "var(--neon-green)" : "var(--metal-mid)", color: "#000" }}>◆</div>
            <div className="flex-1 min-w-0">
              <div className="font-pixel text-[10px] text-neon-cyan">{c.name}</div>
              <div className="font-mono-pixel text-[11px] text-muted-foreground">{c.cat}</div>
            </div>
            {owned ? (
              <span className="font-pixel text-[9px] text-neon-green">✓ UNLOCKED</span>
            ) : (
              <span className="font-pixel text-[9px] text-neon-purple">◆ {c.cost}</span>
            )}
          </div>
        );
      })}
      <div className="font-mono-pixel text-[11px] text-muted-foreground text-center pt-2">
        Direct purchase coming soon — for now unlock via achievements.
      </div>
    </div>
  );
}