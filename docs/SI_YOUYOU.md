> Updated in 1.0.3: extra flame overlays/settings removed; fixed viewport anchoring and normalized sprite bounds added. See [UI refinement](UI_REFINEMENT_1.0.3.md). The initial implementation notes below are historical where they describe optional flame rendering.

# Si Youyou

The two replacement archives were merged into `assets-private/si-youyou/Si_Youyou_Animation_Asset_Pack/` without conflicts. Original filenames, README, manifest, previews, nine originals and 21 sprites are preserved. The oversized archive was not used. SHA-256, RGBA dimensions and alpha bounds are in SI_YOUYOU_ASSET_AUDIT.json.

Runtime sprites, README and manifest are copied unchanged to `public/assets/si-youyou/` and the native app's `assets/web/assets/si-youyou/`. Original artwork/reference attachments remain outside tracked source. The supplied artwork's redistribution rights remain the owner's responsibility; no new license is invented.

## Implemented renderers

- Native `SiYouyouView.kt`: reserved scrollable home-screen area, independent SharedPreferences, background bitmap decoding with downsampling and an eight-frame cache; 10 Hz active ticks. MainActivity forwards real Running/Error/other service transitions. Running triggers jump, error rests, stop calms. No service implementation changes and no overlay permission.
- Web `si-youyou.js`/`.css`: separate adapter and localStorage preferences; cached frame preload, approximately 9 Hz movement, idle/static throttling. Searches for a free viewport region, avoids buttons/links/inputs/media/navigation and hides if no space is safe. Actual DOM media play, search input and download-click events trigger short reactions. A download click is intent, never reported as successful transfer.
- Both support Enable Pet, Enable Animations, Flame Effects, Reduced Motion / Performance Mode, Reset Pet Position. Browser and native preferences are independent. Native pet settings remain accessible when hidden. Browser controls live in the existing Settings dialog; long press/right click opens that same dialog.
- Tap/keyboard activation waves; drag/drop persists position. Native movement stays in its reserved area. Browser drag owns touch/mouse events and rejects positions over controls.
- Browser hides for fullscreen, focused form inputs, settings/auth/addon dialogs and background documents. Native ticks stop on activity backgrounding/window focus loss and throttle outside the visible scroll region. Browser honors prefers-reduced-motion; native honors the system animator scale plus the explicit toggle.

## State mapping

| State | Supplied sprite(s) |
|---|---|
| idle / dragged | idle/si_youyou_idle_front.png |
| blink | blink/si_youyou_blink_front.png |
| walk | walk/si_youyou_walk_left_01.png … _04.png |
| sit | sit/si_youyou_sit_front.png |
| sleep | sleep/si_youyou_sleep_front.png |
| jump | jump/si_youyou_jump_crouch.png, _airborne.png, _landing.png |
| happy / wave | reactions/si_youyou_happy.png / si_youyou_wave.png |
| hidden | no image or animation |
| optional flame | effects/flame/si_youyou_flame_01.png … _03.png |

Full-frame images retain aspect ratio, a bottom-center logical anchor and crisp sampling; four walk frames share the supplied canvas. Jump uses three genuine poses with a small vertical offset. No raster warping, invented missing frames, physics or mirrored asymmetric costume. Walk artwork continues facing left when motion changes direction because no right-facing art was supplied.

Flame overlay is off by default and low opacity when enabled. It cannot remove flames baked into body frames. No compact-flame art was fabricated. Differently framed poses still need optical/feet alignment and animation review on actual hardware; a fixed logical anchor alone does not prove flawless pose continuity.

## Validation and limits

`tools/test-presentation.cjs` exercises both bundled/public adapters in a browser fixture: tap, drag, settings persistence, reduced motion, genuine media DOM signal, fullscreen hide/restore and settings scroll at 360/390/768/1440 pixels. It does not execute authenticated APIs, a media transfer, or Android native controls. Native compile/lint and APK asset verification are separate checks. CPU/memory, pose continuity, touch accessibility and streaming-load measurements on POCO F3 and other phones remain pending.
