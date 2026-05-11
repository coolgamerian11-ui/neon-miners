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

export interface Upgrade {
  id: string;
  name: string;
  desc: string;
  basePrice: number;
  bonus: number; // multiplier per level
  max?: number;
  icon: string;
}

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
