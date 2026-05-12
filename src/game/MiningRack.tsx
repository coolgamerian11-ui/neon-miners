import { memo } from "react";
import type { OwnedGpu, GpuModel } from "./types";
import { GPU_MODELS } from "./data";
import { PixelGpu } from "./PixelGpu";

export type RackTier = "starter" | "mid" | "endgame";

interface Props {
  index: number;
  perShelf?: number;
  row: (OwnedGpu | undefined)[];
  tier: RackTier;
}

const TIER_STYLE: Record<RackTier, {
  frameTop: string; frameBot: string; accent: string; accent2: string;
  rail: string; bolt: string; label: string; pipeAccent: string;
}> = {
  starter: {
    frameTop: "#3a3a44", frameBot: "#1a1a22",
    accent: "var(--neon-blue)", accent2: "var(--neon-cyan)",
    rail: "linear-gradient(90deg,#2a2a32,#15151c,#2a2a32)",
    bolt: "#888", label: "RIG·UNIT", pipeAccent: "var(--neon-orange)",
  },
  mid: {
    frameTop: "#1f1f28", frameBot: "#08080c",
    accent: "var(--neon-cyan)", accent2: "var(--neon-orange)",
    rail: "linear-gradient(90deg,#16161e,#06060a,#16161e)",
    bolt: "#aab", label: "RACK·MK2", pipeAccent: "var(--neon-cyan)",
  },
  endgame: {
    frameTop: "#0c0e1a", frameBot: "#040410",
    accent: "var(--neon-purple)", accent2: "var(--neon-cyan)",
    rail: "linear-gradient(90deg,#0a0a18,#02020a,#0a0a18)",
    bolt: "#9bf", label: "Q·CORE", pipeAccent: "var(--neon-purple)",
  },
};

