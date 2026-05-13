export type GpuTier = "starter" | "mid" | "high" | "quantum";

export interface GpuModel {
  id: string;
  name: string;
  tier: GpuTier;
  hashrate: number;     // TH/s
  power: number;        // kW
  heat: number;         // C contribution
  basePrice: number;    // BTC
  color: string;        // accent
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";
}

export interface OwnedGpu { id: string; modelId: string; equipped: boolean; }

export type GearTier = "basic" | "standard" | "advanced" | "elite" | "mythic";

export interface CoolerModel {
  id: string;
  name: string;
  tier: GearTier;
  cooling: number;     // heat removed
  basePrice: number;
  color: string;
}

export interface PowerModel {
  id: string;
  name: string;
  tier: GearTier;
  capacity: number;    // kW supplied
  basePrice: number;
  color: string;
}

/** Per-shelf assignments. Map shelf-index -> equipped item id. */
export interface OwnedCooler { id: string; modelId: string; shelf: number | null; }
export interface OwnedPower  { id: string; modelId: string; shelf: number | null; }

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  target: number;
  metric: "owned" | "hashrate" | "upgrades" | "shelves" | "prestige" | "totalEarned" | "facility";
  reward: { tokens?: number; cosmetic?: string };
  icon: string;
}

export interface Upgrade {
  id: string;
  name: string;
  desc: string;
  basePrice: number;
  bonus: number; // multiplier per level
  max?: number;
  icon: string;
}

export type ShelfType = "standard" | "asic";

export interface CosmeticsEquipped {
  gpuFrame?: string;
  gpuLed?: string;
  shelfTrim?: string;
  background?: string;
}

export type CarryKind = "gpu" | "cooler" | "power";
export interface Carry { kind: CarryKind; id: string; }


export interface Facility {
  id: string;
  name: string;
  desc: string;
  unlockBtc: number;
  bgClass: string;
  capacity: number;
  /** passive income multiplier for being in this facility */
  mult?: number;
  /** short blurb describing the facility's special function */
  perk?: string;
}
