import type { GpuModel, Upgrade, Facility, CoolerModel, PowerModel, Achievement } from "./types";

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
  { id: "nova",    name: "NovaForge XR",        tier: "quantum", hashrate: 7800, power: 4.2,  heat: 18, basePrice: 12000,  color: "var(--neon-orange)", rarity: "Mythic" },
  { id: "singularity", name: "Singularity Σ",   tier: "quantum", hashrate: 22000,power: 5.2,  heat: 12, basePrice: 48000,  color: "var(--neon-green)",  rarity: "Mythic" },
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
  { id: "compress",name:"Block Compressor",  desc: "+8% pool reward per level",             basePrice: 25,   bonus: 0.08, max: 20, icon: "▤" },
  { id: "vault",  name: "Cold Vault",        desc: "+10% prestige token gain per level",    basePrice: 50,   bonus: 0.10, max: 10, icon: "♛" },
  { id: "neuro",  name: "Neuro-Link",        desc: "+20% hashrate per level",               basePrice: 200,  bonus: 0.20, max: 15, icon: "✦" },
  { id: "fusion", name: "Fusion Reactor",    desc: "-20% power draw per level",             basePrice: 500,  bonus: 0.20, max: 10, icon: "◉" },
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
  { id: "shelves",   label: "Shelves",     icon: "▥" },
  { id: "coolers",   label: "Coolers",     icon: "❄" },
  { id: "generators",label: "Generators",  icon: "⚡" },
  { id: "upgrades",  label: "Upgrades",    icon: "▲" },
  { id: "facilities",label: "Facilities",  icon: "▣" },
  { id: "research",  label: "Research",    icon: "✦" },
  { id: "missions",  label: "Missions",    icon: "◈" },
  { id: "achiev",    label: "Achievements",icon: "★" },
  { id: "prestige",  label: "Prestige",    icon: "♛" },
  { id: "cosmetics", label: "Cosmetics",   icon: "◆" },
  { id: "daily",     label: "Daily",       icon: "◉" },
] as const;

export const COOLER_MODELS: CoolerModel[] = [
  { id: "fan-basic",  name: "Stock Fan",        tier: "basic",    cooling: 8,   basePrice: 0.01,  color: "var(--neon-blue)" },
  { id: "fan-dual",   name: "Dual-Fan Heatsink",tier: "basic",    cooling: 18,  basePrice: 0.05,  color: "var(--neon-blue)" },
  { id: "aio-240",    name: "AIO-240 Liquid",   tier: "standard", cooling: 38,  basePrice: 0.4,   color: "var(--neon-cyan)" },
  { id: "aio-360",    name: "AIO-360 Pro",      tier: "standard", cooling: 65,  basePrice: 1.6,   color: "var(--neon-cyan)" },
  { id: "imm-tank",   name: "Immersion Tank",   tier: "advanced", cooling: 120, basePrice: 8,     color: "var(--neon-purple)" },
  { id: "cryo",       name: "Cryo Loop",        tier: "advanced", cooling: 220, basePrice: 35,    color: "var(--neon-purple)" },
  { id: "ln2",        name: "LN₂ Manifold",     tier: "elite",    cooling: 420, basePrice: 180,   color: "var(--neon-orange)" },
  { id: "absolute",   name: "AbsoluteZero Core",tier: "elite",    cooling: 800, basePrice: 900,   color: "var(--neon-orange)" },
  { id: "void-cool",  name: "Void Phase Cooler",tier: "mythic",   cooling: 1800,basePrice: 5000,  color: "var(--neon-green)" },
];

