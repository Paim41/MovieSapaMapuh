# MovieSapaMapuh test report — 2026-10-11

Work is in `Paim41/pencarimovie-server`, branch `feature/moviesapamapuh`. No upstream writes. This report separates source/build checks from runtime acceptance; full feature parity is not claimed.

## Passed locally

| Check | Evidence / limit |
|---|---|
| Historical source recovery | a1f5091 is the closest available revision: all 114 reference APK web assets match after CRLF normalization (65 exact, 49 line-ending-only). Not an exact native source attestation. |
| Trusted TDLib recovery | Official TDLib 1.8.64 commit e0943d068ce90b5010f1aea946e6901e25b43bf6; all 3,037 generated constructor IDs match the historical JAR. Official OpenSSL 1.1.1w and NDK r23c pins are in ANDROID_DEPENDENCY_PROVENANCE.json. |
| Native dependency builds | ARM64 and ARMv7 compiled from official sources, 562 native steps each. No reference APK binary reused. |
| Original baseline APK | Original identity compiled/assembled before visual work; both native libraries and all 114 original web assets matched their build inputs; v1/v2 signatures verified. Baseline outputs are kept separately from the branded app. |
| Split asset audit | Both replacement archives merged; README/manifest/names preserved, 9 originals and 21 RGBA sprites dimension/hash checked. See SI_YOUYOU_ASSET_AUDIT.json. |
| Branded Kotlin/Java and APK build | `assembleDebug` successful for universal, arm64-v8a and armeabi-v7a. Package com.moviesapamapuh.server, label MovieSapaMapuh, version 1.0.2/10002, min21/target28/compile36. |
| Android lint | Zero errors, 90 warnings. Existing compatibility/deprecation warnings and new presentation/localization warnings remain; no blanket lint suppression was added for them. |
| APK contents | `tools/verify-android-apk.py`: both pinned JNI libraries, expected ELF architecture/TDLib metadata and all 148 bundled assets (including 143 web files and the notices) match intended inputs. This includes supplied logos, pet sprites and both presentation adapters. |
| Signatures | `apksigner verify --verbose --print-certs`: all three branded APKs verify with v1 and v2 signatures using the development key. Not the upstream or a production release key. |
| Static text and source preservation | `tools/check-ui-parity.py`: original public/native HTML labels, attributes and IDs, native layout/string values and control IDs retained except owned-brand allowlist. Both app.js files equal their respective baselines after brand substitutions; existing JS bundles, other JS runtime files and translations unchanged. PHP engine/config/dependency entry files byte-identical. |
| Browser presentation fixture | Both public and Android web bundles tested in headless Chromium using Playwright. Tap, drag ownership/bounds, persisted settings, reduced motion, actual media DOM signal, dynamically created download button, fullscreen hide/restore. Settings and Addon conditional sections exposed in the fixture: no card horizontal overflow and full bottom-scroll access at 360, 390, 768 and 1440 pixels. This uses original HTML/CSS plus new adapters, with app/backend scripts disabled; no simulated server success. |
| Basic tooling checks | New JS syntax, native build-helper shell syntax, workflow YAML parsing and diff whitespace checks passed for authored files; copied asset README files retain intentional Markdown hard-break whitespace. These are not hosted Actions results. |
| Existing desktop onboarding | Earlier locked Composer installation/platform checks, PHP and shell syntax, local dashboard/manifest smoke and environment preflight passed. They do not validate native APK streaming. |

The native `testDebugUnitTest` task is **NO-SOURCE**, not a passing test suite. No instrumentation tests ran. Fixture screenshots are in local `dist/screenshots/`; they are review evidence for layout only, not live-service screenshots.

## Artifacts and build logs

Final APK filenames and SHA-256 values are recorded in APK_ARTIFACTS.json and alongside the local files in `dist/`. Original baseline APKs remain under `dist/android-baseline/` and must not be confused with the independent branded app. The local debug key is not included in source or artifacts.

Workspace-only build/provenance logs: `/workspace/moviesapamapuh-audit/provenance/gradle-baseline-validated.log`, `gradle-branded-final.log`, `gradle-delivery.log`, and `branded-apk-verification.json`. The original build dependency fingerprints are committed in ANDROID_DEPENDENCY_PROVENANCE.json.

## Not run / unresolved

- GitHub hosted Actions: not run. `gh auth status` reports the provided GH_TOKEN invalid; earlier GitHub API requests returned Forbidden. The workflow is prepared, not proof of a hosted artifact. No push, PR, release publication or signed release is claimed.
- POCO F3, other physical Android phones, emulator installation/startup, API21/old WebView, Android16/16-KiB-page compatibility, launcher masks, native dialog/text scaling and orientation behavior.
- Telegram authentication, real bot management/password changes, server start/stop/LAN access, boot/autostart/Doze, screen-off service operation, notification lifecycle, tunnels and update installation.
- Real playback, seek/range/reconnect/download, metadata/catalog services, Stremio/Nuvio/Eclipse and external players. Their preserved source does not prove runtime health.
- Full runtime/dynamic text traversal, keyboard/TV accessibility, all media UI interactions. Static source preservation cannot detect every reachability regression.
- Pet optical/feet alignment across differently framed poses, native touch/menu behavior, no-space scenarios across all dynamic screens, long-session memory and CPU/battery behavior while streaming. Artwork has no right-facing or compact-flame set; no substitute art was invented.
- Release signing/upgrade continuity. CI debug keys can differ across builds; a stable private release key is required for upgrades.
- Upstream MIT/GPL README conflict and complete bundled-component/artwork distribution review. Original notices retained; TDLib/OpenSSL notices bundled. OpenSSL 1.1.1w remains pinned for baseline compatibility rather than silently upgraded.

Use FEATURE_PARITY.md as the manual acceptance checklist. Keep the original app/data for rollback and do not mark its unchecked runtime rows complete based on compilation or fixture results.
