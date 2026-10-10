# Audit test report

## Verified

- Origin identifies `Paim41/pencarimovie-server`; created `feature/moviesapamapuh` from `6e278427e3e4f5e2f5868df7c4f6211905298ca5`.
- Initial checkout clean; no existing application file has been edited.
- 298 baseline tracked files hashed; `python tools/check-feature-baseline.py` checks exact preservation.
- Reference APK manifest/ZIP inspection: com.pencarimovie.server 1.0.9 / 10009, API 21 minimum, API 28 target, compile API 36; libtdjni.so for ARM64 and ARMv7. No DEX decompilation used.
- Compared all 114 reference APK web entries to public/: 57 identical, 45 line-ending-only, 11 content differences and one APK-only polyfill. Details in `APK_WEB_COMPARISON.json`.
- Logo originals and all four partial screenshot views/contact sheet and notes inspected; no asset changes.
- Historical native source located but matching JNI libraries absent from that commit; no native build claimed.
- Previous cloud onboarding executed Composer locked install (57 packages and three patches), repeat installation, platform requirements, PHP syntax, installer shell syntax, HTTP dashboard/manifest and environment preflight. These validate the desktop PHP development setup, **not** the Android app or authenticated playback.

## Pending / blocked

- Pet manifest, README and all assets: transfer blocked by 32 MiB tool limit.
- Native source/JNI provenance and correspondence to APK 1.0.9; successful build/installation.
- Full dynamic text inventory and UI traversal in the actual native/reference runtime; source mappings and hashes are not complete interaction tests.
- Missing tracked public legacy-polyfills.js; editable source of integrated prebuilt Nuvio shell is absent.
- Unit/instrumentation tests, Actions run, APK signature validation and installable MovieSapaMapuh artifact: not run/produced.
- Telegram login, real downloads, seek/range transfers, external catalogs, tunnels, Stremio/Nuvio/Eclipse integration: not tested.
- All redesigned visuals/pet states/performance: not implemented or tested.
- POCO F3 and other Android hardware, minSdk WebView, background/Doze/boot/notifications: not tested.
- Distribution licensing: root MIT and README GPL claim conflict; third-party/native notices require reconciliation.

No claims of full parity, complete asset audit, physical-device compatibility, successful Android build or release publication are made.
