import { memo, useState } from "react";
import type { OwnedGpu, OwnedCooler, OwnedPower, Carry } from "./types";
import { GPU_MODELS, COOLER_MODELS, POWER_MODELS, ASIC_GPU_IDS } from "./data";
import { PixelCooler } from "./PixelCooler";
import { PixelGenerator } from "./PixelGenerator";
import { PixelGpu } from "./PixelGpu";

type Tab = "gpu" | "cooler" | "power";

function DockInner({ owned, coolers, powers, carry, setCarry, onSellGpu, onSellCooler, onSellPower }: {
  owned: OwnedGpu[];
  coolers: OwnedCooler[];
  powers: OwnedPower[];
  carry: Carry | null;
  setCarry: (c: Carry | null) => void;
  onSellGpu: (id: string) => void;
  onSellCooler: (id: string) => void;
  onSellPower: (id: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("gpu");

  const unGpu = owned.filter(g => !g.equipped);
  const unCool = coolers.filter(c => c.shelf == null);
  const unPow  = powers.filter(p => p.shelf == null);

  const counts = { gpu: unGpu.length, cooler: unCool.length, power: unPow.length };

  const isCarry = (kind: Tab, id: string) => carry?.kind === kind && carry?.id === id;

  function pick(kind: Tab, id: string) {
    if (isCarry(kind, id)) setCarry(null);
    else setCarry({ kind, id });
  }

  return (
    <div className="border-t-2 border-[color:var(--metal-light)] shrink-0"
      style={{ background: "linear-gradient(180deg, #0c0c14, #06060a)" }}>
      <div className="flex items-stretch gap-1 px-2 pt-1">
        <TabBtn active={tab === "gpu"}    onClick={() => setTab("gpu")}    label="GPUs"     count={counts.gpu}    color="var(--neon-cyan)" />
        <TabBtn active={tab === "cooler"} onClick={() => setTab("cooler")} label="Coolers"  count={counts.cooler} color="var(--neon-blue)" />
        <TabBtn active={tab === "power"}  onClick={() => setTab("power")}  label="Generators" count={counts.power} color="var(--neon-orange)" />
        <div className="flex-1" />
        {carry && (
          <button onClick={() => setCarry(null)}
            className="px-3 py-1 font-pixel text-[9px] text-neon-red border border-[color:var(--neon-red)]"
            style={{ background: "rgba(40,5,5,0.6)" }}>
            ✕ DROP
          </button>
        )}
        <span className="self-center font-pixel text-[9px] text-muted-foreground pr-2">
          {carry ? "→ click a shelf slot" : "click an item to carry"}
        </span>
      </div>
      <div className="flex gap-1 overflow-x-auto cyber-scroll p-2 pt-1" style={{ minHeight: 86 }}>
        {tab === "gpu" && unGpu.length === 0 && <Empty msg="No spare GPUs in storage. Buy more from Shop." />}
        {tab === "cooler" && unCool.length === 0 && <Empty msg="No spare coolers. Buy from Coolers shop." />}
        {tab === "power" && unPow.length === 0 && <Empty msg="No spare generators. Buy from Generators shop." />}

        {tab === "gpu" && unGpu.map(g => {
          const m = GPU_MODELS.find(x => x.id === g.modelId);
          if (!m) return null;
          const asic = ASIC_GPU_IDS.has(m.id);
          return (
            <DockCard key={g.id} active={isCarry("gpu", g.id)} color={m.color} onClick={() => pick("gpu", g.id)}
              onSell={() => onSellGpu(g.id)}>
              <div style={{ transform: "scale(0.42)", transformOrigin: "top left", height: 36, width: 60 }}>
                <PixelGpu model={m} idx={0} />
              </div>
              <div className="font-pixel text-[8px] text-neon-cyan truncate w-[88px]">{m.name.split(" ").slice(-1)[0]}</div>
              <div className="font-mono-pixel text-[9px] text-muted-foreground">{m.hashrate}TH</div>
              {asic && <div className="font-pixel text-[7px] text-neon-orange">⚙ ASIC</div>}
            </DockCard>
          );
        })}

        {tab === "cooler" && unCool.map(c => {
          const m = COOLER_MODELS.find(x => x.id === c.modelId);
          if (!m) return null;
          return (
            <DockCard key={c.id} active={isCarry("cooler", c.id)} color={m.color} onClick={() => pick("cooler", c.id)}
              onSell={() => onSellCooler(c.id)}>
              <PixelCooler model={m} size={36} />
              <div className="font-pixel text-[8px] text-neon-cyan truncate w-[88px]">{m.name}</div>
              <div className="font-mono-pixel text-[9px]" style={{ color: m.color }}>−{m.cooling}°</div>
            </DockCard>
          );
        })}

        {tab === "power" && unPow.map(p => {
          const m = POWER_MODELS.find(x => x.id === p.modelId);
          if (!m) return null;
          return (
            <DockCard key={p.id} active={isCarry("power", p.id)} color={m.color} onClick={() => pick("power", p.id)}
              onSell={() => onSellPower(p.id)}>
              <PixelGenerator model={m} size={36} />
              <div className="font-pixel text-[8px] text-neon-cyan truncate w-[88px]">{m.name}</div>
              <div className="font-mono-pixel text-[9px]" style={{ color: m.color }}>{m.capacity}kW</div>
            </DockCard>
          );
        })}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, label, count, color }:
  { active: boolean; onClick: () => void; label: string; count: number; color: string }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1 font-pixel text-[9px] border ${active ? "" : "opacity-60"}`}
      style={{
        background: active ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)",
        borderColor: active ? color : "var(--metal-dark)",
        color, textShadow: active ? `0 0 4px ${color}` : "none",
      }}>
      {label} <span className="text-muted-foreground">[{count}]</span>
    </button>
  );
}

function DockCard({ children, active, color, onClick, onSell }:
  { children: React.ReactNode; active: boolean; color: string; onClick: () => void; onSell: () => void }) {
  return (
    <div className="relative shrink-0 flex flex-col items-center gap-0.5 p-1 cursor-pointer select-none"
      onClick={onClick}
      style={{
        background: active ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.45)",
        border: `1px solid ${active ? color : "var(--metal-dark)"}`,
        boxShadow: active ? `0 0 10px ${color}, inset 0 0 6px ${color}55` : "none",
        minWidth: 96,
      }}>
      {children}
      <button onClick={(e) => { e.stopPropagation(); onSell(); }}
        className="absolute top-0 right-0 px-1 font-pixel text-[7px] text-neon-red bg-black/60 border-l border-b border-[color:var(--metal-dark)]">
        ✕
      </button>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex-1 flex items-center justify-center font-pixel text-[9px] text-muted-foreground py-4">{msg}</div>
  );
}

export const InventoryDock = memo(DockInner);