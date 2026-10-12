<div align="center">

<img src="public/assets/moviesapamapuh/longlogowithtext.png" alt="MovieSapaMapuh" width="460">

# MovieSapaMapuh

**A self-hosted Android media server with a NOIR Crimson interface.**

A personal customization of [PencariMovie Server](https://github.com/aiskendi/pencarimovie-server), built around Telegram-connected media discovery and streaming, plus Stremio/Nuvio addon compatibility.

[![Android](https://img.shields.io/badge/Android-APK-222228?style=flat-square)](docs/BUILD_ANDROID.md)
[![Design](https://img.shields.io/badge/Theme-NOIR%20Crimson-F04452?style=flat-square)](docs/DESIGN_SYSTEM.md)
[![Version](https://img.shields.io/badge/Version-1.0.5-222228?style=flat-square)](android/pencarimovie-server/app/build.gradle)
[![Upstream](https://img.shields.io/badge/Based%20on-PencariMovie-222228?style=flat-square)](https://github.com/aiskendi/pencarimovie-server)

</div>

---

## Overview

**MovieSapaMapuh** is a customized Android-hosted server and responsive web dashboard. Run the server on an Android device, browse your connected media through its local web interface, and use its supported addon endpoints with compatible clients.

The fork retains the existing Kotlin/TDLib and PHP/FrankenPHP implementations rather than replacing the original streaming engine. It is intended for media the user is authorized to access; it does not include a built-in library of movies or series.

## Highlights

- **NOIR Crimson** — dark surfaces, crimson accent (`#F04452`), custom logo and responsive UI.
- **Movie and series browsing** — Home, Search, Library, details and source selection.
- **Playback and seeking** — existing streaming/player functionality, including range-request support where available.
- **Telegram Bot Pool** — connect a bot, add more bots, choose a primary bot and manage local sessions.
- **Stremio and Nuvio integration** — compatible addon manifests, catalog controls and stream-source configuration.
- **Local network access** — designed to serve the dashboard over the host device's Wi-Fi address when LAN connectivity permits.
- **Si Youyou loading animation** — a small walking loader in place of the retired interactive pet.
- **Si Youyou desktop cursor** — for pointer-capable browsers, not Android touch input.
- **Developer Credits** — *Designed by Paim* in Settings.

> **Current feature scope:** The active `main` branch includes Developer Credits and **does not include the experimental YouTube Playlist Integration**. The previous interactive pet and its settings were also removed; only the loading/cursor assets remain.

## Download APK

> **Repository rename pending:** Links below use the planned `Paim41/MovieSapaMapuh` name and will work after the GitHub repository is renamed. Until then, use the [current repository Releases](https://github.com/Paim41/pencarimovie-server/releases).

**[Download MovieSapaMapuh v1.0.5 Preview (Universal APK)](https://github.com/Paim41/MovieSapaMapuh/releases/download/v1.0.5-preview.1/MovieSapaMapuh-v1.0.5-preview-universal.apk)**

[View GitHub Release](https://github.com/Paim41/MovieSapaMapuh/releases/tag/v1.0.5-preview.1) · [SHA-256 checksum](https://github.com/Paim41/MovieSapaMapuh/releases/download/v1.0.5-preview.1/MovieSapaMapuh-v1.0.5-preview-universal.apk.sha256)

This is a **debug-signed testing pre-release**, not a stable production update. Back up app data before changing installations; debug signatures from other builds may be incompatible.

## Run on Android

For a fresh installation, use the **Download APK** link above, then install the universal APK and tap **Start Server**. If you want to build the APK yourself:

1. Open **[Actions → MovieSapaMapuh Android](https://github.com/Paim41/MovieSapaMapuh/actions/workflows/moviesapamapuh-baseline.yml)**.
2. Choose **Run workflow**, select **`main`**, keep **`signed_release` unchecked** for a debug build, and start the workflow.
3. When the run succeeds, download the **`MovieSapaMapuh-Android-Debug`** artifact and extract its ZIP.
4. Install the appropriate APK on a compatible Android device (universal is the easiest option; ARM64 is suitable for POCO F3).
5. Launch **MovieSapaMapuh**, tap **Start Server**, and use **Open Web** for the dashboard.

The usual local address is:

```text
http://127.0.0.1:8088
```

For another device on the same network, use the Android host's *current* LAN IPv4 address:

```text
http://<PHONE-LAN-IP>:8088
```

Both devices must be able to communicate over the network. Guest Wi-Fi/client isolation or other network restrictions may prevent access even when the local dashboard works on the phone.

**Important:** GitHub Actions artifacts are development/test builds, not a published stable release. The debug signing key can change between runs; installing one debug build over another may fail if their signing certificates differ. Keep a backup of app data and avoid uninstalling an existing installation simply to force an update.

For the exact toolchain, native dependencies, APK verification and signing instructions, see **[Build & Install Guide](docs/BUILD_ANDROID.md)**.

## Interface & navigation

| Area | Purpose |
| --- | --- |
| **Home** | Browse available media and catalog sections |
| **Search** | Find matching titles or files from configured sources |
| **Library** | Manage the existing library and filters |
| **Addons** | Configure catalogs, Stremio/Nuvio integration and source settings |
| **Settings** | Manage bot sessions, server-related settings and Developer Credits |

The theme uses **NOIR Crimson** (`#0C0C0F` background, `#222228` surface, `#F04452` accent). The floating bottom dock and compact search/library treatments follow the current MovieSapaMapuh UI design.

## Bot Pool, catalogs & playback

- **Bot Pool:** The backend can provision a guest bot session automatically or accept a Telegram bot token. Additional bots may be used for session rotation and fallback; more bots do not automatically add new titles.
- **Catalogs and addons:** Configured catalog sources provide metadata/discovery. Having a title listed does **not** guarantee an accessible stream.
- **Playback:** Only stream media you have the right to access. MovieSapaMapuh does not grant subscriptions, distribute a movie library, or bypass provider restrictions.

Never share Telegram bot tokens, secret keys or server access tokens in screenshots, commits or public issue reports.

## Project status

- **Default branch:** `main`
- **Android application ID:** `com.moviesapamapuh.server`
- **Declared Android version:** `1.0.5` (version code `10005`)
- **Developer Credits baseline:** [`47dd7f7`](https://github.com/Paim41/MovieSapaMapuh/commit/47dd7f783105596ee63f54c438f5f591d20db85d)
- **APK build workflow:** [MovieSapaMapuh Android](https://github.com/Paim41/MovieSapaMapuh/actions/workflows/moviesapamapuh-baseline.yml)

GitHub Actions presentation checks and Android builds are separate jobs. A green presentation-only run is **not** proof that an APK was produced. Device behavior, external services, LAN conditions and real playback should be verified on the target device before distribution. A production signing/update channel is not configured by this README.

## Documentation

| Document | What it covers |
| --- | --- |
| [Build Android](docs/BUILD_ANDROID.md) | Build environment, verification, signing, installation |
| [Android Recovery](docs/ANDROID_RECOVERY.md) | Recovered native source and dependency provenance |
| [Design System](docs/DESIGN_SYSTEM.md) | Theme colors and UI conventions |
| [Developer Credits](docs/DEVELOPER_CREDITS.md) | Credit card implementation and verification |
| [Feature Parity](docs/FEATURE_PARITY.md) | Acceptance checklist, not a claim of full test coverage |
| [Test Report](docs/TEST_REPORT.md) | Historical checks, test limitations and follow-up reports |
| [Si Youyou Replacement](docs/SI_YOUYOU_REPLACEMENT_1.0.5.md) | Walking loader and desktop cursor |
| [Upstream README (archive)](docs/UPSTREAM_README.md) | Original PencariMovie instructions preserved for reference |

## Designed by Paim

Custom MovieSapaMapuh branding, presentation and NOIR Crimson design by **Paim**.

[LinkedIn](https://www.linkedin.com/in/paim41/) · [GitHub](https://github.com/Paim41/) · [Email](mailto:sakacomel@gmail.com)

> **Release note:** The existing `v1.0.5-preview.1` downloadable APK predates the corrected email link. The current source includes `sakacomel@gmail.com`, but the published APK has not been rebuilt or replaced. A new versioned APK is required for that change to reach installed devices.

## Open source & acknowledgement

MovieSapaMapuh is a **fork/customization** of [**PencariMovie Server by aiskendi**](https://github.com/aiskendi/pencarimovie-server). Original contributions, project attribution, source files and applicable third-party notices must remain credited. Related technologies include **PHP, FrankenPHP, MadelineProto, TDLib, Termux** and **cloudflared**.

See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The root LICENSE contains **MIT** terms, while older upstream documentation describes the project as GPL-3.0; this discrepancy needs review before public redistribution and is not resolved by this README.

The [historical upstream README](docs/UPSTREAM_README.md) preserves the previous installation and usage reference, including upstream-specific download addresses. **Those links should not be mistaken for a MovieSapaMapuh APK release.**

---

<div align="center">

**MovieSapaMapuh · NOIR Crimson**

*Designed by Paim · Based on PencariMovie Server*

</div>
