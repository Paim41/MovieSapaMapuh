# Branding allowlist and identity

Phase 2 uses the supplied logo and wordmark byte-for-byte. Originals remain outside source; copied runtime assets retain their hashes. Adaptive icon fits the full mark in a 72dp centered square; no new artwork generated. Final mask legibility requires device inspection.

Independent applicationId: `com.moviesapamapuh.server`. Kotlin namespace remains `com.pencarimovie.server` to preserve implementation references. This creates a separate data sandbox and signing identity; it does not migrate upstream sessions. Local storage keys, API routes, service/provider names, third-party Nuvio/Stremio names, domains and legal notices remain intact.

Intentional text substitutions: app resource names PencariMovie Server → MovieSapaMapuh; native notification/title/background-guide references to the app; web title PencariMovie — → MovieSapaMapuh —; web app-owned PencariMovie Server / PencariMovie Catalogs labels; app.js siteName. No other text shortening is authorized. Original status labels and Download Update remain present. Added truthful unconfigured-updater guidance.

Updater makes no network request without an explicitly configured real fork release feed. Optional Gradle property moviesapamapuhUpdateFeed accepts only a GitHub release asset URL in this fork. Parsed metadata must name the exact applicationId and provide a fork-owned APK URL with a SHA-256. Android signature/upgrade checks still apply. No release feed has been invented or published.

No user authentication, Telegram, streaming, range, catalog or service engine is replaced by branding.
