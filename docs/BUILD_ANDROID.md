# Build and install MovieSapaMapuh

The native Kotlin/TDLib source was recovered from `a1f5091ceef836d801c8f8efac2392b4431da6ac`. The original baseline and branded debug APKs build locally. See ANDROID_RECOVERY.md for exact reference-APK/source correspondence and ANDROID_DEPENDENCY_PROVENANCE.json for dependency evidence. No APK code or native implementation binary was extracted for reuse.

## Reproduce on Linux

Use JDK 21, Gradle wrapper 9.2.1 (distribution SHA-256 pinned), AGP 8.13.2, Kotlin 2.1.0, Android platform 36, Build Tools 35.0.0 and NDK 23.2.8568313. Java/Kotlin target remains 17, minSdk 21 and targetSdk 28. Install CMake, Ninja, gperf, PHP CLI, Perl, Make, Git, Python 3, a C/C++ compiler, libssl-dev and zlib development headers. Set JAVA_HOME and ANDROID_HOME, accept SDK licenses, then:

```sh
bash tools/build-tdlib.sh
cd android/pencarimovie-server
bash gradlew :app:assembleDebug :app:lintDebug :app:testDebugUnitTest --no-daemon --max-workers=2
cd ../..
python3 tools/verify-android-apk.py android/pencarimovie-server/app/build/outputs/apk/debug/*_universal.apk
python3 tools/check-ui-parity.py
```

The unit-test task currently reports NO-SOURCE; it is not evidence of passing native unit tests. The meaningful automated checks are compile, Android lint, static preservation, package checks and isolated browser interactions.

`tools/build-tdlib.sh` fetches pinned official TDLib 1.8.64 (`e0943d068ce90b5010f1aea946e6901e25b43bf6`) and OpenSSL 1.1.1w (`e04bd3433fd84e1861bf258ea37928d9845e6a86`), verifies the recovered Java API hash, and compiles both ARM ABIs. Set MOVIESAPAMAPUH_NATIVE_BUILD_DIR for external build storage and MOVIESAPAMAPUH_BUILD_JOBS to bound parallelism. Generated JNI is ignored by Git. This is a documented reproducible source build, not a byte-identical reproduction of the upstream signed APK.

For browser fixtures, install Playwright 1.62.1 and its Chromium, then `node tools/test-presentation.cjs`. Set CHROMIUM_PATH to use an installed Chromium. This test isolates HTML/CSS/new adapters; it does not log in, provision bots or call service APIs.

## GitHub Actions

Use `.github/workflows/moviesapamapuh-baseline.yml`, displayed as **MovieSapaMapuh Android**. It reuses checkout/JDK/SDK/Gradle/artifact infrastructure, rebuilds native dependencies, tests presentation separately, checks signatures/identity/embedded bytes and uploads `MovieSapaMapuh-Android-Debug` with universal, arm64-v8a and armeabi-v7a APKs, checksums and reports. Its permissions are read-only and it never publishes a release. PRs and relevant pushes to feature/moviesapamapuh trigger it; workflow_dispatch defaults to debug. Push triggers avoid the need for an API-authenticated manual dispatch.

After this branch/workflow is available on GitHub, open the fork's Actions tab, select the workflow/run, and download its artifact. Extract the artifact ZIP before installing an APK. A newly added dispatch workflow may need to be present on the default branch before the manual Run workflow button appears; the PR trigger supplies pre-merge validation.

**Hosted Actions completion has not been verified from this environment.** Direct Git transport successfully pushes the feature branch; GitHub CLI/API access previously failed with an invalid GH_TOKEN override. Feature-branch pushes trigger this workflow without API dispatch. Open the fork Actions page to check the run and download completed artifacts. Local APKs remain under `dist/`; the versioned APK_ARTIFACTS reports record verification.

The old `android-apk.yml` targets a Termux wrapper and publishes its own rolling release. Do not use it for the recovered native app.

## Signing and updates

Debug APKs use a locally generated development key. Fresh CI debug keys may differ, so debug builds from different machines/runs are not a stable upgrade channel. Preserve the existing installation/data rather than uninstalling to force an upgrade.

The optional **signed_release** dispatch input assembles Release and requires these fork secrets: MOVIESAPAMAPUH_KEYSTORE_BASE64, MOVIESAPAMAPUH_KEY_ALIAS, MOVIESAPAMAPUH_STORE_PASSWORD, MOVIESAPAMAPUH_KEY_PASSWORD. It signs in temporary runner storage, verifies signatures, removes the key and uploads artifacts without publication. This path has not been executed; no signing key was supplied. Historical publicly committed release credentials were not restored. Keep one private release key securely backed up for future upgrades.

Application ID is `com.moviesapamapuh.server`; Kotlin namespace remains `com.pencarimovie.server`. Current version defaults are 1.0.5 / 10005 (the first branded build was 1.0.2 / 10002); these do not claim equivalence with reference 1.0.9. Use `-PversionNameOverride=X.Y.Z -PversionCodeOverride=N` with increasing version codes for future releases.

Update action remains visible, with truthful unconfigured-feed guidance. It makes no update request by default. Only after a real fork release exists, configure `-PmoviesapamapuhUpdateFeed=<actual fork release asset URL>`. Metadata must name this applicationId, a newer version, fork-owned APK URL and exact SHA-256; Android enforces package/signing compatibility. Never point it at upstream's rolling APK or invent a feed URL.

## Install and validate

1. Download the universal debug APK for convenient testing, or arm64-v8a for POCO F3 and other ARM64 phones. ARMv7 APK is for supported 32-bit ARM devices. x86/x86_64 is not supported by these recovered native libraries.
2. Compare the file's SHA-256 with the accompanying checksum, transfer it to the phone and open it using Android's package installer. Allow installation from that source only when prompted.
3. MovieSapaMapuh installs alongside PencariMovie with a separate data sandbox. It does not migrate Telegram sessions/settings. Keep the original app/data for rollback. Stop one server before starting the other if both use the same port.
4. Open MovieSapaMapuh, retain normal permission prompts, select Start Server, and use the displayed LAN address from another client on the same network. Use Open Web, Addon Setup and Settings as before. Keep the existing password/remote-token safeguards.
5. Test every row in FEATURE_PARITY.md, especially start/stop, permissions, boot/background/notification behavior, authentication, bot pool/password, LAN/tunnel, catalogs, real playback/seek/range/download and external integrations. Pet settings can disable the companion independently.

No physical POCO F3, emulator or other handset was available. API21/old WebView, modern Android background policies, 16 KiB-page devices, long-running streaming, battery/CPU/memory behavior and release signing remain unverified. Root MIT versus README GPL-3.0 licensing descriptions remain conflicting; retain all notices and complete distribution review before public release.
