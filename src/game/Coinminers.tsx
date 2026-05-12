import { memo, useEffect, useMemo, useRef, useState } from "react";
import { GPU_MODELS, UPGRADES, FACILITIES, SIDEBAR, COOLER_MODELS, POWER_MODELS, ACHIEVEMENTS } from "./data";
import type { OwnedGpu, OwnedCooler, OwnedPower } from "./types";
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

const SAVE_KEY = "coinminers.save.v3";
const DAY_MS = 24 * 60 * 60 * 1000;

interface SaveState {
  btc: number;
  owned: OwnedGpu[];
  upgrades: Record<string, number>;
  facility: string;
  shelves: number;
  research: Record<string, number>;
  claimed: Record<string, boolean>;
  prestige: number;
  totalEarned: number;
  lastDaily: number;
  dailyStreak: number;
  lastPlayed: number;
  coolers: OwnedCooler[];
  powers: OwnedPower[];
  achievementsClaimed: Record<string, boolean>;
  cosmeticsUnlocked: Record<string, boolean>;
  tokens: number;
}

function loadSave(): Partial<SaveState> | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SAVE_KEY) : null;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function Coinminers() {
  // Defaults only on first render to keep SSR & client identical (avoids hydration mismatch).
  // Save is loaded inside an effect after mount.
  const [hydrated, setHydrated] = useState(false);
  const [btc, setBtc] = useState<number>(0.05);
  const [owned, setOwned] = useState<OwnedGpu[]>([
    { id: "g1", modelId: "gtx750", equipped: true },
  ]);
  const [upgrades, setUpgrades] = useState<Record<string, number>>({});
  const [facility, setFacility] = useState<string>("garage");
  const [tab, setTab] = useState<string>("home");
  const [floats, setFloats] = useState<Array<{ id: number; x: number; y: number; v: number }>>([]);
  const floatId = useRef(0);
  const [marketPrice, setMarketPrice] = useState(67432);
  const [shelves, setShelves] = useState<number>(2);
  const [research, setResearch] = useState<Record<string, number>>({});
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [prestige, setPrestige] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [lastDaily, setLastDaily] = useState<number>(0);
  const [dailyStreak, setDailyStreak] = useState<number>(0);
  const [offlineEarn, setOfflineEarn] = useState<number | null>(null);
  const [coolers, setCoolers] = useState<OwnedCooler[]>([]);
  const [powers, setPowers] = useState<OwnedPower[]>([]);
  const [achievementsClaimed, setAchievementsClaimed] = useState<Record<string, boolean>>({});
  const [cosmeticsUnlocked, setCosmeticsUnlocked] = useState<Record<string, boolean>>({});
  const [tokens, setTokens] = useState<number>(0);
  const [shake, setShake] = useState(false);
  const [pulseTick, setPulseTick] = useState(0);
  const [tickFloats, setTickFloats] = useState<Array<{ id: number; v: number }>>([]);
  const tickFloatId = useRef(0);
  const blockProgressRef = useRef(0);
  const [blockProgress, setBlockProgress] = useState(0);

  const currentFacility = FACILITIES.find(f => f.id === facility)!;
  const maxShelves = Math.floor(currentFacility.capacity / 4);
  const shelfCapacity = Math.min(shelves * 4, currentFacility.capacity);
  const shelfCost = 0.02 * Math.pow(1.55, shelves - 2);
  const facilityMult = currentFacility.mult ?? 1;
  const prestigeMult = 1 + prestige * 0.25;

  function buyShelf() {
    if (btc < shelfCost || shelves >= maxShelves) return;
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
    addBtc(reward);
    triggerShake();
  }

  function addBtc(n: number) {
    setBtc(b => b + n);
    if (n > 0) setTotalEarned(t => t + n);
  }

  function claimDaily() {
    const now = Date.now();
    if (now - lastDaily < DAY_MS) return;
    const streak = (now - lastDaily < DAY_MS * 2) ? Math.min(7, dailyStreak + 1) : 1;
    const reward = 0.02 * Math.pow(1.8, streak - 1) * (1 + prestige * 0.5);
    addBtc(reward);
    setLastDaily(now);
    setDailyStreak(streak);
    triggerShake();
  }

  function doPrestige() {
    // require enough lifetime earnings to gain at least 1 point
    const gain = Math.floor(Math.sqrt(totalEarned / 10));
    if (gain < 1) return;
    if (!confirm(`Prestige now? You will gain +${gain} prestige (+${gain * 25}% permanent income) but reset BTC, GPUs, shelves, upgrades & research.`)) return;
    setPrestige(p => p + gain);
    setBtc(0.05);
    setOwned([{ id: "g1", modelId: "gtx750", equipped: true }]);
    setUpgrades({});
    setShelves(2);
    setResearch({});
    setFacility("garage");
    setTotalEarned(0);
    // reset missions & shelf-equipped gear (achievements + cosmetics + tokens persist)
    setClaimed({});
    setCoolers([]);
    setPowers([]);
    triggerShake();
  }

  function resetSave() {
    if (!confirm("Wipe ALL progress? This cannot be undone.")) return;
    try { localStorage.removeItem(SAVE_KEY); } catch {}
    window.location.reload();
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 280);
  }

  // Derived stats
  const stats = useMemo(() => {
    // per-shelf hash/power/heat then apply per-shelf cooler / power
    let hash = 0, powerDemand = 0, heat = 0;
    const equipped = owned.filter(g => g.equipped);
    // group by shelf index using order in equipped list
    const perShelf: { hash: number; power: number; heat: number }[] = [];
    for (let i = 0; i < equipped.length; i++) {
      const m = GPU_MODELS.find(x => x.id === equipped[i].modelId)!;
      const s = Math.floor(i / 4);
      if (!perShelf[s]) perShelf[s] = { hash: 0, power: 0, heat: 0 };
      perShelf[s].hash += m.hashrate;
      perShelf[s].power += m.power;
      perShelf[s].heat += m.heat;
    }
    const fwLvl = upgrades["fw"] ?? 0;
    const overLvl = upgrades["over"] ?? 0;
    const coolLvl = upgrades["cool"] ?? 0;
    const psuLvl = upgrades["psu"] ?? 0;
    const netLvl = upgrades["net"] ?? 0;
    const aiLvl = upgrades["ai"] ?? 0;
    const immLvl = upgrades["imm"] ?? 0;
    const solarLvl = upgrades["solar"] ?? 0;
    const swarmLvl = upgrades["swarm"] ?? 0;
    const quantLvl = upgrades["quant"] ?? 0;
    const compressLvl = upgrades["compress"] ?? 0;
    const neuroLvl = upgrades["neuro"] ?? 0;
    const fusionLvl = upgrades["fusion"] ?? 0;

    const hashMult = 1 + fwLvl * 0.10 + coolLvl * 0.15 + overLvl * 0.20 + aiLvl * 0.25
                       + immLvl * 0.30 + quantLvl * 0.50 + neuroLvl * 0.20;
    const rewardMult = (1 + netLvl * 0.05) * (1 + swarmLvl * 0.15) * (1 + compressLvl * 0.08)
                       * facilityMult * prestigeMult;
    const powerReductionMult = Math.max(0.10, 1 - psuLvl * 0.08 - solarLvl * 0.12 - fusionLvl * 0.20);

    let totalHash = 0;
    for (let s = 0; s < perShelf.length; s++) {
      const sh = perShelf[s];
      // cooler on this shelf
      const cooler = coolers.find(c => c.shelf === s);
      const cm = cooler ? COOLER_MODELS.find(x => x.id === cooler.modelId) : null;
      const cooling = cm?.cooling ?? 0;
      const effHeat = Math.max(15, sh.heat - cooling + overLvl * 2 + 10);
      // heat penalty: above 60°C, hashrate drops
      const heatPenalty = effHeat <= 60 ? 1 : Math.max(0.20, 1 - (effHeat - 60) / 100);
      // power on this shelf
      const psu = powers.find(p => p.shelf === s);
      const pm = psu ? POWER_MODELS.find(x => x.id === psu.modelId) : null;
      const supplied = pm?.capacity ?? 0;
      const demand = sh.power * powerReductionMult;
      const powerPenalty = supplied <= 0 ? 0.4 : Math.min(1, supplied / Math.max(0.001, demand));
      // shelf hashrate
      totalHash += sh.hash * hashMult * heatPenalty * powerPenalty;
      hash += sh.hash;
      powerDemand += demand;
      heat += effHeat;
    }
    if (perShelf.length === 0) totalHash = 0;
    const avgHeat = perShelf.length ? heat / perShelf.length : 20;
    const btcPerSec = (totalHash * 0.00003 + 0.000005) * rewardMult;
    const efficiency = powerDemand > 0 ? Math.min(100, (totalHash / powerDemand) * 6) : 0;
    const totalSupplied = powers.reduce((acc, p) => {
      if (p.shelf == null) return acc;
      const pm = POWER_MODELS.find(x => x.id === p.modelId);
      return acc + (pm?.capacity ?? 0);
    }, 0);
    return { finalHash: totalHash, finalPower: powerDemand, finalHeat: avgHeat, btcPerSec, efficiency, totalSupplied };
  }, [owned, upgrades, facilityMult, prestigeMult, coolers, powers]);

  // Idle income
  useEffect(() => {
    if (!hydrated) return;
    const t = setInterval(() => {
      const inc = stats.btcPerSec / 5;
      addBtc(inc);
      setPulseTick(p => p + 1);
      blockProgressRef.current = (blockProgressRef.current + 1) % 50;
      setBlockProgress(blockProgressRef.current);
      // spawn floating tick number occasionally
      if (Math.random() < 0.25 && inc > 0) {
        const id = ++tickFloatId.current;
        setTickFloats(f => [...f, { id, v: inc * 5 }]);
        setTimeout(() => setTickFloats(f => f.filter(x => x.id !== id)), 1400);
      }
    }, 200);
    return () => clearInterval(t);
  }, [stats.btcPerSec, hydrated]);

  // Hydrate from localStorage AFTER mount (prevents SSR/client mismatch)
  useEffect(() => {
    const saved = loadSave();
    if (saved) {
      if (saved.btc != null) setBtc(saved.btc);
      if (saved.owned) setOwned(saved.owned);
      if (saved.upgrades) setUpgrades(saved.upgrades);
      if (saved.facility) setFacility(saved.facility);
      if (saved.shelves != null) setShelves(saved.shelves);
      if (saved.research) setResearch(saved.research);
      if (saved.claimed) setClaimed(saved.claimed);
      if (saved.prestige != null) setPrestige(saved.prestige);
      if (saved.totalEarned != null) setTotalEarned(saved.totalEarned);
      if (saved.lastDaily != null) setLastDaily(saved.lastDaily);
      if (saved.dailyStreak != null) setDailyStreak(saved.dailyStreak);
      if (saved.coolers) setCoolers(saved.coolers);
      if (saved.powers) setPowers(saved.powers);
      if (saved.achievementsClaimed) setAchievementsClaimed(saved.achievementsClaimed);
      if (saved.cosmeticsUnlocked) setCosmeticsUnlocked(saved.cosmeticsUnlocked);
      if (saved.tokens != null) setTokens(saved.tokens);
      if (saved.lastPlayed) {
        const dt = Math.min((Date.now() - saved.lastPlayed) / 1000, 8 * 3600);
        if (dt >= 30) {
          // Approximate offline earnings using saved snapshot's shape (we don't have stats yet)
          // Use a simple proxy based on owned GPUs.
          const equippedCount = (saved.owned ?? []).filter(g => g.equipped).length;
          const earned = equippedCount * 0.0005 * dt * 0.5;
          if (earned > 0.0001) {
            setBtc(b => b + earned);
            setTotalEarned(t => t + earned);
            setOfflineEarn(earned);
          }
        }
      }
    }
    setHydrated(true);
  }, []);

  // Auto-save (debounced via interval)
  useEffect(() => {
    if (!hydrated) return;
    const save = () => {
      try {
        const data: SaveState = {
          btc, owned, upgrades, facility, shelves, research, claimed,
          prestige, totalEarned, lastDaily, dailyStreak, lastPlayed: Date.now(),
          coolers, powers, achievementsClaimed, cosmeticsUnlocked, tokens,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      } catch {}
    };
    const t = setInterval(save, 4000);
    window.addEventListener("beforeunload", save);
    return () => { clearInterval(t); save(); window.removeEventListener("beforeunload", save); };
  }, [hydrated, btc, owned, upgrades, facility, shelves, research, claimed, prestige, totalEarned, lastDaily, dailyStreak, coolers, powers, achievementsClaimed, cosmeticsUnlocked, tokens]);

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
    setOwned(o => {
      const equippedCount = o.filter(x => x.equipped).length;
      const canEquip = equippedCount < shelfCapacity;
      return [...o, { id: `g${Date.now()}-${Math.random()}`, modelId, equipped: canEquip }];
    });
    if (e) {
      const id = ++floatId.current;
      setFloats(f => [...f, { id, x: e.clientX, y: e.clientY, v: 1 }]);
      setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 1000);
    }
  }

  function unequipGpu(id: string) {
    setOwned(o => o.map(g => g.id === id ? { ...g, equipped: false } : g));
  }
  function equipGpu(id: string) {
    setOwned(o => {
      const equippedCount = o.filter(x => x.equipped).length;
      if (equippedCount >= shelfCapacity) return o;
      return o.map(g => g.id === id ? { ...g, equipped: true } : g);
    });
  }
  function sellGpu(id: string) {
    const g = owned.find(x => x.id === id);
    if (!g) return;
    const m = GPU_MODELS.find(x => x.id === g.modelId);
    if (!m) return;
    setBtc(b => b + m.basePrice * 0.6);
    setOwned(o => o.filter(x => x.id !== id));
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

  function buyCooler(modelId: string) {
    const m = COOLER_MODELS.find(x => x.id === modelId)!;
    if (btc < m.basePrice) return;
    setBtc(b => b - m.basePrice);
    setCoolers(c => [...c, { id: `c${Date.now()}-${Math.random()}`, modelId, shelf: null }]);
  }
  function assignCooler(coolerId: string, shelf: number) {
    setCoolers(cs => {
      // unassign anything else on this shelf
      const cleared = cs.map(c => c.shelf === shelf ? { ...c, shelf: null } : c);
      return cleared.map(c => c.id === coolerId ? { ...c, shelf } : c);
    });
  }
  function unassignCooler(coolerId: string) {
    setCoolers(cs => cs.map(c => c.id === coolerId ? { ...c, shelf: null } : c));
  }
  function sellCooler(coolerId: string) {
    const c = coolers.find(x => x.id === coolerId);
    if (!c) return;
    const m = COOLER_MODELS.find(x => x.id === c.modelId);
    if (m) setBtc(b => b + m.basePrice * 0.6);
    setCoolers(cs => cs.filter(x => x.id !== coolerId));
  }

  function buyPower(modelId: string) {
    const m = POWER_MODELS.find(x => x.id === modelId)!;
    if (btc < m.basePrice) return;
    setBtc(b => b - m.basePrice);
    setPowers(p => [...p, { id: `p${Date.now()}-${Math.random()}`, modelId, shelf: null }]);
  }
  function assignPower(pid: string, shelf: number) {
    setPowers(ps => {
      const cleared = ps.map(p => p.shelf === shelf ? { ...p, shelf: null } : p);
      return cleared.map(p => p.id === pid ? { ...p, shelf } : p);
    });
  }
  function unassignPower(pid: string) {
    setPowers(ps => ps.map(p => p.id === pid ? { ...p, shelf: null } : p));
  }
  function sellPower(pid: string) {
    const p = powers.find(x => x.id === pid);
    if (!p) return;
    const m = POWER_MODELS.find(x => x.id === p.modelId);
    if (m) setBtc(b => b + m.basePrice * 0.6);
    setPowers(ps => ps.filter(x => x.id !== pid));
  }

  // Achievement progress + claim
  function achievementProgress(id: string): number {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (!a) return 0;
    switch (a.metric) {
      case "owned": return owned.length;
      case "hashrate": return stats.finalHash;
      case "upgrades": return Object.values(upgrades).reduce((s, n) => s + n, 0);
      case "shelves": return shelves;
      case "prestige": return prestige;
      case "totalEarned": return totalEarned;
      default: return 0;
    }
  }
  function claimAchievement(id: string) {
    if (achievementsClaimed[id]) return;
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (!a) return;
    if (achievementProgress(id) < a.target) return;
    setAchievementsClaimed(c => ({ ...c, [id]: true }));
    if (a.reward.tokens) setTokens(t => t + a.reward.tokens!);
    if (a.reward.cosmetic) setCosmeticsUnlocked(c => ({ ...c, [a.reward.cosmetic!]: true }));
    triggerShake();
  }

  // ALERT FLAGS
  const missionsList = useMemo(() => [
    { id: "m1",  target: 3,    progress: owned.length },
    { id: "m2",  target: 8,    progress: owned.length },
    { id: "m3",  target: 10,   progress: stats.finalHash },
    { id: "m4",  target: 5,    progress: Object.values(upgrades).reduce((a,b)=>a+b,0) },
    { id: "m5",  target: 100,  progress: stats.finalHash },
    { id: "m6",  target: 20,   progress: owned.length },
    { id: "m7",  target: 1000, progress: stats.finalHash },
    { id: "m8",  target: 5,    progress: shelves },
    { id: "m9",  target: 50,   progress: owned.length },
    { id: "m10", target: 1,    progress: prestige },
  ], [owned.length, stats.finalHash, upgrades, shelves, prestige]);
  const missionAlert = missionsList.some(m => m.progress >= m.target && !claimed[m.id]);
  const dailyAlert = Date.now() - lastDaily >= DAY_MS;
  const achievementsAlert = ACHIEVEMENTS.some(a => !achievementsClaimed[a.id] && achievementProgress(a.id) >= a.target);
  const alerts: Record<string, boolean> = {
    missions: missionAlert,
    daily: dailyAlert,
    achiev: achievementsAlert,
  };

  return (
    <div className={`relative h-screen w-screen overflow-hidden text-foreground flex flex-col ${shake ? "shake" : ""}`}
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
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-[180px] flex lg:flex-col gap-1 p-2 border-b lg:border-b-0 lg:border-r border-[color:var(--metal-light)] overflow-x-auto cyber-scroll shrink-0"
          style={{ background: "linear-gradient(180deg, #14141d, #0a0a12)" }}>
          {SIDEBAR.map(s => {
            const hasAlert = alerts[s.id];
            return (
              <button key={s.id}
                onClick={() => setTab(s.id)}
                className={`btn-cyber ${tab === s.id ? "active" : ""} relative text-left px-3 py-2 font-pixel text-[10px] flex items-center gap-2 rounded-sm shrink-0 whitespace-nowrap`}>
                <span className="text-base leading-none w-5">{s.icon}</span>
                <span>{s.label}</span>
                {hasAlert && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
                    style={{ background: "var(--neon-red)", boxShadow: "0 0 6px var(--neon-red)", animation: "blink-led 1s ease-in-out infinite" }} />
                )}
              </button>
            );
          })}
          {tokens > 0 && (
            <div className="hidden lg:block metal-panel px-2 py-1 text-[10px]">
              <div className="font-pixel text-neon-purple">◆ TOKENS</div>
              <div className="font-mono-pixel text-base text-neon-orange">{tokens}</div>
            </div>
          )}
          <div className="hidden lg:block mt-auto metal-panel p-2 text-[10px]">
            <div className="font-pixel text-neon-cyan mb-1">FACILITY</div>
            <div className="font-mono-pixel text-base text-neon-orange">{currentFacility.name}</div>
            <div className="font-mono-pixel text-muted-foreground">cap {owned.length}/{currentFacility.capacity}</div>
          </div>
        </aside>

        {/* Center scene */}
        <main className="flex-1 p-3 min-w-0 relative min-h-[640px] lg:min-h-0 overflow-y-auto cyber-scroll">
          <RoomScene owned={owned.filter(g => g.equipped)} hashrate={stats.finalHash} heat={stats.finalHeat} shelves={shelves} facility={facility} />
        </main>

        {/* Right shop / panel */}
        <aside className="w-full lg:w-[360px] border-t lg:border-t-0 lg:border-l border-[color:var(--metal-light)] overflow-y-auto cyber-scroll max-h-[55vh] lg:max-h-none lg:h-full"
          style={{ background: "linear-gradient(180deg, #14141d, #0a0a12)" }}>
          {tab === "upgrades" ? (
            <UpgradePanel btc={btc} levels={upgrades} onBuy={buyUpgrade} />
          ) : tab === "facilities" ? (
            <FacilityPanel btc={btc} current={facility} onPick={setFacility} />
          ) : tab === "gpus" ? (
            <InventoryPanel owned={owned} shelves={shelves} shelfCost={shelfCost} btc={btc}
              onBuyShelf={buyShelf} onEquip={equipGpu} onUnequip={unequipGpu} onSell={sellGpu} />
          ) : tab === "shop" || tab === "home" ? (
            <ShopPanel btc={btc} onBuy={buyGpu} capacity={shelfCapacity} owned={owned.filter(g=>g.equipped).length} stored={owned.filter(g=>!g.equipped).length} />
          ) : tab === "shelves" ? (
            <ShelvesPanel btc={btc} shelves={shelves} maxShelves={maxShelves} shelfCost={shelfCost}
              capacity={currentFacility.capacity} onBuyShelf={buyShelf} />
          ) : tab === "coolers" ? (
            <CoolersPanel btc={btc} coolers={coolers} shelves={shelves}
              onBuy={buyCooler} onAssign={assignCooler} onUnassign={unassignCooler} onSell={sellCooler} />
          ) : tab === "generators" ? (
            <GeneratorsPanel btc={btc} powers={powers} shelves={shelves}
              onBuy={buyPower} onAssign={assignPower} onUnassign={unassignPower} onSell={sellPower} />
          ) : tab === "achiev" ? (
            <AchievementsPanel claimed={achievementsClaimed} progress={achievementProgress} onClaim={claimAchievement} />
          ) : tab === "cosmetics" ? (
            <CosmeticsPanel tokens={tokens} unlocked={cosmeticsUnlocked} />
          ) : tab === "research" ? (
            <ResearchPanel btc={btc} levels={research} onBuy={buyResearch} />
          ) : tab === "missions" ? (
            <MissionsPanel btc={btc} owned={owned.length} hashrate={stats.finalHash} upgradesCount={Object.values(upgrades).reduce((a,b)=>a+b,0)} claimed={claimed} onClaim={claimMission} />
          ) : tab === "prestige" ? (
            <PrestigePanel prestige={prestige} totalEarned={totalEarned} onPrestige={doPrestige} onReset={resetSave} />
          ) : tab === "daily" ? (
            <DailyPanel lastDaily={lastDaily} streak={dailyStreak} prestige={prestige} onClaim={claimDaily} />
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
        <span className="text-neon-purple">PRESTIGE Lv.{prestige}</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-neon-green">×{(facilityMult * prestigeMult).toFixed(2)} mult</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-neon-green">NET 1.2 Gbps</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-neon-cyan">POOL: NeonPool</span>
        <span className="ml-auto text-muted-foreground">CPU 22% · MEM 1.4G · UPTIME 04:21:55</span>
      </div>

      {/* Offline earnings popup */}
      {offlineEarn !== null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70" onClick={() => setOfflineEarn(null)}>
          <div className="metal-panel p-6 max-w-sm text-center neon-frame" onClick={e => e.stopPropagation()}>
            <div className="font-pixel text-[14px] text-neon-cyan mb-2">◉ WELCOME BACK</div>
            <div className="font-mono-pixel text-[14px] text-muted-foreground mb-3">Your rigs kept mining (50% offline rate, capped at 8h).</div>
            <div className="font-pixel text-[18px] btc-text pulse-glow mb-4">+₿{fmtBtc(offlineEarn)}</div>
            <button onClick={() => setOfflineEarn(null)} className="btn-buy px-4 py-2 font-pixel text-[10px]">COLLECT ▶</button>
          </div>
        </div>
      )}

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

function ShopPanel({ btc, onBuy, capacity, owned, stored }: { btc: number; onBuy: (id: string, e: React.MouseEvent) => void; capacity: number; owned: number; stored: number }) {
  const full = owned >= capacity;
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-[11px] text-neon-cyan">▶ HARDWARE SHOP</h2>
        <span className="font-mono-pixel text-[12px] text-muted-foreground">rigged {owned}/{capacity} · stored {stored}</span>
      </div>
      {full && (
        <div className="px-2 py-1 font-pixel text-[9px] text-neon-orange border border-[color:var(--neon-orange)]"
          style={{ background: "rgba(40,20,5,0.5)" }}>
          ⚠ SHELVES FULL — new GPUs go to STORAGE
        </div>
      )}
      {GPU_MODELS.map(m => {
        const can = btc >= m.basePrice;
        return (
          <div key={m.id} className={`metal-panel p-2 relative overflow-hidden rarity-${m.rarity}`}>
            <div className="absolute top-0 right-0 px-1.5 py-0.5 font-pixel text-[8px]"
              style={{ background: RARITY_COLOR[m.rarity], color: "#000" }}>
              {m.rarity.toUpperCase()}
            </div>
            <div className="flex gap-3 items-start">
              <div className="shrink-0 -ml-1" style={{ transform: "scale(0.95)", transformOrigin: "top left" }}>
                <PixelGpu model={m} idx={0} large heatPct={Math.min(1, m.heat / 70)} />
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

function InventoryPanel({ owned, shelves: shelvesCount, shelfCost, btc, onBuyShelf, onEquip, onUnequip, onSell }:
  { owned: OwnedGpu[]; shelves: number; shelfCost: number; btc: number; onBuyShelf: () => void;
    onEquip: (id: string) => void; onUnequip: (id: string) => void; onSell: (id: string) => void }) {
  const equipped = owned.filter(g => g.equipped);
  const storage = owned.filter(g => !g.equipped);
  const capacity = shelvesCount * 4;
  const shelves: (OwnedGpu | undefined)[][] = [];
  for (let s = 0; s < shelvesCount; s++) {
    const row: (OwnedGpu | undefined)[] = [];
    for (let i = 0; i < 4; i++) row.push(equipped[s * 4 + i]);
    shelves.push(row);
  }
  const can = btc >= shelfCost;
  const slotsFull = equipped.length >= capacity;
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-[11px] text-neon-green">▦ GPU INVENTORY</h2>
        <span className="font-mono-pixel text-[12px] text-muted-foreground">rigged {equipped.length}/{capacity} · stored {storage.length}</span>
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
              <span className="font-mono-pixel text-[11px] text-muted-foreground">{row.filter(Boolean).length}/4</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => {
                const g = row[i];
                const m = g ? GPU_MODELS.find(x => x.id === g.modelId) : null;
                return (
                  <div key={i} className={`group relative h-[100px] flex items-center justify-center ${m ? `rarity-${m.rarity}` : ""}`}
                    style={{
                      background: "linear-gradient(180deg, #0c0c12, #050507)",
                      border: "1px solid var(--metal-dark)",
                      boxShadow: "inset 0 0 8px black",
                    }}>
                    {m ? (
                      <>
                        <div style={{ transform: "scale(0.78)" }}>
                          <PixelGpu model={m} idx={ri * 4 + i} heatPct={Math.min(1, m.heat / 70)} />
                        </div>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                          style={{ background: "rgba(0,0,0,0.78)" }}>
                          <button onClick={() => onUnequip(g!.id)}
                            className="btn-cyber px-2 py-1 font-pixel text-[8px] rounded-sm text-neon-orange">UNRIG</button>
                          <button onClick={() => onSell(g!.id)}
                            className="btn-cyber px-2 py-1 font-pixel text-[8px] rounded-sm text-neon-red">SELL</button>
                        </div>
                      </>
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

      {/* Storage / unrigged inventory */}
      <div className="metal-panel p-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-pixel text-[10px] text-neon-purple">▣ STORAGE</span>
          <span className="font-mono-pixel text-[11px] text-muted-foreground">{storage.length} unrigged</span>
        </div>
        {storage.length === 0 ? (
          <div className="text-center py-3 font-pixel text-[8px] text-neon-cyan/40">
            NO UNRIGGED GPUS · unrig from a shelf to store
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {storage.map(g => {
              const m = GPU_MODELS.find(x => x.id === g.modelId);
              if (!m) return null;
              return (
                <div key={g.id} className={`relative p-1 rarity-${m.rarity}`}
                  style={{
                    background: "linear-gradient(180deg, #0c0c12, #050507)",
                    border: "1px solid var(--metal-dark)",
                  }}>
                  <div className="flex items-center justify-center h-[68px]">
                    <div style={{ transform: "scale(0.55)" }}>
                      <PixelGpu model={m} idx={0} heatPct={Math.min(1, m.heat / 70)} />
                    </div>
                  </div>
                  <div className="font-mono-pixel text-[10px] text-neon-cyan truncate text-center mb-1">{m.name}</div>
                  <div className="flex gap-1">
                    <button onClick={() => onEquip(g.id)} disabled={slotsFull}
                      className="btn-buy flex-1 px-1 py-1 font-pixel text-[8px] rounded-sm">RIG</button>
                    <button onClick={() => onSell(g.id)}
                      className="btn-cyber px-2 py-1 font-pixel text-[8px] rounded-sm text-neon-red">SELL</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {slotsFull && storage.length > 0 && (
          <div className="mt-2 px-2 py-1 font-pixel text-[8px] text-neon-orange border border-[color:var(--neon-orange)]"
            style={{ background: "rgba(40,20,5,0.5)" }}>
            ⚠ shelves full — unrig or buy a shelf to deploy
          </div>
        )}
      </div>
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

function PrestigePanel({ prestige, totalEarned, onPrestige, onReset }:
  { prestige: number; totalEarned: number; onPrestige: () => void; onReset: () => void }) {
  const gain = Math.floor(Math.sqrt(totalEarned / 10));
  const can = gain >= 1;
  return (
    <div className="p-3 space-y-3">
      <h2 className="font-pixel text-[11px] text-neon-purple">♛ PRESTIGE CORE</h2>
      <div className="metal-panel p-3 neon-frame">
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[10px] text-neon-cyan">CURRENT</span>
          <span className="font-pixel text-[14px] text-neon-purple pulse-glow">Lv.{prestige}</span>
        </div>
        <div className="font-mono-pixel text-[12px] text-muted-foreground mt-1">
          +{prestige * 25}% permanent income · +{prestige * 50}% daily reward
        </div>
      </div>
      <div className="metal-panel p-3">
        <div className="font-pixel text-[10px] text-neon-orange mb-1">RESET FOR PRESTIGE</div>
        <div className="font-mono-pixel text-[12px] text-muted-foreground mb-2">
          Wipe BTC, GPUs, shelves, upgrades & research in exchange for permanent multipliers.
        </div>
        <div className="grid grid-cols-2 gap-2 text-[12px] font-mono-pixel mb-3">
          <div className="px-2 py-1" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid var(--metal-dark)" }}>
            <div className="text-[9px] font-pixel text-muted-foreground">LIFETIME ₿</div>
            <div className="btc-text">{fmtBtc(totalEarned)}</div>
          </div>
          <div className="px-2 py-1" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid var(--metal-dark)" }}>
            <div className="text-[9px] font-pixel text-muted-foreground">GAIN</div>
            <div className="text-neon-purple">+{gain} prestige</div>
          </div>
        </div>
        <button onClick={onPrestige} disabled={!can}
          className="btn-buy w-full px-3 py-2 font-pixel text-[10px]">
          {can ? "PRESTIGE ♛" : `EARN ₿${(10 * Math.pow(prestige + 1, 2)).toFixed(0)}+ TO PRESTIGE`}
        </button>
      </div>
      <div className="metal-panel p-3">
        <div className="font-pixel text-[10px] text-neon-red mb-1">DANGER ZONE</div>
        <div className="font-mono-pixel text-[12px] text-muted-foreground mb-2">Wipe save file completely.</div>
        <button onClick={onReset}
          className="btn-cyber w-full px-3 py-2 font-pixel text-[9px] text-neon-red border-[color:var(--neon-red)]">
          WIPE SAVE
        </button>
      </div>
    </div>
  );
}

function DailyPanel({ lastDaily, streak, prestige, onClaim }:
  { lastDaily: number; streak: number; prestige: number; onClaim: () => void }) {
  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const ready = now - lastDaily >= DAY;
  const next = Math.max(0, DAY - (now - lastDaily));
  const hh = Math.floor(next / 3600000);
  const mm = Math.floor((next % 3600000) / 60000);
  const ss = Math.floor((next % 60000) / 1000);
  const reward = (s: number) => 0.02 * Math.pow(1.8, s - 1) * (1 + prestige * 0.5);
  return (
    <div className="p-3 space-y-3">
      <h2 className="font-pixel text-[11px] text-neon-cyan">◉ DAILY REWARD</h2>
      <div className="metal-panel p-3 text-center neon-frame">
        <div className="font-pixel text-[10px] text-neon-orange mb-1">STREAK</div>
        <div className="font-pixel text-[20px] btc-text pulse-glow">{streak} / 7</div>
        <div className="font-mono-pixel text-[12px] text-muted-foreground mt-2">
          {ready ? "Reward ready to claim!" : `Next in ${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => {
          const day = i + 1;
          const claimed = day <= streak;
          return (
            <div key={i} className={`metal-panel p-1 text-center ${claimed ? "rarity-Legendary" : ""}`}>
              <div className="font-pixel text-[8px] text-muted-foreground">D{day}</div>
              <div className="font-mono-pixel text-[10px] btc-text">₿{reward(day).toFixed(3)}</div>
              {claimed && <div className="font-pixel text-[8px] text-neon-green">✓</div>}
            </div>
          );
        })}
      </div>
      <button onClick={onClaim} disabled={!ready}
        className="btn-buy w-full px-3 py-2 font-pixel text-[10px]">
        {ready ? `CLAIM +₿${reward(Math.min(7, streak + 1)).toFixed(4)}` : "ALREADY CLAIMED"}
      </button>
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
