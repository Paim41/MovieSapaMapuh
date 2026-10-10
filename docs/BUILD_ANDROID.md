# Android build and recovery

There is currently **no MovieSapaMapuh APK** and no CI run for this branch.

The existing `.github/workflows/android-apk.yml` is workflow_dispatch-only in its actual trigger configuration. Its comments mention other triggers that are not configured. It targets `android/termux-app-fork`, assembles the older arm64 wrapper, uploads an artifact and publishes a rolling `apk-latest` release. Running it unchanged would build/publish the wrong app.

The reference APK is the removed `com.pencarimovie.server` Kotlin/TDLib app, minSdk 21, targetSdk 28, compileSdk 36, ARM64 + ARMv7. Historical source at `a1f5091` has a Gradle 9.2.1 wrapper, AGP 8.13.2, Kotlin 2.1.0 and Java/Kotlin target 17. These are observed pins, not a verified working toolchain. JDK/Gradle/AGP compatibility must be tested after source recovery; do not silently guess new versions. Native JAR/JNI pairing, 32-bit compatibility and library provenance are required.

Recovery must supply the actual source plus pinned TDLib JAR and JNI libraries/build recipe for each ABI. Do not use the reference APK as an implementation source. Do not restore historical committed release keys or use public signing passwords. Debug builds should use a dedicated development key; release signing belongs in GitHub Secrets and must preserve its chosen identity across upgrades.

Planned workflow: checkout the fork feature branch; verify source/dependency checksums; configure a supported pinned JDK/SDK/Gradle combination; cache by toolchain and dependency inputs; run unit/lint checks; stage reviewed web/brand/pet assets using a deterministic Gradle task; assemble debug; verify manifest package/version/ABIs and embedded asset hashes; upload clearly named `MovieSapaMapuh-universal-debug.apk` and supported ABI artifacts with SHA-256 sums. No automatic rolling-release publication for feature-branch validation. Release is a separate explicit signed workflow.

Do not label an arm64-only wrapper a universal replacement. ARMv7 is supported by the reference native TDLib architecture, not by desktop MadelineProto's 64-bit requirement. Keep those architectures distinct.

After an actual successful build: download the Actions artifact from the user's fork, verify its checksum and signature/package identity, install through Android's normal installer, grant only existing required permissions, then test Start/Stop, notifications/boot/background, LAN dashboard, Addon Setup, Settings, tunnel/update, authenticated streaming/seek/download and pet behavior. POCO F3 and other physical-device tests are pending. A separate application ID will coexist with the original but does not inherit its sessions or data. Keep the original app for rollback; do not uninstall or erase it automatically.
