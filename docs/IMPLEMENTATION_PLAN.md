# MovieSapaMapuh audit and implementation plan

Status (2026-10-11): recovery and the original Android baseline build succeeded. Branding, native/web NOIR presentation and Si Youyou are implemented in reviewable phases. Local build and fixture validation are recorded in TEST_REPORT.md. Physical-device and authenticated-service acceptance remains pending.

The original audit findings below describe the checkout before recovery; superseding evidence is in ANDROID_RECOVERY.md and ANDROID_DEPENDENCY_PROVENANCE.json.

## Repository and evidence

- Editable origin: `https://github.com/Paim41/pencarimovie-server.git`.
- Baseline: `6e278427e3e4f5e2f5868df7c4f6211905298ca5`; feature branch: `feature/moviesapamapuh`. No upstream edits or pushes.
- 298 tracked files inventoried in `baseline-files.json`; complete file hashes retain evidence for all existing bytes, including text, settings, bundles and translations.
- The original baseline commit explicitly removes `android/pencarimovie-server` (173 changed files in that commit). `.gitignore` documents that the project is deliberately kept local.
- Historical source exists in parent `a1f5091ceef836d801c8f8efac2392b4431da6ac`. It was initially inspected outside the checkout, then restored in a19c0bb without resetting the branch or using APK implementation binaries.
- Actual reference APK: package `com.pencarimovie.server`, versionName `1.0.9`, versionCode `10009`, minSdk 21, targetSdk 28, compileSdk 36. Its manifest and ZIP resources were inspected without decompiling application code.
- APK SHA-256: `6cc438284aa600a050d7db6e8cc3d0161cd8f987a21330691342fbda161f7eff`.

## Architecture and source completeness

The current desktop/server checkout routes `router.php` and `index.php` into `backend.php`. PHP 8.2+ with Composer/MadelineProto implements Telegram sessions, bot pools, remote authentication, file resolution, streams/downloads and addon endpoints. Caddy/FrankenPHP supplies the production runtime; native PHP serves the CI smoke workflow. `src/` contains only a placeholder. Local mutable state is in `storage/`; environment overrides and optional databases/tunnels must be retained.

The two remaining Android projects are Kotlin/Java Termux bootstrap wrappers (`com.pencarimovie.downloader`). Their NativeRunner downloads server releases; they are not the supplied APK. The ARM project selects arm64-v8a without universal output; a separate x86_64 project exists. MainActivity, WebActivity, ServerService, BootReceiver, updater, notification, network monitoring, wake/Wi-Fi locks and preferences must be preserved if these wrappers are ever changed.

The historical **actual native app** is Kotlin + NanoHTTPD + TDLib, with OkHttp and XZ support. NativeHttpServer serves bundled `assets/web/` and implements its own APIs and byte-range streaming. It does not execute this checkout's PHP backend. Editing `public/` alone therefore does not update the installed APK. Its native services preserve boot preferences, foreground notifications and wake/Wi-Fi locks; WebActivity wraps the served UI. Historical Gradle defaults are 1.0.2/10002, not proof of the reference APK's exact source revision because builds can override versions.

Historical `tdlib.jar` exists, but neither `src/main/jniLibs/arm64-v8a/libtdjni.so` nor `src/main/jniLibs/armeabi-v7a/libtdjni.so` is tracked in that parent. The APK contains both. No matching, pinned native dependency build recipe was found in the selected source. Do not extract APK libraries as implementation inputs or claim a successful native build from this evidence.

## Web and assets

