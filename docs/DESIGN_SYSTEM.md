# NOIR Crimson design specification

Planned, not implemented. Preserve every existing text and action; increase space and scrolling rather than shortening content.

| Token | Value |
|---|---|
| Background | #0C0C0F |
| Surface | #222228 |
| Accent | #F04452 |
| Muted text | #AFAFB9 |
| Main text | #F7F7F8 |
| Success | #66D0A0 |

Use shared web custom properties and Android color/style resources. Prefer Inter/Manrope only with a distributable, licensed font asset; retain a readable system fallback. Use restrained 16–24px corners, subtle dividers, clear text hierarchy and touch targets at least 48dp on Android. Verify contrast for the actual foreground/background pair rather than assuming every token combination is accessible.

Preserve supplied RGBA logo masters: 1254×1254 mark, 2172×724 wordmark. Fit proportionally. Launcher masking requires a reviewed safe-area derivative; the master artwork remains unchanged. Use native vector icons / licensed SVG icons and retain textual labels. No new system overlay permission.

Native: retain original screen/navigation, view IDs, callback wiring and service state. Web: use an additive scoped stylesheet, preserve DOM-backed controls, allow multiline labels and full-height modal scrolling. Avoid broad rules that hide legacy controls or assume all shell classes are stable. APK must package the exact reviewed web assets deterministically.

Pet sits only in safe regions, yields to dialogs/keyboard/fullscreen/player controls and respects reduced motion. Design validation is pending recovered native source and full pet assets.
