import type { GpuModel, Upgrade, Facility } from "./types";

export const RARITY_META: Record<string, { color: string; glow: string; label: string }> = {
  Common:    { color: "#7c8a9a", glow: "rgba(124,138,154,0.4)", label: "C" },
  Rare:      { color: "var(--neon-blue)",   glow: "color-mix(in oklab, var(--neon-blue) 70%, transparent)",   label: "R" },
  Epic:      { color: "var(--neon-purple)", glow: "color-mix(in oklab, var(--neon-purple) 70%, transparent)", label: "E" },
  Legendary: { color: "var(--neon-orange)", glow: "color-mix(in oklab, var(--neon-orange) 70%, transparent)", label: "L" },
  Mythic:    { color: "var(--neon-cyan)",   glow: "color-mix(in oklab, var(--neon-cyan) 80%, transparent)",   label: "M" },
};

export const MFG_BY_TIER: Record<string, string> = {
  starter: "RST",
  mid:     "NFG",
  high:    "ANT",
  quantum: "QBT",
};

export const GPU_MODELS: GpuModel[] = [
  { id: "gtx750",  name: "RustyMiner GTX-750",  tier: "starter", hashrate: 0.05, power: 0.12, heat: 4,  basePrice: 0.0008, color: "var(--neon-blue)",   rarity: "Common" },
  { id: "gtx1060", name: "DustCore GTX-1060",   tier: "starter", hashrate: 0.18, power: 0.18, heat: 6,  basePrice: 0.004,  color: "var(--neon-blue)",   rarity: "Common" },
  { id: "rx580",   name: "GrindBlock RX-580",   tier: "starter", hashrate: 0.42, power: 0.22, heat: 9,  basePrice: 0.018,  color: "var(--neon-cyan)",   rarity: "Common" },
  { id: "rtx3070", name: "NeonForge RTX-3070",  tier: "mid",     hashrate: 1.4,  power: 0.32, heat: 14, basePrice: 0.085,  color: "var(--neon-purple)", rarity: "Rare" },
  { id: "rtx3090", name: "ApexCore RTX-3090",   tier: "mid",     hashrate: 4.2,  power: 0.45, heat: 22, basePrice: 0.42,   color: "var(--neon-purple)", rarity: "Rare" },
  { id: "rtx4090", name: "InfernoX RTX-4090",   tier: "mid",     hashrate: 12.5, power: 0.62, heat: 32, basePrice: 2.1,    color: "var(--neon-orange)", rarity: "Epic" },
  { id: "asic-s19",name: "Antaris ASIC S-19+",  tier: "high",    hashrate: 38,   power: 1.1,  heat: 48, basePrice: 9.8,    color: "var(--neon-orange)", rarity: "Epic" },
  { id: "fpga-x",  name: "ChromaFPGA-X",        tier: "high",    hashrate: 110,  power: 1.6,  heat: 62, basePrice: 42,     color: "var(--neon-green)",  rarity: "Legendary" },
  { id: "liquid",  name: "Cryotek LiquidCore",  tier: "high",    hashrate: 320,  power: 2.2,  heat: 38, basePrice: 180,    color: "var(--neon-cyan)",   rarity: "Legendary" },
  { id: "qubit",   name: "QuBit-7 Holo",        tier: "quantum", hashrate: 950,  power: 2.8,  heat: 28, basePrice: 720,    color: "var(--neon-cyan)",   rarity: "Mythic" },
  { id: "void",    name: "VoidReactor Ω",       tier: "quantum", hashrate: 2800, power: 3.4,  heat: 14, basePrice: 3100,   color: "var(--neon-purple)", rarity: "Mythic" },
];

