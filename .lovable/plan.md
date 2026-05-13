## Goal
Make hardware management feel tangible: a persistent bottom inventory dock, click-to-place onto shelf slots, sidebar = shop only, cosmetics you actually equip, and dedicated ASIC shelves.

## 1. Inventory dock (bottom of screen)
New component `InventoryDock.tsx` — three tabs **GPUs / Coolers / Generators** showing only unassigned items.
- Click an item → it becomes the active "carry" (cursor highlight, glow).
- Click a compatible empty shelf slot in `RoomScene` → assigned and removed from dock.
- ESC or click again to drop carry.
- Shows item icon (pixel sprite), name, key stat, count.

Replaces ~80 px at bottom; existing bottom HUD slim bar stays below or merges.

## 2. Shelf slots become real drop targets
In `MiningRack.tsx`:
- Each shelf renders 4 GPU slots (existing) + 1 cooler slot + 1 generator slot, visually distinct (snowflake/lightning frames).
- Slots are buttons; if `carry` matches type, slot lights up green; click assigns. Empty assigned slot click = unassign back to dock.

State `carry: { kind: "gpu"|"cooler"|"power", id: string } | null` lives in `Coinminers.tsx` and is passed down.

## 3. Sidebar Coolers/Generators panels → shop only
Strip the "shelf slots" + "inventory" sections from `CoolersPanel` / `GeneratorsPanel`. Keep only the BUY list. Inventory + assignment are handled by the new dock + shelf slots.

## 4. Cooler & Generator textures
Add `PixelCooler.tsx` and `PixelGenerator.tsx` — small pixel-art sprites tinted by tier color. Used in dock, shop, and on the shelf slot when occupied.

## 5. Cosmetics: equipping
Extend save: `cosmeticsEquipped: { gpuFrame?: id, gpuLed?: id, shelfTrim?: id, background?: id }`.
- `CosmeticsPanel`: each unlocked item shows EQUIP / EQUIPPED / UNEQUIP buttons per category (one equipped per category).
- Also allow direct purchase with tokens for items not gated to achievements.
- `PixelGpu` / `MiningRack` / `RoomScene` read equipped cosmetics and tweak frame color, LED color, shelf trim, background overlay.

## 6. ASIC shelves
Add `shelfTypes: ("standard"|"asic")[]` to save (length = shelves count; default all `"standard"`).
- `ShelvesPanel` adds two buttons: "Buy Standard Shelf" and "Buy ASIC Shelf" (more expensive, accepts only `tier === "quantum"` or new `"asic"` GPU tier — we'll treat existing `"quantum"` as ASIC-class).
- ASIC shelves rendered with a heavy industrial frame (orange/gold trim).
- When placing a GPU via dock: standard shelves reject ASIC GPUs; ASIC shelves only accept ASIC GPUs.
- New ASIC GPU model added to `GPU_MODELS` (e.g., "AntMiner X9", tier `"quantum"`) so the system has clear ASIC content.

## 7. Save migration
Keep `SAVE_KEY = "coinminers.save.v3"` so existing players load. In `loadSave` / hydrate effect:
- Default `cosmeticsEquipped = {}`.
- Default `shelfTypes = Array(saved.shelves ?? 2).fill("standard")`.
- If saved JSON has length mismatch on `shelfTypes`, pad with `"standard"`.

No data loss — purely additive fields.

## Files
**New:** `src/game/InventoryDock.tsx`, `src/game/PixelCooler.tsx`, `src/game/PixelGenerator.tsx`
**Edited:** `src/game/Coinminers.tsx` (carry state, dock render, shelfTypes, cosmeticsEquipped, save migration), `src/game/NewPanels.tsx` (slim coolers/generators to shop-only; cosmetics equip), `src/game/MiningRack.tsx` (slot drop targets, asic visual, equipped trim), `src/game/RoomScene.tsx` (pass carry + cosmetics + shelfTypes), `src/game/PixelGpu.tsx` (equipped frame/led colors), `src/game/types.ts` (ShelfType, CosmeticsEquipped), `src/game/data.ts` (one ASIC GPU model, ASIC shelf cost constant).

## Out of scope this round
Drag-and-drop with mouse motion (we use click-to-carry — simpler and touch-friendly). Network/cloud sync. New cosmetics art beyond color tinting.
