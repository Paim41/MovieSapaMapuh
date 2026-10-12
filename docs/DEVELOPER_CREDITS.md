# Developer Credits refinement

Added a scoped NOIR Crimson card at the bottom of Settings in the public dashboard and Android bundled dashboard. No separate native About page exists. Existing settings, navigation, loader/cursor, APIs, streaming and Telegram handlers remain unchanged.

Contacts: LinkedIn https://www.linkedin.com/in/paim41/ and GitHub https://github.com/Paim41/ open securely in a new browser context. Email uses `mailto:sakacomel@gmail.com`, addressing the exact supplied recipient `sakacomel@gmail.com`. Android handles email with ACTION_SENDTO; its existing external-browser handler handles HTTPS. No permissions were added.

Lucide 0.468.0 SVG icons retain the supplied ISC license and Feather attribution. Original project license and third-party notices are preserved; the card identifies Paim's credit as custom presentation/design and acknowledges PencariMovie.

## Validation

- Both dashboard bundles: contact destinations, secure link attributes, inline SVGs, keyboard focus, equal button sizing, 48px minimum targets and overflow checks passed at 320, 360, 390, 480, 600, 768 and 1440px widths.
- Contact browser destinations were intercepted fixtures; external account availability and actual delivery of email were not tested.
- Existing presentation tests passed for Settings/addon scrolling; UI parity checks preserved existing settings text, IDs and handlers. Live server/Telegram integration was not exercised for this UI-only change.
- Android `:app:compileDebugKotlin` passed. Device/browser/email-app handoff requires device verification in the next APK.
- No APK assembled; existing APKs and assets preserved.

A follow-up pre-rename cleanup corrected the email recipient in both dashboard bundles. The published `v1.0.5-preview.1` APK remains the original debug build; an updated APK must be built and separately published to include this correction.

The commit marker `[skip apk]` defers the workflow APK build for this push while keeping presentation checks. Manual workflow dispatch remains available when the planned UI updates are ready.