- `public/index.html`, `app.js`, `styles.css`, `stream-theme.css` provide the overlay, server settings, addon setup, browsing and player interactions.
- A prebuilt `app.bundle.js` plus `css/bundle.css`, boot guard, polyfills, platform libraries and 36 translation JSON files provide the integrated shell. `build:nuvio` expects ignored `storage/NuvioTVSmart`, absent from this checkout. Generated bundles must not be blindly rewritten.
- `index.html` references `assets/runtime/legacy-polyfills.js`, absent from current tracked public files but present in the reference APK: existing compatibility gap, not caused by this work.
- Of 114 APK web files compared with `public/`: 57 byte-identical, 45 differ only by CRLF/LF, 11 differ in content, 1 exists only in APK. Differences include app JS/bundle, HTML/CSS, boot dependencies and player libraries. Source and APK are not interchangeable baselines.
- Logos inspected: `logo.png` 1254×1254 RGBA and `longlogowithtext.png` 2172×724 RGBA. Preserve masters and alpha; fit without distortion. The originals are now copied into web/native runtime assets without alteration.
- Four screenshots and their notes were inspected. They are partial views, including installed 1.0.9/update 1.0.10, and cannot establish full-screen parity.
- The original oversized pet archive was replaced by two smaller archives. Both merged without conflicts; README/manifest, 9 originals and 21 sprites inspected and hashed. See SI_YOUYOU_ASSET_AUDIT.json. Original names and structure are preserved in assets-private; runtime copies contain the original sprites.
- Reference APK, screenshots and pasted instructions remain outside the repository.

## Original recovery prerequisites (now resolved except distribution licensing)

1. Obtain the matching native project's source and a trusted, versioned TDLib JAR/JNI dependency set with build provenance and license notices for each supported ABI. Prefer the maintainer's matching source package. Alternatively use the already available historical Kotlin source as a reviewed recovery starting point, then obtain/build compatible TDLib from its authoritative source and reconcile differences against the reference APK. Historical recovery alone is insufficient.
2. Supply the pet README/manifest and sprite pack in separate archives below 32 MiB each (masters can be separate). Preserve originals; do not downsample merely to pretend the full asset audit succeeded.
3. Resolve the native/bundled third-party licensing and source correspondence before distribution. Root LICENSE says MIT, README says GPL-3.0; retain both provenance and notices pending clarification. MadelineProto, TDLib, player libraries and packaged runtimes have their own obligations.

## Reviewable phases and planned file changes

| Phase | Files/surfaces | Exit evidence |
|---|---|---|
| 1 Audit | `docs/*`, `tools/check-feature-baseline.py` | source completeness, APK/resource comparison, exact baseline, blockers and tests recorded |
| 2 Source recovery and branding | recovered actual native project, logo asset directories, Android resources, explicit app-owned web branding | unchanged server engine; source/ABI provenance; preserve master images; reviewed string-change allowlist |
| 3 Native NOIR UI | actual MainActivity layout/themes/drawables and presentation helpers | every original control/text reachable; callbacks, lifecycle, permissions and scroll behavior tested |
| 4 Web NOIR UI | additive tokens/theme, minimal index/app adapters, deterministic native asset packaging | responsive/keyboard/full-scroll checks, all original DOM IDs/actions, APK web-asset hashes match intended inputs |
| 5 Si Youyou | separate web/native renderer, state machine, event adapters, settings, supplied derivatives | every frame mapped from manifest; genuine event hooks; fullscreen/dialog exclusion; persistence; reduced motion |
| 6 QA/build | fork-only Actions workflow, regression/packaging tests, build/test docs | installable debug APK; signed release only with secure signing configuration; parity matrix and physical test gaps recorded |

Keep each phase in separate commits. Do not publish releases as an audit side effect. Reuse Actions checkout/JDK/SDK/cache/artifact infrastructure, but target the actual native app after recovery. Keep desktop PHP and native Kotlin engines intact rather than replacing either with the other.

## Identity, updater and risk decisions

Implemented independent application ID: `com.moviesapamapuh.server`. This permits coexistence but creates a new sandbox: no automatic upstream-session migration or upgrade claim. Preserve upstream installation and data until the user chooses an explicit migration strategy. Audit hardcoded paths, provider authorities and runtime IDs before renaming anything.

Preserve the Update action. The historical native updater points to upstream `apk-server-latest`; the existing wrapper workflow publishes `apk-latest`. Neither is a configured custom release. Use a fork-owned feed only once real artifacts exist; otherwise show a truthful not-configured status. Verify hash, ABI, package/signing compatibility and version monotonicity. Never re-use publicly committed signing keys for trusted custom releases.

Other risks: absent editable Nuvio shell source, old WebView compatibility, missing legacy polyfill, clipping below screenshot boundaries, minSdk versus library support, background/Doze behavior, API differences between PHP and native app, and resource usage while streaming. Fullscreen, dialogs, keyboards and accessibility must take priority over the pet. No new overlay permission or hosted backend.
