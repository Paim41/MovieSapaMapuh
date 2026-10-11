# Anime & Donghua playlists

This feature stores playlist links and user-entered labels locally. It does not discover, verify, scrape, download, extract, proxy, cache or restream YouTube media. No API key or new hosted service is needed. The catalog starts empty. Channel labels are entered by users and are not a verified-channel badge.

## Add your first playlist

1. Open Settings, then expand **Anime & Donghua Playlists** above Developer Credits.
2. Paste a playlist URL copied from an official channel on YouTube, including its `list` parameter.
3. Enter a title, choose Anime or Donghua, optionally enter the channel/source, then select **Save playlist**.
4. Return Home to **Anime & Donghua**. Use All, Anime or Donghua to filter, then choose **Watch**.
5. Use the official player's playlist controls, or **Open on YouTube**. Settings supports Edit, Enabled, Remove and Reload playlists.

After this feature is installed, adding playlists never requires source changes or another APK build. The existing APK does not contain this feature; its initial installation needs a future approved APK update. No APK was assembled for this change.

## Files and persistence

- `public/youtube-playlists.js` / `.css`, mirrored in Android's `assets/web`: scoped Settings manager, homepage cards and separate dialog. The two `index.html` files only load these modules.
- `src/YouTubePlaylists.php`: validated JSON configuration in the existing PHP storage directory, `youtube_playlists.json`. Locking and atomic replacement protect writes. The `backend.php` addition is a single authenticated route.
- `YouTubePlaylists.kt`: equivalent native endpoint and a separate private `youtube_playlists` SharedPreferences store. The APK runs Kotlin/NanoHTTPD rather than PHP. `NativeHttpServer.kt` only delegates the new route after its existing authentication gate.
- `tools/test-youtube-storage.php`, `tools/test-youtube-playlists.cjs`, preservation fixture and CI wiring: validation, persistence and UI checks.

`GET /api/youtube-playlists` returns `{revision, playlists}`. `POST` accepts that schema with a matching revision; conflicting saves return 409, allowing Reload before retry. Writes require JSON, the feature request header and a matching Origin when present. Existing authentication still applies. Endpoint responses do not grant cross-origin access. Configuration is capped at 100 playlists and 128 KiB; title/source fields accept plain text only. PHP and Android stores are independent, just like their existing settings.

Accepted hosts are exactly youtube.com, www.youtube.com, m.youtube.com, music.youtube.com and youtu.be. Standard playlist/watch URLs (or short video URLs with a list parameter) normalize to `https://www.youtube.com/playlist?list=...`. Credentials, explicit nondefault ports, duplicate list parameters, unsupported paths and malformed IDs are rejected. ID validation is syntactic; it cannot prove a playlist exists or is official/private/available without contacting YouTube. No IDs ship as defaults.

## Official player and Android behavior

The browser uses `https://www.youtube.com/embed/videoseries?list=...`, with `autoplay=0`, `playsinline=1`, `enablejsapi=1` and the actual page origin. The official IFrame API is loaded only after Watch, for error reporting and teardown; this is not YouTube Data API v3. There are no background YouTube requests. YouTube branding, native controls, ads and restrictions remain intact.

The frame has a 16:9 layout, with a 200px minimum height to meet YouTube's minimum player size on narrow screens. Fullscreen is allowed where the browser supports it. `strict-origin-when-cross-origin` sends the real origin as Referer, without leaking token-bearing URL paths or inventing another site's identity. Embedding can still fail for local origins, client identification (153), private/deleted/restricted media, network problems or browser policy. A visible external fallback remains available before and after errors. A script timeout also explains the fallback.

The **current Android WebView deliberately uses the external YouTube app/browser fallback**. Its existing navigation handler intercepts external frame navigations, and its WebChromeClient has no custom-view fullscreen host. We do not modify those working streaming components or fake client identity. Android Chrome and other regular supported browsers may use the embed. Native external links use the existing ACTION_VIEW behavior; no permissions were added.

The player is destroyed on Close, Escape, route changes, leaving Home, page hide or backgrounding. It is separate from the existing video player.

References for device validation:
- https://developers.google.com/youtube/player_parameters
- https://developers.google.com/youtube/iframe_api_reference
- https://developers.google.com/youtube/terms/required-minimum-functionality

## Verification and limits

Passed locally:
- PHP syntax and storage tests: canonicalization, hostile URLs, duplicate IDs, text injection, CRUD, disk persistence, stale revisions, request size and cross-origin protection.
- Browser integration with **real PHP storage and simulated YouTube responses**, for both dashboard copies: add/edit/disable/remove, home cards, categories, restart PHP and reload persisted data, no requests from closed Settings, no YouTube request before Watch, keyboard/browser-native dialog controls, teardown and fallback.
- Layouts at 320×568, 360×640, 393×873, 412×915, 768×600 and 1440×900; frame minimums and horizontal overflow checks.
- Simulated errors 100, 101, 150 and 153; simulated Android WebView user agent takes the no-iframe fallback.
- Existing Settings/addon presentation tests and baseline preservation gate. Original streaming handlers, catalogs, frontend bundles, navigation, Developer Credits and loader/cursor implementations were preserved.
- `:app:compileDebugKotlin` (compile only).

**Not verified:** live YouTube playback, actual private/region-restricted playlist behavior, actual POCO F3/browser/email/app handoff or Android store persistence on a physical device. Cloud access to YouTube/Google documentation endpoints is restricted; tests do not claim live playback or device parity. The Android adapter compiled but was not packaged or device-tested. Existing streaming was checked for source preservation, not replayed against Telegram.

The commit uses `[skip apk]`: the feature push runs presentation/storage tests while deferring APK assembly. Manual workflow dispatch remains available only when the user approves the next build.