export const UPGRADES: Upgrade[] = [
  { id: "cool",   name: "Cooling Array",     desc: "+15% hashrate per level (lower heat)",  basePrice: 0.02, bonus: 0.15, max: 25, icon: "❄" },
  { id: "psu",    name: "Power Supply",      desc: "-8% power draw per level",              basePrice: 0.05, bonus: 0.08, max: 20, icon: "⚡" },
  { id: "fw",     name: "Firmware Tune",     desc: "+10% hashrate per level",               basePrice: 0.08, bonus: 0.10, max: 30, icon: "⚙" },
  { id: "net",    name: "Fiber Uplink",      desc: "+5% pool reward per level",             basePrice: 0.12, bonus: 0.05, max: 20, icon: "📡" },
  { id: "ai",     name: "AI Worker Bot",     desc: "+25% auto-mining per level",            basePrice: 0.5,  bonus: 0.25, max: 15, icon: "🤖" },
  { id: "over",   name: "Overclock Module",  desc: "+20% hashrate, +5% heat per level",     basePrice: 1.2,  bonus: 0.20, max: 20, icon: "🔥" },
  { id: "imm",    name: "Immersion Tank",    desc: "+30% hashrate, halves heat",            basePrice: 4,    bonus: 0.30, max: 10, icon: "💧" },
  { id: "solar",  name: "Solar Grid",        desc: "-12% power draw per level",             basePrice: 6,    bonus: 0.12, max: 12, icon: "☀" },
  { id: "swarm",  name: "Drone Swarm",       desc: "+15% global income per level",          basePrice: 12,   bonus: 0.15, max: 20, icon: "🛸" },
  { id: "quant",  name: "Quantum Accel",     desc: "+50% hashrate per level",               basePrice: 80,   bonus: 0.50, max: 12, icon: "⚛" },
];

export const FACILITIES: Facility[] = [
  { id: "garage",     name: "Garage",            desc: "Cramped & dusty. Where every empire begins.", unlockBtc: 0,      capacity: 16,  mult: 1.0, perk: "+0% bonus — starter rig",                bgClass: "facility-garage" },
  { id: "basement",   name: "Basement Farm",     desc: "Concrete bunker, louder fans.",               unlockBtc: 2,      capacity: 40,  mult: 1.5, perk: "+50% income · cooler ambient",            bgClass: "facility-basement" },
  { id: "warehouse",  name: "Warehouse",         desc: "Industrial rows, forklifts, cold air.",       unlockBtc: 25,     capacity: 120, mult: 2.2, perk: "+120% income · bulk shelves",             bgClass: "facility-warehouse" },
  { id: "vault",      name: "Underground Vault", desc: "High-security, red lights, reinforced.",      unlockBtc: 200,    capacity: 320, mult: 3.5, perk: "+250% income · hardened uptime",          bgClass: "facility-vault" },
  { id: "datacenter", name: "Mega Data Center",  desc: "Endless aisles, robotic arms.",               unlockBtc: 2000,   capacity: 1000,mult: 6.0, perk: "+500% income · auto maintenance",         bgClass: "facility-datacenter" },
  { id: "quantum",    name: "Quantum Lab",       desc: "Holographic miners, AI cores.",               unlockBtc: 20000,  capacity: 3000,mult: 12.0,perk: "+1100% income · qubit acceleration",      bgClass: "facility-quantum" },
  { id: "space",      name: "Space Station Hub", desc: "Zero-g servers orbiting Earth.",              unlockBtc: 200000, capacity: 9999,mult: 25.0,perk: "+2400% income · solar + zero-g cooling",  bgClass: "facility-space" },
];

export const SIDEBAR = [
  { id: "home",      label: "Home",        icon: "⌂" },
  { id: "gpus",      label: "GPUs",        icon: "▦" },
  { id: "upgrades",  label: "Upgrades",    icon: "▲" },
  { id: "facilities",label: "Facilities",  icon: "▣" },
  { id: "research",  label: "Research",    icon: "✦" },
  { id: "missions",  label: "Missions",    icon: "◈" },
  { id: "achiev",    label: "Achievements",icon: "★" },
  { id: "prestige",  label: "Prestige",    icon: "♛" },
  { id: "shop",      label: "Shop",        icon: "▶" },
  { id: "daily",     label: "Daily",       icon: "◉" },
] as const;