function MiningRackInner({ index, perShelf = 4, row, tier }: Props) {
  const s = TIER_STYLE[tier];
  const filledCount = row.filter(Boolean).length;
  const active = filledCount > 0;
  const heatPct = filledCount / perShelf;

  return (
    <div className="relative" style={{ marginLeft: 18, marginRight: 18 }}>
      {/* ─── Top vent / cooling header ─── */}
      <div className="relative h-7 flex items-stretch"
        style={{
          background: `linear-gradient(180deg, ${s.frameTop}, ${s.frameBot})`,
          border: "1px solid #000",
          borderBottom: "2px solid #000",
          boxShadow: `inset 0 1px 0 #4a4a55, inset 0 -2px 0 #000`,
        }}>
        {/* Vent louvers */}
        <div className="flex-1 mx-1 my-1 relative overflow-hidden"
          style={{
            background: "repeating-linear-gradient(0deg,#000 0 1px,#1a1a22 1px 3px)",
            border: "1px solid #000",
          }}>
          {/* Spinning fans */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="absolute top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ left: `${10 + i * 32}%` }}>
              <div className={active ? "fan-spin" : ""}
                style={{
                  width: "100%", height: "100%",
                  background: "radial-gradient(circle, #2a2a32 30%, #0a0a10 70%)",
                  borderRadius: "50%",
                  border: "1px solid #000",
                  boxShadow: active ? `0 0 4px ${s.accent}` : "none",
                  animationDuration: `${1.4 - heatPct * 0.8}s`,
                }}>
                <div className="absolute inset-0" style={{
                  background:
                    `conic-gradient(from 0deg, transparent 0 30deg, ${s.accent2}55 30deg 60deg, transparent 60deg 120deg, ${s.accent2}55 120deg 150deg, transparent 150deg 240deg, ${s.accent2}55 240deg 270deg, transparent 270deg)`,
                  borderRadius: "50%",
                  opacity: active ? 0.9 : 0.3,
                }} />
                <div className="absolute inset-[35%] rounded-full" style={{ background: "#000" }} />
              </div>
            </div>
          ))}
        </div>
        {/* Diagnostic mini-screen */}
        <div className="w-14 my-1 mr-1 relative overflow-hidden"
          style={{ background: "#020608", border: "1px solid #000", boxShadow: `inset 0 0 6px ${s.accent}66` }}>
          <div className="absolute inset-0 flex flex-col justify-around px-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-0.5" style={{
                background: s.accent,
                width: `${30 + ((i + index) * 17) % 60}%`,
                boxShadow: `0 0 3px ${s.accent}`,
                animation: `equalizer ${0.6 + (i * 0.2)}s ease-in-out ${i * 0.1}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Side frame beams + GPU bay ─── */}
      <div className="relative flex">
        {/* Left beam */}
        <Beam side="left" tier={tier} />

        {/* Inner bay */}
        <div className="flex-1 relative" style={{
          background: `linear-gradient(180deg, ${s.frameBot}, #000 80%)`,
          borderLeft: "1px solid #000", borderRight: "1px solid #000",
        }}>
          {/* Back wall: perforated metal */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background:
              "radial-gradient(circle at 4px 4px, #0a0a10 1px, transparent 1.5px) 0 0/8px 8px," +
              "linear-gradient(180deg,#0a0a12,#05050a)",
            opacity: 0.8,
          }} />
          {/* Tier-specific back accents */}
          {tier === "endgame" && (
            <>
              {/* holographic platform glow */}
              <div className="absolute inset-x-2 inset-y-1 pointer-events-none" style={{
                background: `linear-gradient(180deg, ${s.accent}22, transparent 60%, ${s.accent2}22)`,
                animation: "pulse-soft 2.4s ease-in-out infinite",
              }} />
              {/* energy conduit lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <line x1="0" y1="20%" x2="100%" y2="20%" stroke={s.accent2} strokeWidth="0.5" opacity="0.5"
                  style={{ filter: `drop-shadow(0 0 3px ${s.accent2})` }} />
                <line x1="0" y1="80%" x2="100%" y2="80%" stroke={s.accent} strokeWidth="0.5" opacity="0.5"
                  style={{ filter: `drop-shadow(0 0 3px ${s.accent})` }} />
              </svg>
            </>
          )}
          {tier === "mid" && (
            <div className="absolute inset-y-1 left-0 right-0 pointer-events-none"
              style={{ background: `repeating-linear-gradient(90deg, transparent 0 30px, ${s.accent}22 30px 31px)` }} />
          )}

          {/* GPU mounting rail (top) */}
          <div className="h-1 mx-1 mt-1" style={{ background: s.rail, boxShadow: "0 1px 0 #000" }} />

          {/* GPU slot grid */}
          <div className="relative grid gap-1 px-1 pt-1 pb-2"
            style={{ gridTemplateColumns: `repeat(${perShelf}, minmax(0,1fr))` }}>
            {Array.from({ length: perShelf }).map((_, i) => {
              const g = row[i];
              const model: GpuModel | null = g ? (GPU_MODELS.find(m => m.id === g.modelId) ?? null) : null;
              return <Slot key={i} idx={index * perShelf + i} model={model} tier={tier} />;
            })}
          </div>

          {/* Mounting rail (bottom) */}
          <div className="h-1 mx-1 mb-1" style={{ background: s.rail, boxShadow: "0 -1px 0 #000" }} />
        </div>

        {/* Right beam */}
        <Beam side="right" tier={tier} />
      </div>

      {/* ─── Bottom PDU (Power Distribution Unit) ─── */}
      <div className="relative h-6 flex items-center px-2 gap-1"
        style={{
          background: `linear-gradient(180deg, ${s.frameTop}, ${s.frameBot})`,
          border: "1px solid #000",
          borderTop: "2px solid #000",
          boxShadow: `inset 0 1px 0 #3a3a44, 0 4px 10px rgba(0,0,0,0.7)`,
        }}>
        {/* PSU label tag */}
        <div className="px-1 py-0.5 font-pixel text-[7px]"
          style={{ background: "#000", color: s.accent, border: `1px solid ${s.accent}`, boxShadow: `0 0 4px ${s.accent}` }}>
          PDU·{String(index + 1).padStart(2, "0")}
        </div>
        {/* Voltage gauge */}
        <div className="flex-1 h-2 relative" style={{ background: "#000", border: "1px solid #1a1a22" }}>
          <div className="h-full" style={{
            width: `${30 + heatPct * 60}%`,
            background: `linear-gradient(90deg, ${s.accent2}, ${s.accent})`,
            boxShadow: `0 0 4px ${s.accent2}`,
          }} />
        </div>
        {/* Outlet sockets */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-1.5 h-2 relative" style={{ background: "#0a0a10", border: "1px solid #000" }}>
            <span className="absolute inset-0.5"
              style={{ background: i < filledCount ? s.accent : "#1a1a22", boxShadow: i < filledCount ? `0 0 3px ${s.accent}` : "none" }} />
          </div>
        ))}
        {/* Breaker switch */}
        <div className="w-2 h-3 relative" style={{ background: "#1a1a22", border: "1px solid #000" }}>
          <div className="absolute inset-x-0 h-1" style={{ background: active ? s.accent : "#444", top: active ? 0 : "50%", boxShadow: active ? `0 0 3px ${s.accent}` : "none" }} />
        </div>
      </div>

      {/* ─── Cable bundle leaving the bottom ─── */}
      <svg className="block w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
        <path d="M20 0 Q22 8 30 12" stroke="#000" strokeWidth="2" fill="none" />
        <path d="M50 0 Q48 6 56 12" stroke="#0a0a10" strokeWidth="2" fill="none" />
        <path d="M80 0 Q82 7 76 12" stroke="#000" strokeWidth="2" fill="none" />
        <path d="M50 0 Q48 6 56 12" stroke={s.accent} strokeWidth="0.4" fill="none" opacity="0.6"
          style={{ filter: `drop-shadow(0 0 2px ${s.accent})` }} />
      </svg>

      {/* ─── Side ID label tag ─── */}
      <div className="absolute -left-3 -top-2 px-1.5 py-0.5 font-pixel text-[8px]"
        style={{ background: "#0a0a0e", color: s.accent, border: `1px solid ${s.accent}`,
                 boxShadow: `0 0 6px ${s.accent}` }}>
        {s.label}·{String(index + 1).padStart(2, "0")}
      </div>

      {/* High-voltage warning sticker */}
      <div className="absolute -right-3 top-8 px-0.5 py-0.5 font-pixel text-[6px] rotate-90 origin-top-right"
        style={{ background: "#caa018", color: "#000", border: "1px solid #000" }}>
        ⚡HV
      </div>

      {/* Heat shimmer when nearly full */}
      {heatPct > 0.6 && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at center, ${s.pipeAccent}11, transparent 70%)`,
          mixBlendMode: "screen",
          animation: "pulse-soft 1.6s ease-in-out infinite",
        }} />
      )}
    </div>
  );
}

function Beam({ side, tier }: { side: "left" | "right"; tier: RackTier }) {
  const s = TIER_STYLE[tier];
  return (
    <div className="relative w-3" style={{
      background: `linear-gradient(180deg, ${s.frameTop} 0%, #000 50%, ${s.frameBot} 100%)`,
      borderLeft: side === "left" ? "1px solid #000" : "none",
      borderRight: side === "right" ? "1px solid #000" : "none",
      boxShadow: side === "left"
        ? "inset 1px 0 0 #4a4a55, inset -1px 0 0 #000"
        : "inset -1px 0 0 #4a4a55, inset 1px 0 0 #000",
    }}>
      {/* Bolts */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-[1px]"
          style={{ top: `${10 + i * 28}%`, background: s.bolt, boxShadow: "inset 0 0 0 1px #000, 0 1px 0 #000" }}>
          <span className="absolute inset-[35%]" style={{ background: "#000" }} />
        </div>
      ))}
      {/* Cable channel */}
      <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-px" style={{ background: s.accent, opacity: 0.35, boxShadow: `0 0 3px ${s.accent}` }} />
      {/* Status LED column */}
      {tier !== "starter" && (
        <div className="absolute inset-y-2 right-0 flex flex-col justify-around -mr-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="led-blink w-1 h-1 rounded-full"
              style={{
                background: i % 2 ? s.accent : s.accent2,
                boxShadow: `0 0 3px currentColor`, color: i % 2 ? s.accent : s.accent2,
                animationDelay: `${i * 0.18}s`,
              }} />
          ))}
        </div>
      )}
    </div>
  );
}

