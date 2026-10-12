# Si Youyou replacement — 1.0.5

## Scope

The supplied pasted request explicitly supersedes preservation of the retired pet and authorizes removing its settings. Both `walk.zip` and `SiYouyou_Cursor_Assets.zip` are integrated. The cursor README/manifest and actual normal/click PNGs were inspected before implementation. This update replaces the companion with two independent modules: a loading mascot and a native CSS cursor.

## Removed

- Native `SiYouyouView`, its card and Pet Settings button, lifecycle callbacks and server-event reactions.
- Web floating button/overlay, settings panel, roaming/drag/tap/long-press behavior, pose state machine, event reactions, timers and pet CSS/JavaScript.
- All obsolete runtime sprites/effects, anchor metadata and pet-pack manifest. The original files are preserved unchanged under `reference-assets/si-youyou/retired-runtime/`, outside both runtime bundles; original source archives/development artwork also remain in the workspace.
- Only the dedicated `moviesapamapuh.pet` native preferences and `moviesapamapuh.pet.v1` web storage entry are cleared. No other preferences, account data or storage are cleared.

## Shared walking loader

`youyou-loader.js` attaches one reusable visual component to existing, explicit loading-state containers. Request lifecycles, timeout/error/retry decisions and cache handling remain in the original controllers. There are no fetch interceptors, artificial delays, global blocking overlays or animation timers.

The four PNGs from the newly supplied `walk.zip` are copied byte-for-byte into both runtime bundles. Canvas 740×586, common feet baseline y=576, fixed rendered canvas 148×117.2 CSS pixels; intrinsic pose differences are preserved without per-frame cropping, resizing or anchor shifts. The four-frame CSS sequence runs at **8 FPS**. All frames preload once, CSS animations pause offscreen/background, and animation disappears with the original loading container. Reduced motion displays the first supplied frame. Image failure keeps a readable loading label and the original failure/retry lifecycle.

Coverage:

- Initial Home and modern Home hero loading: old skeleton markup replaced with shared host markup.
- Search and Library data loading.
- Movie Details initial loading.
- Source-selection initial/incremental loading, including the existing hidden stable-loading row; only one mascot replaces repeated skeleton cards.
- Existing series stream-selection, account/settings synchronization, catalog-order, cast/see-all/entity rail, legacy stream list, file resolving, category loading and initial dashboard provisioning indicators where those explicit containers exist.

Loading labels remain, including provisioning, Library and source status. Empty Library, Start Searching/No Results, authentication/network/stream errors and Retry controls are not reclassified as loading. No player buffering overlay or media controls are modified.

Per-card enrichment/progressive-rendering placeholder geometry remains where the original focus/render logic depends on it. Its decorative text strokes and media shimmer are suppressed; it is not turned into a fake ongoing request or a row of duplicated mascots.

## CSS cursor

`youyou-cursor.js/.css` uses only the supplied 64px normal and click PNGs (about 15 KiB total). Both remain byte-for-byte unchanged. Source artwork, 48px alternatives, optional waiting image, README and manifest are preserved in `reference-assets/si-youyou/cursor/`, outside runtime packaging.

Hotspots are normal **(10,33)** and pressed **(11,40)**, adjusted from the manifest's (10,34)/(10,41) estimates to opaque fingertip pixels after visual and pixel-coordinate inspection. CSS keeps the native pointer coordinate fixed while compensating for the different finger locations; it does not translate DOM content or track mouse coordinates.

Fine-pointer/hover capability plus actual mouse input governs activation. Ordinary touch disables the custom cursor, including mixed-input desktops, until mouse input resumes. A primary fine pointer can enable it initially once both images preload. Native fallbacks remain if images fail or the browser rejects custom cursors. No cursor/Pet Settings are added.

Left press selects the click pose. Release, pointer cancellation, lost capture/focus, navigation, drag start and removal/hiding of the pressed DOM node reset it. Native text editing, resize/grab semantics, media controls and fullscreen are preserved. Functional cursor detection happens only on target entry/press; there is no mousemove rendering, fake pointer element or animation loop. Optional waiting artwork is intentionally unused: existing native progress/wait behavior stays in charge.

## Search and preserved UI

Search empty headings are 22px, descriptions 14px with 1.6 line height, and the decorative search glyph is a 48px SVG. `Start Searching` and `Enter at least 2 characters` remain unchanged. Mobile Search uses the remaining viewport area and the measured dock reserve, with normal overflow on short windows. Original search input validation, filters, routes and result handling are unchanged.

The existing NOIR palette, floating dock, Library, detail/source refinements and branding remain. The static preservation gate verifies that original frontend controllers/handlers and PHP/native engine files are unchanged, except previously allowed branding and the explicit presentation-only markup patches recorded in `tools/fixtures/loader-markup-patch.json`. Native MainActivity is compared against 1.0.4 allowing only pet removal and scoped preference cleanup.

## Performance and validation

Runtime companion artwork drops from approximately 18 MiB to 2.2 MiB per web bundle. No new dependencies or frameworks. CSS frame stepping replaces the old continuously scheduled pet renderer; lifecycle observation is restricted to explicit loading containers and disconnected nodes are released.

`test-youyou-loader.cjs` checks both web bundles: supplied frame dimensions/order, stable canvas, preload, reduced motion, unique instances, source loading-row visibility, same-tick cache results, error/retry preservation, image-failure fallback, storage cleanup, retired pet absence, and Search at 320×568, 360×640, 390×844, 412×915, 740×480 and 320×240. Existing dock/Library, detail/source and settings/addon suites remain, replacing obsolete positive pet assertions with removal assertions. Fixture screenshots are under `dist/loader-screenshots/`.

`test-youyou-cursor.cjs` checks both bundles with fine-pointer and emulated touch contexts: native CSS URL/hotspots, a 16px button click near its edge, pressed resets, navigation, text input, resize/grab, mixed touch, fullscreen, missing images, and simultaneous independent loader/cursor activity.

Final local `assembleDebug` and `lintDebug` completed successfully in 1m 6s. Lint reports **0 errors / 84 warnings**. All three APKs pass ZIP and v1/v2 signature verification, use version code 10005 and match the previous local signing certificate. The universal APK contains both pinned JNI libraries and 134 source-matching assets. Retired pet code/art and reference originals are absent. Earlier 1.0.3/1.0.4 APK checksums remain unchanged. Universal size is 41,432,521 bytes, about 16 MB smaller than 1.0.4.

Build results, signing and checksums are recorded separately in `APK_ARTIFACTS_1.0.5.json`. Local builds reuse the already verified TDLib/OpenSSL outputs. The existing full GitHub APK workflow still builds its pinned native dependencies and uploads APKs; its completion must be checked on GitHub, not inferred from a push.

Remaining verification: real Android/WebView rendering, external-mouse support, live request transitions, optical animation smoothness and physical-device playback regression. The automated tests use isolated DOM/data fixtures and do not claim a new successful real streaming session. OS-composited cursor appearance/hotspot perception, external mice on Android WebView and browsers other than tested Chromium still need physical-device review. Tiny-target coordinate tests verify event accuracy, not the visual rendering of an OS cursor in screenshots.
