# Si Youyou — Codex-ready Animation Asset Pack

**Character:** Si Youyou  
**App theme:** NOIR Crimson (`#0C0C0F` + `#F04452`)  
**Artwork:** Detailed chibi / pixel-art fantasy character  
**Source:** User-provided original PNGs. No new poses were generated.

## What is included

- `originals/`: **9 original uploaded PNGs**, byte-for-byte unchanged except meaningful filenames.
- `sprites/`: **21 individual PNGs** extracted from the originals, transparent RGBA.
- `previews/`: contact sheet for quickly identifying original sheets.
- `manifest.json`: mapping from original random names to new filenames, sprite pose, and original crop regions.

## State mapping

| State | Files / notes |
|---|---|
| Idle | `sprites/idle/si_youyou_idle_front.png`, `...side_left.png`, `...back.png` |
| Blink | `sprites/blink/si_youyou_blink_front.png`, `...side_left.png` |
| Walk | `sprites/walk/si_youyou_walk_left_01.png` through `_04.png` (4 frames) |
| Jump | `sprites/jump/si_youyou_jump_crouch.png`, `_airborne.png`, `_landing.png` (3 poses; verify animation sequence in-app) |
| Sit | `sprites/sit/si_youyou_sit_front.png`, `_side_left.png` |
| Sleep | `sprites/sleep/si_youyou_sleep_front.png`, `_side_left.png` |
| Happy / Wave | `sprites/reactions/si_youyou_happy.png`, `_wave.png` |
| Flame effect | `sprites/effects/flame/si_youyou_flame_01.png` to `_03.png` (3 aura variations, no character) |

## Codex implementation considerations

1. Keep assets transparent and preserve Si Youyou's hairstyle, crown, costume, facial style, proportions and red flame aura.
2. Original sheets stay intact in `originals/` if any split needs adjustment. Pixel art: prefer nearest-neighbor when scaling down to pixel-art style, but visually review results at the actual UI size because the source contains fine details.
3. Use a pet state machine and preload only relevant frames. Play walk left as a 4-frame loop; animation speed can be tuned after preview. The four walk images are normalized to a common transparent canvas.
4. Align idle-to-blink using feet/face anchors; source blink poses have slightly different framing, so swapping images blindly may create a visual jump.
5. Treat the 3 flame images as a **separate optional VFX overlay**, not an exact layer-mask for the body's surrounding fire. Align manually and disable the overlay in compact mode if it obscures UI.
6. Motion effects that are appropriate to implement in code: bobbing, easing, click bounce, low-opacity glow/pulse, drifting embers, draggable positioning and fullscreen hide.
7. Main artwork has a wide crimson aura. For narrow mobile spaces, reduce **rendered size** or create a dedicated compact character source later. Do not crop off character limbs or cut flame across frame edges.
8. Never block Play, Search, Back or server power controls. Provide toggle to hide the pet and respect reduced-motion preferences.
9. Do not change server backend/APIs during pet integration; use a separate UI overlay and event handlers.

## Asset caveats

- **9 unique PNG files** were present in the uploaded ZIP; it is not a 10-file ZIP. The 2 original visuals from the chat are represented inside as the front idle image and side/back sheet.
- No distinct compact-flame character PNG was found. That is an optional follow-up asset, not a blocker for a functional V1.
- Side view faces left; mirroring to face right may reverse asymmetrical costume elements. A separate right-facing asset is optional.

## License / usage

These character graphics come from the user's upload. Keep them private as requested, and confirm source artwork ownership / rights before redistributing outside personal use.
