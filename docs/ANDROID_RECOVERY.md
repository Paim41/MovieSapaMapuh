# Original Android recovery results

## Source selection

Recovered 171 project files from fork history commit `a1f5091ceef836d801c8f8efac2392b4431da6ac` into `android/pencarimovie-server` on `feature/moviesapamapuh`. No reset, upstream modification, or APK decompilation was used. Every one of the reference APK's 114 web assets matches this revision after CRLF normalization (65 byte-identical; 49 line-ending-only). Earlier `0810dcc` still differs in two web files; the three earlier native revisions differ in ten. Thus a1f5091 is the closest **available** revision, not a proven exact native source-to-APK attestation.

The original Kotlin, Java, resource strings, layouts and web content were recovered unchanged. The historical source hash inventory is `ANDROID_RECOVERY_FILES.json`. The build's hardcoded public signing credentials and release-key dependency were removed: debug uses a separate development key; release is unsigned until securely configured. No historical private key was restored. The Gradle distribution checksum is also being pinned separately.

## TDLib dependency recovery

The historical JAR's private `TdApi.GIT_COMMIT_HASH` is `e0943d068ce90b5010f1aea946e6901e25b43bf6`. The reference APK's native binary metadata includes the same hash and version 1.8.64. This resolves in the official `tdlib/td` repository, whose CMake project version agrees. Generated all 3,037 constructor IDs from that source and compared them to the historical JAR: no missing or mismatched constructors. The JAR SHA-256 is recorded in `ANDROID_DEPENDENCY_PROVENANCE.json`.

Read-only reference-library metadata also identifies OpenSSL 1.1.1w and Android clang 12.0.9 (build 8481493), consistent with official NDK r23c / 23.2.8568313. Built official OpenSSL tag commit `e04bd3433fd84e1861bf258ea37928d9845e6a86`, then official TDLib at the exact matching commit for ARM64 and ARMv7. Used Java JNI interface, static C++ runtime, RelWithDebInfo and Android API 21 for TDLib. Retained the pinned upstream OpenSSL API defaults (ARM64 21, ARMv7 16). No libraries were copied from the reference APK and no third-party binary substituted.

Android SDK/NDK archives were verified against checksums in Google's HTTPS repository metadata; SHA-256 fingerprints of the downloaded archives are recorded too. Gradle 9.2.1 was checked against its official HTTPS SHA-256. Locally extracted signed Debian packages supplied JDK 21, PHP, CMake, Ninja and gperf. The recovered project targets Java/Kotlin 17 using JDK 21 as its daemon configuration requests. AGP 8.13.2 requests Build Tools 35.0.0 despite the old workflow installing 36.0.0; both were installed for diagnosis.

## Build and packaging evidence

- Kotlin/Java compile: successful, 19 tasks executed; existing Android API deprecation warnings remain.
- OpenSSL and TDLib native builds: completed for both ABIs; each TDLib build completed 562 build steps.
- `:app:assembleDebug`: successful; produced ARM64, ARMv7 and universal APKs using the original application identity.
- Universal APK packaging check: both JNI libraries match locally built inputs, ELF architectures are correct, TDLib commit metadata matches, all 114 bundled web assets match recovered source bytes.
- Signature and Android manifest inspection performed separately; full lint/unit-test outcomes are recorded in TEST_REPORT.md when complete.
- This is source-based reproducibility, **not** a claim of byte-identical reproduction of the publisher's signed APK. Build paths, signing key, historical version defaults and compiler inputs can change bytes.
- No Android emulator, physical device, Telegram login, range-stream playback, boot/background behavior or feature-parity interaction test has passed merely because packaging succeeded.

Original baseline APK identity is `com.pencarimovie.server`, historical default 1.0.2/10002; reference is 1.0.9/10009. The debug key differs from the reference publisher's key, so this is not an install-over upgrade. Keep it separate from the later MovieSapaMapuh deliverable. The original updater still points upstream; it must be made safe during custom identity work before distributing a branded app.

## Release/provenance investigation

The deleted `.github/workflows/android-server-apk.yml` explicitly failed preflight without both JNI libraries and the release key. Its public workflow page reports zero runs. The fork's public releases page has no releases. GitHub API requests returned Forbidden; readable GitHub release pages and official Git source remained available.

Upstream rolling `apk-server-latest` currently advertises 1.0.10/10010, built 2026-10-10T17:38:57Z, and commit `6e27842` (the commit that removed native source). It offers APKs, APK hashes and version.json, but no standalone JNI bundle, native build recipe or source attestation. Its checksum does not identify the supplied 1.0.9 APK. Therefore release metadata alone cannot reproduce the reference; the matching official TDLib source/JAR evidence is the recovery basis.

## Asset blocker resolved

Both new Si Youyou archives merged without conflicts at `assets-private/si-youyou/Si_Youyou_Animation_Asset_Pack/`. README, manifest and original names/structure preserved. All 9 original PNGs and 21 sprites match manifest dimensions and RGBA format; hashes and alpha bounds are recorded in SI_YOUYOU_ASSET_AUDIT.json. Contact sheet inspected. Keep originals and private references outside public commits; runtime integration follows after the baseline build checkpoint.

## Remaining limits

Full native equivalence to reference 1.0.9, device-level behavior, 16 KiB-page Android compatibility, release signing and redistribution notices are still unverified. OpenSSL 1.1.1w is an old dependency retained to reproduce the baseline; a dependency upgrade must be a separate compatibility-reviewed change. The root MIT/GPL description conflict and bundled component notices still need clear distribution documentation.
