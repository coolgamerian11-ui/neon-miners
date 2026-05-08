import { useEffect, useMemo, useRef, useState } from "react";
import { GPU_MODELS, UPGRADES, FACILITIES, SIDEBAR } from "./data";
import type { OwnedGpu } from "./types";
import { PixelGpu } from "./PixelGpu";
import { RoomScene } from "./RoomScene";

const fmtBtc = (n: number) => {
  if (n >= 1000) return n.toFixed(2);
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(6);
};
const fmtHash = (n: number) => {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + " EH/s";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + " PH/s";
  return n.toFixed(2) + " TH/s";
};

const RARITY_COLOR: Record<string, string> = {
  Common: "var(--neon-blue)",
  Rare: "var(--neon-purple)",
  Epic: "var(--neon-orange)",
  Legendary: "var(--neon-green)",
  Mythic: "var(--neon-cyan)",
};

export function Coinminers() {
  const [btc, setBtc] = useState(0.05);
  const [owned, setOwned] = useState<OwnedGpu[]>([
    { id: "g1", modelId: "gtx750" },
  ]);
  const [upgrades, setUpgrades] = useState<Record<string, number>>({});
  const [facility, setFacility] = useState("garage");
  const [tab, setTab] = useState<string>("home");
  const [floats, setFloats] = useState<Array<{ id: number; x: number; y: number; v: number }>>([]);
  const floatId = useRef(0);
  const [marketPrice, setMarketPrice] = useState(67432);

  // Derived stats
  const stats = useMemo(() => {
    let hash = 0, power = 0, heat = 0;
    for (const g of owned) {
      const m = GPU_MODELS.find(x => x.id === g.modelId)!;
      hash += m.hashrate;
      power += m.power;
      heat += m.heat;
    }
    const fwLvl = upgrades["fw"] ?? 0;
    const overLvl = upgrades["over"] ?? 0;
    const coolLvl = upgrades["cool"] ?? 0;
    const psuLvl = upgrades["psu"] ?? 0;
    const netLvl = upgrades["net"] ?? 0;
    const aiLvl = upgrades["ai"] ?? 0;

    const hashMult = 1 + fwLvl * 0.10 + coolLvl * 0.15 + overLvl * 0.20 + aiLvl * 0.25;
    const rewardMult = 1 + netLvl * 0.05;
    const finalHash = hash * hashMult;
    const finalPower = power * Math.max(0.2, 1 - psuLvl * 0.08);
    const finalHeat = Math.max(15, heat * (1 - coolLvl * 0.04) + overLvl * 5 + 20);
    // BTC per second (small numbers, balanced)
    const btcPerSec = (finalHash * 0.000004 + 0.0000005) * rewardMult;
    const efficiency = finalPower > 0 ? Math.min(100, (finalHash / finalPower) * 6) : 0;
    return { finalHash, finalPower, finalHeat, btcPerSec, efficiency };
  }, [owned, upgrades]);

  // Idle income
  useEffect(() => {
    const t = setInterval(() => {
      setBtc(b => b + stats.btcPerSec / 5);
    }, 200);
    return () => clearInterval(t);
  }, [stats.btcPerSec]);

  // Market ticker fluctuation
  useEffect(() => {
    const t = setInterval(() => {
      setMarketPrice(p => Math.round(p + (Math.random() - 0.5) * 220));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  // Auto-unlock facilities by btc
  useEffect(() => {
    const best = [...FACILITIES].reverse().find(f => btc >= f.unlockBtc);
    if (best && best.id !== facility && FACILITIES.findIndex(f=>f.id===best.id) > FACILITIES.findIndex(f=>f.id===facility)) {
      // don't auto-jump, but allow buy
    }
  }, [btc, facility]);

  function buyGpu(modelId: string, e?: React.MouseEvent) {
    const m = GPU_MODELS.find(x => x.id === modelId)!;
    if (btc < m.basePrice) return;
    setBtc(b => b - m.basePrice);
    setOwned(o => [...o, { id: `g${Date.now()}-${Math.random()}`, modelId }]);
    if (e) {
      const id = ++floatId.current;
      setFloats(f => [...f, { id, x: e.clientX, y: e.clientY, v: 1 }]);
      setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 1000);
    }
  }

  function buyUpgrade(id: string) {
    const u = UPGRADES.find(x => x.id === id)!;
    const lvl = upgrades[id] ?? 0;
    if (u.max && lvl >= u.max) return;
    const cost = u.basePrice * Math.pow(1.5, lvl);
    if (btc < cost) return;
    setBtc(b => b - cost);
    setUpgrades(u2 => ({ ...u2, [id]: lvl + 1 }));
  }

  const currentFacility = FACILITIES.find(f => f.id === facility)!;

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden text-foreground flex flex-col"
      style={{ background: "radial-gradient(ellipse at center top, #1a1828, #0a0a12 70%)" }}>
      {/* Top HUD bar */}
      <header className="relative z-30 flex items-stretch flex-wrap border-b border-[color:var(--metal-light)] shrink-0"
        style={{ background: "linear-gradient(180deg, #1a1a25, #0c0c14)" }}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 border-r border-[color:var(--metal-light)] min-w-[200px]">
          <div className="relative w-8 h-8 flex items-center justify-center rounded-sm"
            style={{ background: "linear-gradient(135deg, var(--btc-gold), #aa6f1a)", boxShadow: "0 0 14px var(--btc-gold-glow)" }}>
            <span className="font-pixel text-black text-sm">₿</span>
          </div>
          <div>
            <div className="font-pixel text-[12px] text-neon-cyan leading-none">COIN<span className="text-neon-orange">MINERS</span></div>
            <div className="font-mono-pixel text-[11px] text-muted-foreground leading-none mt-0.5">v1.0 // mainnet</div>
          </div>
        </div>

        {/* BTC balance */}
        <div className="flex items-center gap-3 px-5 border-r border-[color:var(--metal-light)]">
          <span className="font-pixel text-xl btc-text pulse-glow">₿</span>
          <div>
            <div className="font-pixel text-[10px] text-muted-foreground">BALANCE</div>
            <div className="font-pixel text-base btc-text">{fmtBtc(btc)}</div>
          </div>
        </div>

        {/* Hashrate */}
        <Stat label="HASHRATE" value={fmtHash(stats.finalHash)} color="var(--neon-cyan)" />
        <Stat label="POWER" value={`${stats.finalPower.toFixed(2)} kW`} color="var(--neon-orange)" />
        <Stat label="HEAT" value={`${stats.finalHeat.toFixed(0)}°C`} color={stats.finalHeat > 70 ? "var(--neon-red)" : "var(--neon-green)"} />
        <Stat label="EFF" value={`${stats.efficiency.toFixed(0)}%`} color="var(--neon-green)" />
        <Stat label="BTC/s" value={stats.btcPerSec.toFixed(6)} color="var(--btc-gold)" />

        {/* Live market ticker */}
        <div className="flex-1 overflow-hidden border-l border-[color:var(--metal-light)] flex items-center"
          style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="ticker-track text-[14px] font-mono-pixel">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="inline-flex gap-8">
                <span className="text-neon-cyan">BTC ${marketPrice.toLocaleString()}</span>
                <span className="text-neon-green">▲ ETH $3,421</span>
                <span className="text-neon-orange">▼ DOGE $0.142</span>
                <span className="text-neon-purple">▲ SOL $189</span>
                <span className="text-neon-cyan">DIFF 73.2T</span>
                <span className="text-neon-green">POOL 184 EH/s</span>
                <span className="text-neon-orange">FEE 18 sat/vB</span>
                <span className="text-neon-cyan">BLOCK 877,341</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-full lg:w-[180px] flex lg:flex-col gap-1 p-2 border-b lg:border-b-0 lg:border-r border-[color:var(--metal-light)] overflow-x-auto cyber-scroll shrink-0"
          style={{ background: "linear-gradient(180deg, #14141d, #0a0a12)" }}>
          {SIDEBAR.map(s => (
            <button key={s.id}
              onClick={() => setTab(s.id)}
              className={`btn-cyber ${tab === s.id ? "active" : ""} text-left px-3 py-2 font-pixel text-[10px] flex items-center gap-2 rounded-sm shrink-0 whitespace-nowrap`}>
              <span className="text-base leading-none w-5">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
          <div className="hidden lg:block mt-auto metal-panel p-2 text-[10px]">
            <div className="font-pixel text-neon-cyan mb-1">FACILITY</div>
            <div className="font-mono-pixel text-base text-neon-orange">{currentFacility.name}</div>
            <div className="font-mono-pixel text-muted-foreground">cap {owned.length}/{currentFacility.capacity}</div>
          </div>
        </aside>

        {/* Center scene */}
        <main className="flex-1 p-3 min-w-0 relative min-h-[420px] lg:min-h-0">
          <RoomScene owned={owned} hashrate={stats.finalHash} heat={stats.finalHeat} />
        </main>

        {/* Right shop / panel */}
        <aside className="w-full lg:w-[360px] border-t lg:border-t-0 lg:border-l border-[color:var(--metal-light)] overflow-y-auto cyber-scroll max-h-[60vh] lg:max-h-none"
          style={{ background: "linear-gradient(180deg, #14141d, #0a0a12)" }}>
          {tab === "upgrades" ? (
            <UpgradePanel btc={btc} levels={upgrades} onBuy={buyUpgrade} />
          ) : tab === "facilities" ? (
            <FacilityPanel btc={btc} current={facility} onPick={setFacility} />
          ) : tab === "gpus" ? (
            <InventoryPanel owned={owned} />
          ) : tab === "shop" || tab === "home" ? (
            <ShopPanel btc={btc} onBuy={buyGpu} />
          ) : (
            <ComingSoonPanel name={SIDEBAR.find(s => s.id === tab)?.label ?? "Section"} />
          )}
        </aside>
      </div>

      {/* Bottom HUD */}
      <div className="h-7 border-t border-[color:var(--metal-light)] flex items-center px-3 gap-4 text-[12px] font-mono-pixel overflow-x-auto whitespace-nowrap shrink-0"
        style={{ background: "linear-gradient(180deg, #0c0c14, #06060a)" }}>
        <span className="text-neon-green">● ONLINE</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-neon-cyan">RIGS {owned.length}</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-neon-orange">UPGRADES {Object.values(upgrades).reduce((a,b)=>a+b,0)}</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-neon-purple">PRESTIGE Lv.0</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-neon-green">NET 1.2 Gbps</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-neon-cyan">POOL: NeonPool</span>
        <span className="ml-auto text-muted-foreground">CPU 22% · MEM 1.4G · UPTIME 04:21:55</span>
      </div>

      {/* Floating BTC pickups */}
      {floats.map(f => (
        <div key={f.id} className="fixed pointer-events-none btc-text font-pixel text-sm"
          style={{ left: f.x, top: f.y, animation: "float-btc 1s ease-out forwards" }}>
          +₿{f.v.toFixed(4)}
        </div>
      ))}

      {/* Global scanline */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-40"
        style={{
          background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 4px)",
          mixBlendMode: "multiply",
        }} />
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-4 border-r border-[color:var(--metal-light)]">
      <div>
        <div className="font-pixel text-[9px] text-muted-foreground">{label}</div>
        <div className="font-pixel text-[12px]" style={{ color, textShadow: `0 0 6px ${color}` }}>{value}</div>
      </div>
    </div>
  );
}

function ShopPanel({ btc, onBuy }: { btc: number; onBuy: (id: string, e: React.MouseEvent) => void }) {
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-[11px] text-neon-cyan">▶ HARDWARE SHOP</h2>
        <span className="font-mono-pixel text-[12px] text-muted-foreground">{GPU_MODELS.length} units</span>
      </div>
      {GPU_MODELS.map(m => {
        const can = btc >= m.basePrice;
        return (
          <div key={m.id} className="metal-panel p-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-1.5 py-0.5 font-pixel text-[8px]"
              style={{ background: RARITY_COLOR[m.rarity], color: "#000" }}>
              {m.rarity.toUpperCase()}
            </div>
            <div className="flex gap-3 items-start">
              <div className="shrink-0 -ml-1" style={{ transform: "scale(0.85)", transformOrigin: "top left" }}>
                <PixelGpu model={m} idx={0} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[10px] text-neon-cyan truncate">{m.name}</div>
                <div className="grid grid-cols-3 gap-1 mt-1.5 text-[12px] font-mono-pixel">
                  <Mini label="HASH" val={`${m.hashrate} TH`} c="var(--neon-cyan)" />
                  <Mini label="PWR"  val={`${m.power} kW`}  c="var(--neon-orange)" />
                  <Mini label="HEAT" val={`${m.heat}°`}    c="var(--neon-red)" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 gap-2">
              <div className="font-pixel text-[11px] btc-text">₿ {fmtBtc(m.basePrice)}</div>
              <button
                onClick={(e) => onBuy(m.id, e)}
                disabled={!can}
                className="btn-buy px-3 py-1 font-pixel text-[10px] rounded-sm">
                BUY ▶
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Mini({ label, val, c }: { label: string; val: string; c: string }) {
  return (
    <div className="px-1.5 py-0.5 rounded-sm" style={{ background: "rgba(0,0,0,0.45)", border: "1px solid var(--metal-dark)" }}>
      <div className="text-[8px] font-pixel text-muted-foreground leading-none">{label}</div>
      <div className="font-mono-pixel leading-tight" style={{ color: c, textShadow: `0 0 4px ${c}` }}>{val}</div>
    </div>
  );
}

function UpgradePanel({ btc, levels, onBuy }: { btc: number; levels: Record<string, number>; onBuy: (id: string) => void }) {
  return (
    <div className="p-3 space-y-2">
      <h2 className="font-pixel text-[11px] text-neon-orange">▲ UPGRADES</h2>
      {UPGRADES.map(u => {
        const lvl = levels[u.id] ?? 0;
        const cost = u.basePrice * Math.pow(1.5, lvl);
        const max = u.max && lvl >= u.max;
        const can = !max && btc >= cost;
        return (
          <div key={u.id} className="metal-panel p-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{u.icon}</span>
              <div className="flex-1">
                <div className="font-pixel text-[10px] text-neon-cyan">{u.name}</div>
                <div className="font-mono-pixel text-[12px] text-muted-foreground">{u.desc}</div>
              </div>
              <div className="font-pixel text-[10px] text-neon-orange">Lv.{lvl}{u.max ? `/${u.max}` : ""}</div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-black/60 rounded-sm overflow-hidden border border-[color:var(--metal-dark)]">
              <div className="h-full" style={{
                width: `${u.max ? (lvl / u.max) * 100 : Math.min(100, lvl * 5)}%`,
                background: "linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))",
                boxShadow: "0 0 6px var(--neon-cyan)",
              }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-pixel text-[11px] btc-text">₿ {fmtBtc(cost)}</span>
              <button onClick={() => onBuy(u.id)} disabled={!can}
                className="btn-buy px-3 py-1 font-pixel text-[10px] rounded-sm">
                {max ? "MAX" : "UPGRADE ▲"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FacilityPanel({ btc, current, onPick }: { btc: number; current: string; onPick: (id: string) => void }) {
  return (
    <div className="p-3 space-y-2">
      <h2 className="font-pixel text-[11px] text-neon-purple">▣ FACILITIES</h2>
      {FACILITIES.map(f => {
        const locked = btc < f.unlockBtc;
        const active = current === f.id;
        return (
          <button key={f.id} onClick={() => !locked && onPick(f.id)}
            className={`metal-panel p-3 w-full text-left ${active ? "neon-frame" : ""} ${locked ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="font-pixel text-[10px] text-neon-cyan">{f.name}</div>
              {active && <span className="font-pixel text-[9px] text-neon-orange">ACTIVE</span>}
              {locked && <span className="font-pixel text-[9px] text-neon-red">LOCKED</span>}
            </div>
            <div className="font-mono-pixel text-[12px] text-muted-foreground mt-0.5">{f.desc}</div>
            <div className="flex justify-between mt-2 font-mono-pixel text-[12px]">
              <span className="text-neon-green">cap {f.capacity}</span>
              <span className="btc-text font-pixel text-[10px]">unlock ₿{fmtBtc(f.unlockBtc)}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