function Slot({ idx, model, tier }: { idx: number; model: GpuModel | null; tier: RackTier }) {
  const s = TIER_STYLE[tier];
  return (
    <div className="relative h-[78px] flex items-end justify-center"
      style={{
        background:
          "linear-gradient(180deg, #08080c, #02020610), " +
          "repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.02) 6px 7px)",
        border: "1px solid #000",
        boxShadow: model
          ? `inset 0 0 8px ${s.accent}33, inset 0 0 0 1px ${s.accent}55`
          : "inset 0 0 6px #000",
      }}>
      {/* Slot index */}
      <span className="absolute top-0.5 left-0.5 font-pixel text-[7px]"
        style={{ color: model ? s.accent : "#3a3a44" }}>
        {String(idx + 1).padStart(2, "0")}
      </span>

      {/* Locking clamps (top corners) */}
      <span className="absolute top-0.5 right-0.5 w-1 h-1.5"
        style={{ background: s.bolt, border: "1px solid #000" }} />
      <span className="absolute bottom-7 left-0 w-1.5 h-1"
        style={{ background: s.bolt, border: "1px solid #000" }} />
      <span className="absolute bottom-7 right-0 w-1.5 h-1"
        style={{ background: s.bolt, border: "1px solid #000" }} />

      {/* Power connector */}
      <span className="absolute top-1.5 right-0.5 w-2 h-1"
        style={{ background: model ? s.accent : "#222", boxShadow: model ? `0 0 3px ${s.accent}` : "none" }} />

      {/* Data cable port */}
      <span className="absolute bottom-1 left-0.5 w-1.5 h-1"
        style={{ background: model ? s.accent2 : "#222" }} />

      {/* Empty placeholder hologram */}
      {!model && (
        <div className="absolute inset-2 flex items-center justify-center">
          <div className="font-pixel text-[7px]"
            style={{ color: s.accent, opacity: 0.35, textShadow: `0 0 3px ${s.accent}` }}>
            ▢ EMPTY
          </div>
        </div>
      )}

      {/* GPU */}
      {model && (
        <div style={{ transform: "scale(0.62)", transformOrigin: "bottom center" }}>
          <PixelGpu model={model} idx={idx} />
        </div>
      )}

      {/* Heat sensor bar (only when occupied) */}
      {model && (
        <div className="absolute bottom-0 left-1 right-1 h-0.5"
          style={{
            background: `linear-gradient(90deg, ${s.accent2}, ${s.accent})`,
            boxShadow: `0 0 3px ${s.accent}`,
          }} />
      )}

      {/* Endgame: floating magnetic glow under GPU */}
      {model && tier === "endgame" && (
        <div className="absolute bottom-0 left-2 right-2 h-1"
          style={{
            background: s.accent,
            filter: "blur(2px)", opacity: 0.7,
            animation: "pulse-soft 1.6s ease-in-out infinite",
          }} />
      )}
    </div>
  );
}
