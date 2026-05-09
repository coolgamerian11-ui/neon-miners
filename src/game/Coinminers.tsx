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
  const [shelves, setShelves] = useState(2);
  const [research, setResearch] = useState<Record<string, number>>({});
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [shake, setShake] = useState(false);
  const [pulseTick, setPulseTick] = useState(0);
  const [tickFloats, setTickFloats] = useState<Array<{ id: number; v: number }>>([]);
  const tickFloatId = useRef(0);
  const blockProgressRef = useRef(0);
  const [blockProgress, setBlockProgress] = useState(0);

  const shelfCapacity = shelves * 4;
  const shelfCost = 0.02 * Math.pow(1.8, shelves - 2);

  function buyShelf() {
    if (btc < shelfCost) return;
    setBtc(b => b - shelfCost);
    setShelves(s => s + 1);
    triggerShake();
  }
  function buyResearch(id: string, cost: number, max: number) {
    const lvl = research[id] ?? 0;
    if (lvl >= max || btc < cost) return;
    setBtc(b => b - cost);
    setResearch(r => ({ ...r, [id]: lvl + 1 }));
    triggerShake();
  }
  function claimMission(id: string, reward: number) {
    if (claimed[id]) return;
    setClaimed(c => ({ ...c, [id]: true }));
    setBtc(b => b + reward);
    triggerShake();
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 280);
  }

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
      const inc = stats.btcPerSec / 5;
      setBtc(b => b + inc);
      setPulseTick(p => p + 1);
      blockProgressRef.current = (blockProgressRef.current + 1) % 50;
      setBlockProgress(blockProgressRef.current);
      // spawn floating tick number occasionally
      if (Math.random() < 0.4 && inc > 0) {
        const id = ++tickFloatId.current;
        setTickFloats(f => [...f, { id, v: inc * 5 }]);
        setTimeout(() => setTickFloats(f => f.filter(x => x.id !== id)), 1400);
      }
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
    if (owned.length >= shelfCapacity) return;
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
    triggerShake();
  }

  const currentFacility = FACILITIES.find(f => f.id === facility)!;

  return (
    <div className={`relative min-h-screen w-screen overflow-x-hidden text-foreground flex flex-col ${shake ? "shake" : ""}`}
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
            <div key={pulseTick} className="stat-primary btc-text pulse-num relative">
              {fmtBtc(btc)}
              {/* Tick floats */}
              {tickFloats.map(f => (
                <span key={f.id} className="absolute left-full ml-1 top-0 font-pixel text-[10px] text-neon-green pointer-events-none whitespace-nowrap"
                  style={{ animation: "float-up 1.4s ease-out forwards" }}>
                  +₿{f.v.toFixed(6)}
                </span>
              ))}
            </div>
            {/* Next-block progress */}
            <div className="mt-1 h-1 w-32 bg-black/60 border border-[color:var(--metal-dark)] overflow-hidden">
              <div className="h-full" style={{
                width: `${(blockProgress / 50) * 100}%`,
                background: "linear-gradient(90deg, var(--btc-gold), var(--neon-orange))",
                boxShadow: "0 0 6px var(--btc-gold-glow)",
              }} />
            </div>
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

      {/* Radial flash on shake */}
      {shake && (
        <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center">
          <div className="w-[80vmin] h-[80vmin] rounded-full"
            style={{
              background: "radial-gradient(circle, color-mix(in oklab, var(--neon-cyan) 25%, transparent), transparent 60%)",
              animation: "radial-flash 280ms ease-out forwards",
            }} />
        </div>
      )}

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
        <main className="flex-1 p-3 min-w-0 relative min-h-[640px] lg:min-h-0">
          <RoomScene owned={owned} hashrate={stats.finalHash} heat={stats.finalHeat} shelves={shelves} />
        </main>

        {/* Right shop / panel */}
        <aside className="w-full lg:w-[360px] border-t lg:border-t-0 lg:border-l border-[color:var(--metal-light)] overflow-y-auto cyber-scroll max-h-[60vh] lg:max-h-none"
          style={{ background: "linear-gradient(180deg, #14141d, #0a0a12)" }}>
          {tab === "upgrades" ? (
            <UpgradePanel btc={btc} levels={upgrades} onBuy={buyUpgrade} />
          ) : tab === "facilities" ? (
            <FacilityPanel btc={btc} current={facility} onPick={setFacility} />
          ) : tab === "gpus" ? (
            <InventoryPanel owned={owned} shelves={shelves} shelfCost={shelfCost} btc={btc} onBuyShelf={buyShelf} />
          ) : tab === "shop" || tab === "home" ? (
            <ShopPanel btc={btc} onBuy={buyGpu} capacity={shelfCapacity} owned={owned.length} />
          ) : tab === "research" ? (
            <ResearchPanel btc={btc} levels={research} onBuy={buyResearch} />
          ) : tab === "missions" ? (
            <MissionsPanel btc={btc} owned={owned.length} hashrate={stats.finalHash} upgradesCount={Object.values(upgrades).reduce((a,b)=>a+b,0)} claimed={claimed} onClaim={claimMission} />
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

function ShopPanel({ btc, onBuy, capacity, owned }: { btc: number; onBuy: (id: string, e: React.MouseEvent) => void; capacity: number; owned: number }) {
  const full = owned >= capacity;
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-[11px] text-neon-cyan">▶ HARDWARE SHOP</h2>
        <span className="font-mono-pixel text-[12px] text-muted-foreground">slots {owned}/{capacity}</span>
      </div>
      {full && (
        <div className="px-2 py-1 font-pixel text-[9px] text-neon-red border border-[color:var(--neon-red)]"
          style={{ background: "rgba(40,5,5,0.5)" }}>
          ⚠ SHELVES FULL — buy a shelf in GPUs tab
        </div>
      )}
      {GPU_MODELS.map(m => {
        const can = btc >= m.basePrice && !full;
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

function InventoryPanel({ owned, shelves: shelvesCount, shelfCost, btc, onBuyShelf }:
  { owned: OwnedGpu[]; shelves: number; shelfCost: number; btc: number; onBuyShelf: () => void }) {
  const shelves: OwnedGpu[][] = [];
  for (let s = 0; s < shelvesCount; s++) shelves.push(owned.slice(s * 4, s * 4 + 4));
  const can = btc >= shelfCost;
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-[11px] text-neon-green">▦ GPU INVENTORY</h2>
        <span className="font-mono-pixel text-[12px] text-muted-foreground">{owned.length}/{shelvesCount * 4}</span>
      </div>
      <div className="metal-panel p-2 flex items-center justify-between">
        <div>
          <div className="font-pixel text-[10px] text-neon-orange">+ NEW SHELF</div>
          <div className="font-mono-pixel text-[12px] text-muted-foreground">+4 GPU slots</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-pixel text-[10px] btc-text">₿ {fmtBtc(shelfCost)}</span>
          <button onClick={onBuyShelf} disabled={!can}
            className="btn-buy px-3 py-1 font-pixel text-[10px] rounded-sm">BUY ▶</button>
        </div>
      </div>
      {shelves.map((row, ri) => (
        <div key={ri} className="relative">
          <div className="metal-panel p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel text-[9px] text-neon-cyan">SHELF {String(ri + 1).padStart(2, "0")}</span>
              <span className="font-mono-pixel text-[11px] text-muted-foreground">{row.length}/4</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => {
                const g = row[i];
                const m = g ? GPU_MODELS.find(x => x.id === g.modelId) : null;
                return (
                  <div key={i} className="relative h-[78px] flex items-center justify-center"
                    style={{
                      background: "linear-gradient(180deg, #0c0c12, #050507)",
                      border: "1px solid var(--metal-dark)",
                      boxShadow: "inset 0 0 8px black",
                    }}>
                    {m ? (
                      <div style={{ transform: "scale(0.72)" }}>
                        <PixelGpu model={m} idx={ri * 4 + i} />
                      </div>
                    ) : (
                      <div className="font-pixel text-[8px] text-neon-cyan/40">EMPTY</div>
                    )}
                    {m && (
                      <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 font-mono-pixel text-[10px]"
                        style={{ background: "rgba(0,0,0,0.7)", color: "var(--neon-cyan)" }}>
                        {m.name.split(" ")[0]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* shelf plank */}
          <div className="h-2 mx-1 -mt-px"
            style={{
              background: "linear-gradient(180deg, var(--metal-light), var(--metal-mid) 40%, #000)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.7)",
              borderLeft: "1px solid var(--metal-light)",
              borderRight: "1px solid var(--metal-light)",
            }} />
          {/* shelf brackets */}
          <div className="absolute left-0 top-2 bottom-2 w-1" style={{ background: "var(--metal-mid)" }} />
          <div className="absolute right-0 top-2 bottom-2 w-1" style={{ background: "var(--metal-mid)" }} />
        </div>
      ))}
    </div>
  );
}

function ComingSoonPanel({ name }: { name: string }) {
  return (
    <div className="p-6 text-center space-y-3">
      <div className="font-pixel text-[14px] text-neon-purple">{name.toUpperCase()}</div>
      <div className="font-mono-pixel text-[14px] text-muted-foreground">Module compiling…</div>
      <div className="mx-auto h-2 w-3/4 bg-black/60 border border-[color:var(--metal-dark)] overflow-hidden rounded-sm">
        <div className="h-full pulse-glow" style={{ width: "40%", background: "linear-gradient(90deg, var(--neon-purple), var(--neon-cyan))" }} />
      </div>
      <div className="font-mono-pixel text-[12px] text-neon-cyan/70">[ COMING SOON ]</div>
    </div>
  );
}

const RESEARCH = [
  { id: "asic",   name: "ASIC R&D",         desc: "+30% hash for ASIC tier",  base: 0.5,  max: 10, icon: "🧪" },
  { id: "quant",  name: "Quantum Theory",   desc: "Unlock quantum bonuses",   base: 2,    max: 8,  icon: "⚛" },
  { id: "neural", name: "Neural Optimizer", desc: "+12% global efficiency",   base: 0.8,  max: 12, icon: "🧠" },
  { id: "crypto", name: "CryptoMath",       desc: "+8% block reward",         base: 0.3,  max: 15, icon: "𝛴" },
  { id: "therm",  name: "Thermodynamics",   desc: "-10% heat output",         base: 0.4,  max: 12, icon: "🌡" },
  { id: "auto",   name: "Auto-Trader AI",   desc: "Sells dust auto",          base: 1.2,  max: 6,  icon: "📈" },
];

function ResearchPanel({ btc, levels, onBuy }:
  { btc: number; levels: Record<string, number>; onBuy: (id: string, cost: number, max: number) => void }) {
  return (
    <div className="p-3 space-y-2">
      <h2 className="font-pixel text-[11px] text-neon-purple">✦ RESEARCH LAB</h2>
      <div className="font-mono-pixel text-[12px] text-muted-foreground">
        Unlock long-term breakthroughs.
      </div>
      {RESEARCH.map(r => {
        const lvl = levels[r.id] ?? 0;
        const cost = r.base * Math.pow(1.7, lvl);
        const maxed = lvl >= r.max;
        const can = !maxed && btc >= cost;
        return (
          <div key={r.id} className="metal-panel p-2 relative">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[10px] text-neon-purple">{r.name}</div>
                <div className="font-mono-pixel text-[12px] text-muted-foreground">{r.desc}</div>
              </div>
              <div className="font-pixel text-[10px] text-neon-cyan">Lv.{lvl}/{r.max}</div>
            </div>
            <div className="mt-2 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${r.max}, 1fr)` }}>
              {Array.from({ length: r.max }).map((_, i) => (
                <div key={i} className="h-2"
                  style={{
                    background: i < lvl ? "var(--neon-purple)" : "rgba(0,0,0,0.5)",
                    boxShadow: i < lvl ? "0 0 4px var(--neon-purple)" : "inset 0 0 4px black",
                    border: "1px solid var(--metal-dark)",
                  }} />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-pixel text-[11px] btc-text">₿ {fmtBtc(cost)}</span>
              <button onClick={() => onBuy(r.id, cost, r.max)} disabled={!can}
                className="btn-buy px-3 py-1 font-pixel text-[10px] rounded-sm">
                {maxed ? "MAX" : "RESEARCH ✦"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MissionsPanel({ btc: _btc, owned, hashrate, upgradesCount, claimed, onClaim }:
  { btc: number; owned: number; hashrate: number; upgradesCount: number; claimed: Record<string, boolean>; onClaim: (id: string, reward: number) => void }) {
  const missions = [
    { id: "m1", name: "First Blood",     desc: "Own 3 GPUs",            target: 3,   progress: owned,         reward: 0.05, icon: "◈" },
    { id: "m2", name: "Rig Builder",     desc: "Own 8 GPUs",            target: 8,   progress: owned,         reward: 0.4,  icon: "▦" },
    { id: "m3", name: "Hash Hero",      desc: "Reach 10 TH/s",          target: 10,  progress: hashrate,      reward: 0.8,  icon: "⚡" },
    { id: "m4", name: "Tinkerer",       desc: "Buy 5 upgrades",         target: 5,   progress: upgradesCount, reward: 0.2,  icon: "⚙" },
    { id: "m5", name: "Scale Up",       desc: "Reach 100 TH/s",         target: 100, progress: hashrate,      reward: 4,    icon: "▲" },
    { id: "m6", name: "Mining Tycoon",  desc: "Own 20 GPUs",            target: 20,  progress: owned,         reward: 6,    icon: "♛" },
  ];
  return (
    <div className="p-3 space-y-2">
      <h2 className="font-pixel text-[11px] text-neon-orange">◈ MISSIONS</h2>
      <div className="font-mono-pixel text-[12px] text-muted-foreground">Complete to earn ₿ rewards.</div>
      {missions.map(m => {
        const pct = Math.min(100, (m.progress / m.target) * 100);
        const done = m.progress >= m.target;
        const isClaimed = claimed[m.id];
        return (
          <div key={m.id} className="metal-panel p-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[10px] text-neon-cyan">{m.name}</div>
                <div className="font-mono-pixel text-[12px] text-muted-foreground">{m.desc}</div>
              </div>
              <div className="font-pixel text-[10px] btc-text">+₿{fmtBtc(m.reward)}</div>
            </div>
            <div className="mt-2 h-2 bg-black/60 border border-[color:var(--metal-dark)] overflow-hidden">
              <div className="h-full" style={{
                width: `${pct}%`,
                background: done ? "linear-gradient(90deg, var(--neon-green), var(--btc-gold))"
                                 : "linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))",
                boxShadow: done ? "0 0 8px var(--neon-green)" : "0 0 4px var(--neon-cyan)",
              }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono-pixel text-[11px] text-muted-foreground">
                {Math.min(m.progress, m.target).toFixed(m.target < 10 ? 0 : 1)}/{m.target}
              </span>
              <button onClick={() => onClaim(m.id, m.reward)} disabled={!done || isClaimed}
                className="btn-buy px-3 py-1 font-pixel text-[10px] rounded-sm">
                {isClaimed ? "CLAIMED" : done ? "CLAIM ▶" : "LOCKED"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
