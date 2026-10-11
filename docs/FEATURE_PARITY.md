# Feature parity checklist

Baseline: `6e278427e3e4f5e2f5868df7c4f6211905298ca5`. Status: static text/ID/handler preservation gates pass after branding and pet integration. Runtime acceptance checkboxes remain pending unless explicitly recorded in TEST_REPORT.md. Checkboxes below are acceptance tests, not claims of completed tests. A source mapping is not evidence of functioning Telegram/network/device behavior.

`baseline-files.json` records all 298 tracked files. `baseline-web-content.json` records static HTML text with original whitespace and controls/attributes; `SOURCE_INDEX.md` indexes PHP/JS handlers. The remaining dynamic text in app.js, bundled shell, all translations, backend-generated HTML and native dialogs must be compared against their immutable Git baseline when those surfaces change. The native source has been recovered from a1f5091; its reference-APK correspondence is documented in ANDROID_RECOVERY.md. This inventory cannot yet claim complete APK text equivalence.

## Native Android

The actual app's paths below refer to historical `android/pencarimovie-server/app/src/main/java/com/pencarimovie/server/` at `a1f5091`; they are restored on this branch. Remaining wrappers use `android/termux-app-fork*/app/main/java/com/pencarimovie/downloader/` and are a separate baseline.

| Preserve / acceptance check | Source handler / persistence |
|---|---|
| [ ] Start/Stop Server, progress, status/errors and confirmations | MainActivity.setupListeners/startServer/stopServer/updateUiForState → ServerService → NativeHttpServer/TdLibManager; wrapper uses NativeRunner |
| [ ] LAN IP, address copying, no-LAN state and network changes | MainActivity status listeners; ServerService network callbacks; NativeHttpServer.handleLanIp |
| [ ] Open Web, Addon Setup and Settings | MainActivity listeners → WebActivity; `/`, `/#addon`, `/#settings` |
| [ ] Web back/history, toolbar refresh/menu, keyboard and external intents | WebActivity/WheelWebView and activity_web resources; verify Android and DOM back interaction |
| [ ] Update banner, download progress, cancellation/errors and installation permission | MainActivity.checkForAppUpdate/downloadAndInstallUpdate; UpdateChecker; FileProvider |
| [ ] Cloudflare Tunnel toggle, status and copy | MainActivity.toggleTunnel/fetchTunnelStatusInternal → `/api/tunnel/*` → TunnelManager |
| [ ] Auto start on boot | BootReceiver + existing SharedPreferences and manifest receiver |
| [ ] Keep alive in background, battery settings, background guide and all guide text | MainActivity battery/guide listeners; ServerService wake/Wi-Fi lock policy |
| [ ] Foreground notification and stop action, screen-off and lifecycle | ServerService foreground channel/start/stop/onDestroy; notification permission |
| [ ] Orientation, large fonts, portrait layouts, all scrollable controls | native XML layouts/resources; test actual restored app on minSdk and modern Android |
| [ ] Permissions and private storage boundaries unchanged | AndroidManifest, AuthManager, BotPool, TdLibManager and FileProvider |

## Web, server settings and addons

| Preserve / acceptance check | UI/handler in `public/app.js` | Backend contract |
|---|---|---|
| [ ] Authentication gate, password labels, login errors, remote boundaries | checkAuth, showAuthGate, submitAuthPassword, requestJson | `/api/auth/status`, `/api/auth/login`; fd_auth_* / native AuthManager |
| [ ] Session state, provisioning, errors and clock guidance | checkSession and bot login/provision flow | `/api/session`, `/api/clock-check`, `/api/provision`, `/api/botlogin` |
| [ ] Bot Pool, Add More Bots, Primary, remove and Disconnect All; confirmations | bot pool rendering/listeners, bot-login/logout flow | `/api/bots`, `/api/bots/add`, `/api/bots/remove`, `/api/bots/set-active`, `/api/botlogout` |
| [ ] Change Password: both fields, helper/warning/error and Update Password | settings listeners around changePwBtn | `/api/auth/password` |
| [ ] Tunnel token/domain input, enable/disable, status, copy, remote warnings | toggleTunnel, polling and settings rendering | `/api/tunnel/status`, `/api/tunnel/enable`, `/api/tunnel/disable` |
| [ ] Debug mode, status/errors and log display where present | existing settings/boot runtime | `/api/debug-mode`, `/api/debug-logs`; native DebugLog |
| [ ] All catalog mode descriptions, Enabled/Disabled options | catalogModeEnabled/catalogModeDisabled listeners | `/api/catalog-settings` |
| [ ] Movies, Series, Telegram Files (Other), all catalog/country/category checkboxes, All/None and Save | catalog option rendering, catType* and catSaveSettingsBtn | fd_get_default_catalog_options/load/save; native defaultCatalogOptions/handleCatalogSettings |
| [ ] Region Auto plus every country; dynamically supplied choices | country/catalog settings handlers | `/api/country`, `/api/catalog-settings` |
| [ ] Upstream addon entries, selection, ordering and validation | addon settings/configuration handlers | `/api/validate-manifest`, catalog settings, upstream manifests |
| [ ] Full addon URLs, LAN/no-LAN, remote token/tunnel and Eclipse setup | openAddonModal, _updateAddonModalUrls; copyAddon* buttons | `/manifest.json`, token-prefixed manifest routes, `/eclipse/manifest.json` on PHP |
| [ ] Stremio API Sync, account/token choice, install mode and errors | Stremio sync listeners and API helper | external `api.strem.io/api/*`; preserve authentication |
| [ ] All settings/addon help, tabs and below-fold options | index.html + dynamic app.js + translations | static inventory and original handlers; screenshot boundaries are irrelevant |

