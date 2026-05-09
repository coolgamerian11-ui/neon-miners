## Coinminers — Visual Density & Atmosphere Overhaul

Goal: transform the empty center stage into a busy, layered, animated mining facility, sharpen reward feedback, and make progression visible. Pure frontend/presentation work — no game-balance changes.

### 1. Rebuild the center stage (`RoomScene.tsx`)
Replace the current single-shelf column with a 3-layer parallax scene that fills the whole panel.

- **Background layer**: pixel city skyline at night, rain streaks, distant blinking antenna lights, server-wall silhouette, large window frame with neon glow bleed.
- **Midground layer**: vertical rack of tall shelves (current system, kept), plus a second wall of server blades, cooling pipes running along the ceiling, a desk with monitor showing a live hashrate sparkline.
- **Foreground layer**: hanging cables swaying (CSS keyframes), drifting dust motes in a light shaft, occasional spark burst near a rig, steam puff from a vent.
- All three layers absolute-positioned inside a `relative` container that grows to fill `main` (no fixed 560px — use `flex-1 min-h-[640px]`).

### 2. Constant environmental animation
Add a small `Ambience` component layered on top of the scene with:

- Floating ₿ particles rising from active shelves (one every ~1.2s, fades at top).
- Heat shimmer (`backdrop-filter` wavy mask) over high-heat shelves.
- Flickering ceiling LED strip (opacity keyframes, randomized).
- Oscillating wall fan in a corner (separate from GPU fans).
- Scanline sweep across the whole scene every 6s.

### 3. Visible progression tied to state
Scene reacts to `owned.length`, `shelves`, `totalUpgrades`, `facility`:

- Shelves physically appear as bought (already true) — also light up their LED strip color brighter as they fill.
- Cable bundle thickens as more GPUs are owned (SVG path width = f(owned)).
- Background server wall reveals more lit blades as hashrate crosses thresholds.
- Facility tier swaps the wall texture / palette (garage planks → concrete → steel → vault red → datacenter cyan → quantum holo → space stars).

### 4. Beefier GPU art (`PixelGpu.tsx`)
- Larger default render (current size kept for shelves via `scale`, but Shop/Inventory cards use 2× size).
- Rarity frame: animated border whose color & glow intensity come from `rarity` (Common gray → Mythic cyan with rotating conic gradient).
- Manufacturer tag (3-letter pixel logo per tier).
- Heat bar on the card edge (red fill = current heat).
- Tiny spark sprite that pops every few seconds on Epic+.
- Keep RGB strip + center-pivot fans (already fixed).

### 5. Stronger mining feedback
- **Floating numbers**: when a mining tick fires, spawn a `+0.000123 ₿` text that floats up & fades near the BTC HUD.
- **Pulse**: BTC balance number scales 1→1.08→1 on each tick.
- **Hashrate surge**: when an upgrade is bought, brief screen-shake (CSS class toggled for 250ms) + radial flash.
- **Server pulse**: every shelf row emits a soft glow pulse synced to the tick interval.
- **Progress bars**: a small "next block" bar in the HUD fills continuously.

### 6. Typography hierarchy (`styles.css` + HUD)
- Press Start 2P kept for headers; bump section titles to 14–16px.
- BTC balance: 22px, neon-orange, glow.
- Hashrate / profit: 14px secondary.
- Lesser stats: 10px muted.
- Add `.stat-primary`, `.stat-secondary`, `.stat-muted` utility classes.

### 7. Rarity color system
Centralize in `data.ts` (or a new `rarity.ts`): mapping rarity → border color, glow color, animation name. Used by GPU cards, inventory tiles, and shop list. Mythic gets a rotating conic-gradient border (`@keyframes spin-border`).

### 8. Room clutter
Add a `Clutter` SVG layer with hand-placed pixel props: empty soda cans, toolbox, thermal-paste tube, sticky notes, screwdriver, USB stick, dust piles, "DANGER HIGH VOLTAGE" sign. Static — purely decorative density.

### 9. UI motion
- Number rolling: small `useRollingNumber` hook (lerps display value toward target).
- Hover glow on all sidebar tabs and shop rows (existing classes extended).
- Pulsing "BUY" buttons when affordable (subtle scale + glow).
- Scanline sweep on active panel header.

### 10. Prestige visual hook (scaffold only)
Add a `prestigeTier` prop threaded into `RoomScene` (defaults to 0 since prestige logic isn't wired yet). Scene already swaps palette by `facility`; prestige tier multiplies glow intensity and unlocks extra background props (holo miners, orbital window). No new game logic — just a visual variable ready to bind later.

### Out of scope (for this pass)
- Sound-reactive visuals (no audio system yet).
- Real prestige mechanics.
- Animated workers/drones beyond a single looping sprite (can add later if you want).

### Files touched
- `src/game/RoomScene.tsx` — major rewrite into layered scene.
- `src/game/PixelGpu.tsx` — rarity frame, heat bar, sparks, manufacturer tag.
- `src/game/Coinminers.tsx` — floating BTC numbers, rolling numbers, screen-shake hook, HUD typography classes, larger GPU renders in shop/inventory.
- `src/game/data.ts` — rarity → style map, manufacturer tags.
- `src/game/Ambience.tsx` (new) — particles, shimmer, scanlines, dust.
- `src/game/Clutter.tsx` (new) — decorative pixel props.
- `src/styles.css` — new keyframes (spark, float-up, shake, spin-border, flicker, scanline), stat utility classes, pixel-rain background.
