# Si Youyou Cursor Assets — MovieSapaMapuh

This is a **desktop-web custom pointer pack**, not a virtual-pet animation pack. It contains seven original 1254×1254 transparent PNG assets from `asset-cursor.zip`, renamed by visual function. All originals are preserved byte-for-byte.

## What to use

- `runtime/64/normal.png` — primary left-pointing cursor.
- `runtime/64/click.png` — pointer-down/click visual reaction.
- `runtime/64/waiting.png` — optional waiting cursor; fallback to native `progress` if distracting.
- `runtime/48/*` — smaller fallback variants.
- `originals/*` — seven full-resolution originals, including hover, down-left, mini, and sparkle alternatives. **Do not ship all originals in the APK unnecessarily.**

## Hotspot and size

Hotspots differ by pose. Use `cursor_manifest.json` for coordinates. For 64 px images, suggested starting coordinates:

- normal: `10 34`
- click: `10 41`
- waiting: `32 32` (optional; not a precise pointing fingertip)

For 48 px images use the hotspot coordinates in `cursor_manifest.json`. The coordinates are visually estimated, not certified pixel-perfect. Test mouse clicks at page corners and on small buttons; tune them if needed.

## Use in browsers

Use CSS `cursor: url('/assets/cursor/64/normal.png') 10 34, auto;` on hover/pointer-fine devices. Use the click cursor only on genuine mouse pointer-down, restoring normal on mouse up, pointer cancel, blur, or route changes. Prefer robust CSS/JS state handling; do not create a large overlay following the mouse. Keep native `text` I-beam over inputs and contenteditable, and native resize/grab cursors where necessary. Fall back to native cursors if assets are unavailable or rejected by the browser.

Ensure the host app copies runtime files into *web assets actually bundled into the Android APK*; a dev-only frontend change is insufficient.

## Platform behavior

- Desktop browsers with fine mouse/trackpad: custom cursor may be used.
- Android touchscreens: standard touch behavior, **no** cursor image or pointer overlay.
- Webview with connected mouse: support only if fine-pointer capability is reliably detected; no assumption of Android mouse support.

## Relation to Si Youyou loading

Si Youyou's **four-frame `walk.zip` loading animation** is separate. Keep the loader if already implemented. Do not reintroduce floating pet, idle roaming, particles, pet settings, or full-screen blocking animation unrelated to real loading.

## Original mapping

| Original UUID prefix | New name |
| --- | --- |
| `5b25b701` | `si_youyou_cursor_normal_left.png` |
| `7bad5e98` | `si_youyou_cursor_click.png` |
| `5871258b` | `si_youyou_cursor_waiting.png` |
| `0dc3b8af` | `si_youyou_cursor_hover_alternative.png` |
| `571b3fb2` | `si_youyou_cursor_down_left_alternative.png` |
| `8a0204cb` | `si_youyou_cursor_mini_alternative.png` |
| `7026d71c` | `si_youyou_cursor_sparkle_optional.png` |

The package also includes `docs/CODEX_INTEGRATION_PROMPT.md`.
