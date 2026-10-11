# MovieSapaMapuh 1.0.3 — UI refinement

This pass starts from `0f1c851` on `feature/moviesapamapuh`. The user reports the installed app and video playback work. That report is retained as user feedback, not claimed as a new playback test in this workspace. Original commits, reference assets and previous APKs are preserved.

## Si Youyou

- Removed the additional flame image/rendering paths and Flame Effects toggle in both native and browser settings. The original artwork's built-in flames remain untouched. Original effect PNGs remain in the asset pack for preservation but are unused.
- Added audited alpha-bound anchors, a shared logical ground line and an 84 dp/CSS-pixel visible artwork height. Four walk frames share a common canvas/ground line; native decode retains its prior good frame until the next pose is ready.
- Browser animation frames now use elapsed time, not the number of scroll/mutation redraws. Walking is a short bounded excursion around the saved anchor, not unbounded wandering.
- Browser placement initializes once and stays fixed to the viewport. Scrolling no longer searches for another free position. If a control, source card or readable text occupies the anchor, the pet is temporarily hidden and restored at the same anchor when clear. Dragging saves the new position; resizing clamps it inside the viewport.
- Native drag uses the touch-down offset instead of snapping the sprite center to the finger. Native pet remains within its reserved home-screen card and cannot cover server controls.
- Fullscreen/dialog/input suppression and reduced-motion/background handling remain. No extra overlays or particle system are rendered.

## Details and sources

The first theme pass largely missed the prebuilt shell's `.series-detail-*` and `.stream-route-*` classes. This pass targets those actual classes through additive CSS, without editing the compiled shell or playback handlers.

- Compact, wrapping detail titles and section headings; removed the old TV-sized brand spacer and excessive hero height outside trailer playback.
- Balanced action row, 44px minimum controls, crimson primary action and readable secondary buttons. All original actions and text remain.
- Structured metadata/ratings, readable full synopsis, smaller cast cards with wrapping names/roles, and clear section dividers/tabs.
- Source cards use charcoal surfaces, crimson focus/selection, smaller metadata and wrapping filenames. Provider names, IDs, file names and all source actions remain unchanged.
- Mobile source page retains its title/metadata instead of the old hidden left panel. Filter controls keep their own height; the existing source-list scroll container and virtualization markup are preserved. Desktop/tablet columns no longer require a fixed oversized minimum width.
- Legacy `.stream-file-card` and `.stream-modal` surfaces receive matching palette, spacing and wrapping, without replacing their structure.

## Branding and contrast

Owned application branding was updated in the public loading fallback, catalog guidance, standalone authentication page, version display and restart/reinstall guidance. API-service references, provider/addon identities, generated stream names, technical package identifiers, filenames, third-party brands and legal attribution are intentionally retained.

NativeHttpServer and backend.php changes are limited to exact app-owned string substitutions and the standalone password-page CSS. The auth form, handlers, routes, data and streaming logic are unchanged. The parity checker verifies this narrow exception rather than claiming those files are byte-identical.

Dark surfaces use #F7F7F8 primary and #AFAFB9 secondary text. Crimson filled buttons use the darker #B92336 with light text to meet normal-text contrast; focus/link highlights use #FF8591. Fixed the bundled detail button and settings-dialog foreground/background pairings. Standalone authentication uses the same readable palette.

## Validation

- Static preservation gate: original text/control IDs retained, apart from documented app-brand substitutions and the explicitly requested removal of Flame Effects. Frontend handlers/bundles/translations unchanged beyond exact app-brand text replacements. Native WebActivity, TdLibManager and ServerService unchanged from the working build.
- Browser tests cover public and Android web bundles at 360, 390, 768, 1024 and 1440px: detail/source text contrast >= 4.5:1 for sampled normal-text controls, headings within viewport, full filenames, usable source-list height and bottom scrolling. Pet tests cover fixed scroll position, collision suppression/restoration, one artwork layer, drag persistence, reduced motion and fullscreen suppression.
- Tests use representative markup based on the actual bundled renderers, without running APIs or media requests. They cannot establish real streaming, all dynamically generated screens or complete accessibility compliance.
- Native assembly/lint, APK signature/package checks and asset checks are recorded in the accompanying artifact verification. Build reuses the verified native libraries; no TDLib rebuild or upgrade.
- Workspace screenshots: `dist/refinement-screenshots/`. Screenshots depict test data, not a live media catalog.

## Remaining limits / legacy layouts

Physical-device review is still needed for native touch behavior, sprite pose continuity, very large accessibility fonts, old Android WebView and long/virtualized real source lists. A common artwork envelope cannot erase anatomy/framing differences in the supplied poses; no new artwork was invented. Right-facing sprites are still unavailable.

Home/discovery, search, library, addon/plugin management, advanced shell settings, cast-person biography and the player controls still use their existing structural layouts. They inherit some NOIR tokens but have not received a complete layout redesign in this focused pass. Legacy PHP movie/file overlays retain their original structure with styling adjustments. Playback UI logic and media controls are deliberately preserved.

Version is 1.0.3 / 10003 with applicationId `com.moviesapamapuh.server`. Local APKs retain the prior local development signing key. Builds signed by another CI/debug key may not upgrade this installation; do not uninstall merely to bypass a signature mismatch. Release-feed/signing and prior licensing limitations remain as documented in BUILD_ANDROID.md.

## Final local build evidence

`assembleDebug` and `lintDebug` completed successfully: 0 lint errors, 90 warnings. APK verification checks both unchanged TDLib libraries and all 149 bundled assets. Universal, ARM64 and ARMv7 APKs verify with v1/v2 signatures and the same certificate as the previous local build. Exact hashes and paths are in APK_ARTIFACTS_1.0.3.json. Previous APK checksums still match.

The existing MovieSapaMapuh Android workflow now also triggers on relevant pushes to this feature branch, avoiding a separate API-authenticated dispatch. Concurrent runs for the same branch are consolidated. Hosted execution/artifact availability must be checked on GitHub; local success is not reported as hosted CI success.