export const POWER_MODELS: PowerModel[] = [
  { id: "psu-500",    name: "500W PSU",         tier: "basic",    capacity: 0.5,  basePrice: 0.008, color: "var(--neon-blue)" },
  { id: "psu-850",    name: "850W Bronze",      tier: "basic",    capacity: 0.85, basePrice: 0.04,  color: "var(--neon-blue)" },
  { id: "psu-1200",   name: "1200W Gold",       tier: "standard", capacity: 1.2,  basePrice: 0.25,  color: "var(--neon-cyan)" },
  { id: "psu-1600",   name: "1600W Platinum",   tier: "standard", capacity: 1.6,  basePrice: 1.2,   color: "var(--neon-cyan)" },
  { id: "psu-3000",   name: "3000W Titanium",   tier: "advanced", capacity: 3.0,  basePrice: 6,     color: "var(--neon-purple)" },
  { id: "psu-gen",    name: "Diesel Genset",    tier: "advanced", capacity: 6.0,  basePrice: 28,    color: "var(--neon-purple)" },
  { id: "psu-solar",  name: "Solar Array Mk-X", tier: "elite",    capacity: 12,   basePrice: 140,   color: "var(--neon-orange)" },
  { id: "psu-fusion", name: "Fusion Cell",      tier: "elite",    capacity: 28,   basePrice: 700,   color: "var(--neon-orange)" },
  { id: "psu-zpe",    name: "ZPE Conduit",      tier: "mythic",   capacity: 80,   basePrice: 4200,  color: "var(--neon-green)" },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "a-own-5",    name: "Rookie Rigger",  desc: "Own 5 GPUs",            metric: "owned",       target: 5,    reward: { tokens: 1,  cosmetic: "skin-frame-bronze" }, icon: "▦" },
  { id: "a-own-25",   name: "Rig Lord",       desc: "Own 25 GPUs",           metric: "owned",       target: 25,   reward: { tokens: 3,  cosmetic: "skin-frame-silver" }, icon: "▦" },
  { id: "a-own-100",  name: "GPU Hoarder",    desc: "Own 100 GPUs",          metric: "owned",       target: 100,  reward: { tokens: 10, cosmetic: "skin-frame-gold" },   icon: "▦" },
  { id: "a-hash-50",  name: "Fast Hash",      desc: "Reach 50 TH/s",         metric: "hashrate",    target: 50,   reward: { tokens: 2,  cosmetic: "skin-led-cyan" },     icon: "⚡" },
  { id: "a-hash-1k",  name: "PetaHasher",     desc: "Reach 1,000 TH/s",      metric: "hashrate",    target: 1000, reward: { tokens: 8,  cosmetic: "skin-led-purple" },   icon: "⚡" },
  { id: "a-hash-10k", name: "ExaForge",       desc: "Reach 10,000 TH/s",     metric: "hashrate",    target: 10000,reward: { tokens: 25, cosmetic: "skin-led-rainbow" },  icon: "⚡" },
  { id: "a-shelf-5",  name: "Shelf Stocker",  desc: "Own 5 shelves",         metric: "shelves",     target: 5,    reward: { tokens: 1,  cosmetic: "shelf-neon-blue" },   icon: "▥" },
  { id: "a-shelf-20", name: "Rack Architect", desc: "Own 20 shelves",        metric: "shelves",     target: 20,   reward: { tokens: 5,  cosmetic: "shelf-neon-purple" }, icon: "▥" },
  { id: "a-up-25",    name: "Tweaker",        desc: "25 upgrade levels",     metric: "upgrades",    target: 25,   reward: { tokens: 2,  cosmetic: "bg-rain" },           icon: "▲" },
  { id: "a-up-100",   name: "Master Engineer",desc: "100 upgrade levels",    metric: "upgrades",    target: 100,  reward: { tokens: 10, cosmetic: "bg-storm" },          icon: "▲" },
  { id: "a-prestige-1",name:"First Reset",    desc: "Prestige once",         metric: "prestige",    target: 1,    reward: { tokens: 5,  cosmetic: "bg-aurora" },         icon: "♛" },
  { id: "a-prestige-5",name:"Reborn V",       desc: "Reach prestige 5",      metric: "prestige",    target: 5,    reward: { tokens: 20, cosmetic: "bg-galaxy" },         icon: "♛" },
  { id: "a-earn-100", name: "Centurion",      desc: "Earn 100 BTC lifetime", metric: "totalEarned", target: 100,  reward: { tokens: 4,  cosmetic: "skin-frame-neon" },   icon: "₿" },
  { id: "a-earn-10k", name: "Whale",          desc: "Earn 10,000 BTC",       metric: "totalEarned", target: 10000,reward: { tokens: 30, cosmetic: "bg-vault" },          icon: "₿" },
];
