# MovieSapaMapuh 1.0.4 — floating dock and Library

This pass extends 1.0.3 on `feature/moviesapamapuh`. It preserves all previous commits, APK files and assets. No backend, Telegram, TDLib, playback, route or filter-controller changes.

## Fixed

- Replaced the mobile sidebar presentation with a fixed dark capsule, 14px above the bottom safe inset. All original Home, Search, Library, Addons and Settings buttons, SVG icons, labels and actions remain. Both legacy and modern sidebar variants receive the same layout. Selected tabs have a compact crimson surface; labels stay visible even when the underlying sidebar is collapsed. Transitions are 200ms, with reduced-motion support.
- Labels can wrap and the capsule can grow. A ResizeObserver measures its real height and reserves matching content space, including safe insets. Older browsers use the CSS fallback and resize measurements. Modern navigation remains exposed to accessibility APIs on mobile; desktop sidebar accessibility follows its original expanded state. Observers disconnect when route nodes are removed.
- Removed the Library empty state's inherited 640px minimum height, 46px heading and 28px description. It uses a 22px heading, 14px description and 44px original bookmark SVG. The original Type, Sort, Watched and conditional List/Genre/Year filters remain.
- Library fills the available viewport with one scrolling container. An empty state grows into remaining space without forcing scrolling; populated grids, short landscape windows and enlarged text can scroll normally. There is no global scroll suppression or fixed content height.
- Traced `No all yet` to `Xhe(__all__)` returning `all`, which the original controller inserts into `No {type} yet`. Two explicit presentation hooks adapt the displayed title/subtitle using real controller state. Empty local, Trakt-list and Simkl-status messages are distinct. Zero results in a nonempty selected scope show `No matching titles` and a filter hint. The original saving/list instructions and disconnected-account guidance remain. Existing translated messages are retained; the new wording corrects the English fallback.
- Si Youyou treats the complete dock and Library empty-state region as obstacles. It suppresses itself on overlap without changing its saved anchor. The original 1.0.3 animation, drag and fullscreen fixes remain.

## Scope and review

`noir-dock-library.css` contains the modular presentation changes. `noir.js` contains display wording and navigation measurement/accessibility. Public and Android assets are synchronized. The compiled shell has only two render-time hooks, recorded exactly in `tools/fixtures/library-copy-patch.json`; the static preservation gate compares everything else against the historical bundle. Controller, filter, route and player methods remain unchanged.

The capsule follows the existing mobile breakpoint of 800 CSS pixels. Wider dashboards retain their desktop sidebar layout. An optional Discover item configured through existing settings remains available rather than being removed to force five entries.

## Validation

- `tools/test-dock-library.cjs` uses the real bundled navigation and empty-state renderer functions with isolated data. Covers both sidebar variants and the five navigation selections at 320×568, 360×640, 390×844, 412×915, 740×480 and 740×360, plus a 320×240 constrained viewport.
- Checks SVG icons, visible/unclipped labels, equal item widths, touch targets, original action identifiers, accessible modern sidebar, empty and populated Library scrolling, reachable final cards, stable dock position, English state-specific copy, simulated safe inset, enlarged text and pet suppression.
- Existing detail/source and presentation regression suites retained. Static preservation gate checks original controls/text and engine code, allowing only the two exact empty-copy hooks.
- Fixture screenshots under `dist/dock-library-screenshots/` are synthetic test data, not a connected account or a physical handset.

Local `assembleDebug` and `lintDebug` passed. Lint reports 0 errors and 90 warnings. The universal APK contains both pinned JNI libraries and 150 source-matching bundled assets. All three ABI outputs pass ZIP integrity and Android v1/v2 signature checks, use version code 10004, and match the previous local signing certificate. The 1.0.3 APK checksums remain unchanged.

Build/signature/checksum results are recorded in `APK_ARTIFACTS_1.0.4.json`. GitHub Actions now runs the added regression suite and uploads its screenshots with the existing presentation artifacts.

## Remaining limits

Physical Android/WebView, gesture-navigation insets, accessibility font scaling and live populated account data still need device review. Safe-inset and enlarged-text tests are browser simulations. No new real streaming session was performed. The existing Home/search, addon-management, advanced settings and player layouts are retained beyond the mobile dock styling. The earlier NOIR detail/source changes are preserved.