Native historical route coverage differs from PHP (e.g. explicit Eclipse routes are not present in its dispatcher). Do not claim identical backend capability merely because the same frontend is served. Establish the reference app's intended behavior before deciding any compatibility work.

## Browse and media

| Preserve / acceptance check | Source/contract |
|---|---|
| [ ] Hero carousel/dots, trending, category rows, navigation, dynamic titles | renderHero/_showHeroSlide/renderTrending/renderCategoryRows/renderNavLinks; shell bundle |
| [ ] Search, chips, input debounce, results/errors and restore-on-back | openSearch/doSearch/renderSearchChips; `/api/proxy-stream` and existing provider data |
| [ ] Categories, incremental loading, media/region filters | openCategoryPage/_loadMoreCategoryPosts; existing catalog endpoints |
| [ ] Movie/series details, episode/file choices, metadata and sponsors | openModal/_loadPostFiles/openFileDetail/_renderResolvedFile; `/api/resolve-shortcode` |
| [ ] Library, plugins/addons and shell-specific settings/translations | app.bundle.js, legacy-features.js, plugin-worker.js, res/i18n; editable source absent |
| [ ] Play/pause, seek/range, audio/video errors/reconnect and media reset | file detail media controls; `/api/download/*`, `/stream/*`; PHP MadelineProto and native TDLib range handling |
| [ ] Download filename/content type, progress/error and session retention | fileDetailDownloadBtn; `/api/download` |
| [ ] Playback speed, scaling, PiP, subtitles/file/delay, external player and copy stream | _bindPlayerToolbar, _populateSubtitlesList, _setSubtitleDelay, _updateExternalPlayerUrls |
| [ ] Keyboard/Escape, modal backdrop, hash history, scroll restoration and focus | bindGlobalEvents, _handleHashChange, closeModal/closeFileDetail/closeCategoryPage |
| [ ] Stremio/Nuvio catalogs, manifests, meta, streams and tokenized URLs | PHP backend route dispatcher; native NativeHttpServer handleManifest/handleStremio* |
| [ ] Desktop/tablet/mobile layouts and older Android WebView fallback | index.html + CSS + boot-guard.js + runtime compatibility assets |

## Text and visual acceptance procedure

1. Freeze all source text, IDs, names, options, handler wiring, locales and generated assets at the baseline commit. Preserve API-provided titles/categories verbatim; sample dynamic responses only with authorized access and sanitize secrets.
2. Before each presentation commit, compare exact extracted text and attributes. Changes are allowed only in an explicit app-owned branding allowlist with old/new string and location. **Intentional text changes are limited to the branding allowlist in BRANDING_CHANGES.md and new pet/updater guidance.** Do not rename service hosts, backend identifiers, third-party brands or legal credits.
3. Replace decorative emoji with vector/SVG icons only after recording the affected location. Keep the complete accompanying label and accessible name; do not silently remove status information encoded by an icon.
4. Test every row and dynamic dialog, not only screenshots. Capture full scroll, focus traversal, 200% text, soft keyboard, long labels, screen rotation, media fullscreen and overlays. Validate native and browser surfaces separately.
5. Require genuine API/service results. Mark failures, skipped and unavailable checks explicitly. Byte preservation is verified now; complete functional/visual parity remains pending.
6. For Si Youyou, test hidden/disabled equivalence, genuine event reactions, persisted toggles, drag ownership, fullscreen/dialog exclusion and visibility/reduced-motion suspension. Both renderers are implemented; browser fixture checks pass, native/device interaction checks remain pending.
