import { ASIC_GPU_IDS, COOLER_MODELS, GPU_MODELS, POWER_MODELS } from "./data";
import type { OwnedGpu, OwnedCooler, OwnedPower, ShelfType } from "./types";

export const SHUTDOWN_HEAT = 85;
export const DESTRUCTION_HEAT = 100;
export const DAMAGE_PER_SECOND = 5;
export const upgradeCost = (base: number, level: number) => base * 1.8 ** level;

export function firstGearSlot(items: { shelf: number | null }[], shelves: number, occupied: OwnedGpu[] = []) {
  const free = Array.from({ length: shelves }, (_, i) => i).filter(i => !items.some(item => item.shelf === i));
  return free.find(i => occupied.some(g => g.equipped && g.shelf === i)) ?? free[0] ?? null;
}

export function findGpuSlot(owned: OwnedGpu[], modelId: string, shelfTypes: ShelfType[]) {
  const kind = ASIC_GPU_IDS.has(modelId) ? "asic" : "standard";
  for (let shelf = 0; shelf < shelfTypes.length; shelf++) {
    if (shelfTypes[shelf] !== kind) continue;
    for (let slot = 0; slot < 4; slot++) {
      if (!owned.some(g => g.equipped && g.shelf === shelf && g.slot === slot)) return { shelf, slot };
    }
  }
  return null;
}

export function migrateGpuSlots(owned: OwnedGpu[], shelfTypes: ShelfType[]) {
  const placed: OwnedGpu[] = [];
  for (const gpu of owned) {
    const g = { ...gpu, damage: Math.max(0, Math.min(100, gpu.damage ?? 0)) };
    if (!g.equipped) { placed.push(g); continue; }
    const kind = ASIC_GPU_IDS.has(g.modelId) ? "asic" : "standard";
    const valid = g.shelf != null && g.slot != null && shelfTypes[g.shelf] === kind && g.slot >= 0 && g.slot < 4 &&
      !placed.some(p => p.equipped && p.shelf === g.shelf && p.slot === g.slot);
    const target = valid ? { shelf: g.shelf, slot: g.slot } : findGpuSlot(placed, g.modelId, shelfTypes);
    placed.push(target ? { ...g, ...target } : { ...g, equipped: false, shelf: undefined, slot: undefined });
  }
  return placed;
}

export function shelfThermals(owned: OwnedGpu[], coolers: OwnedCooler[], shelves: number, overclock = 0) {
  return Array.from({ length: shelves }, (_, shelf) => {
    const miners = owned.filter(g => g.equipped && g.shelf === shelf && (g.damage ?? 0) < 100);
    const raw = miners.reduce((sum, g) => sum + (GPU_MODELS.find(m => m.id === g.modelId)?.heat ?? 0), 0);
    const cooler = coolers.find(c => c.shelf === shelf);
    const cooling = COOLER_MODELS.find(m => m.id === cooler?.modelId)?.cooling ?? 0;
    const heat = miners.length ? Math.max(15, raw * (1 + overclock * 0.05) + 10 - cooling) : 20;
    return { heat, shutdown: heat >= SHUTDOWN_HEAT, damaging: heat >= DESTRUCTION_HEAT, miners: miners.length };
  });
}

export function applyHeatDamage(owned: OwnedGpu[], thermals: ReturnType<typeof shelfThermals>, seconds: number) {
  let changed = false;
  const next = owned.map(g => {
    if (!g.equipped || g.shelf == null || !thermals[g.shelf]?.damaging || (g.damage ?? 0) >= 100) return g;
    changed = true;
    return { ...g, damage: Math.min(100, (g.damage ?? 0) + DAMAGE_PER_SECOND * seconds) };
  });
  return changed ? next : owned;
}

export function miningStats(owned: OwnedGpu[], coolers: OwnedCooler[], powers: OwnedPower[], shelves: number,
  upgrades: Record<string, number>, facilityMult: number, prestigeMult: number) {
  const thermals = shelfThermals(owned, coolers, shelves, upgrades.over ?? 0);
  const hashMult = 1 + (upgrades.fw ?? 0) * .10 + (upgrades.cool ?? 0) * .15 + (upgrades.over ?? 0) * .20 +
    (upgrades.ai ?? 0) * .25 + (upgrades.imm ?? 0) * .30 + (upgrades.quant ?? 0) * .50 + (upgrades.neuro ?? 0) * .20;
  const rewardMult = (1 + (upgrades.net ?? 0) * .05) * (1 + (upgrades.swarm ?? 0) * .15) *
    (1 + (upgrades.compress ?? 0) * .08) * facilityMult * prestigeMult;
  const powerMult = Math.max(.1, 1 - (upgrades.psu ?? 0) * .08 - (upgrades.solar ?? 0) * .12 - (upgrades.fusion ?? 0) * .20);
  let finalHash = 0, finalPower = 0, totalSupplied = 0;
  thermals.forEach((thermal, shelf) => {
    const models = owned.filter(g => g.equipped && g.shelf === shelf && (g.damage ?? 0) < 100)
      .map(g => GPU_MODELS.find(m => m.id === g.modelId));
    const demand = models.reduce((sum, m) => sum + (m?.power ?? 0), 0) * powerMult;
    const generator = powers.find(p => p.shelf === shelf);
    const supply = POWER_MODELS.find(m => m.id === generator?.modelId)?.capacity ?? 0;
    totalSupplied += supply;
    finalPower += thermal.shutdown ? 0 : demand;
    const heatMult = thermal.shutdown ? 0 : thermal.heat <= 60 ? 1 : Math.max(.2, 1 - (thermal.heat - 60) / 100);
    const powerPenalty = supply <= 0 ? .4 : Math.min(1, supply / Math.max(.001, demand));
    finalHash += models.reduce((sum, m) => sum + (m?.hashrate ?? 0), 0) * hashMult * heatMult * powerPenalty;
  });
  const active = thermals.filter(t => t.miners > 0);
  return { finalHash, finalPower, totalSupplied, thermals,
    finalHeat: active.length ? Math.max(...active.map(t => t.heat)) : 20,
    btcPerSec: (finalHash * .00003 + (finalHash > 0 ? .000005 : 0)) * rewardMult,
    efficiency: finalPower > 0 ? Math.min(100, finalHash / finalPower * 6) : 0 };
}