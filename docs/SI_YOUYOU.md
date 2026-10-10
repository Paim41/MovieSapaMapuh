# Si Youyou integration plan

**Blocked asset audit; not implemented.** SiYouyouPets.zip exceeded the attachment tool's 32 MiB transfer limit. No sprites, manifest or README were read. The user's description of 21 sprites is a requirement, not a verified archive inventory.

Supply manifest.json, README.md and prepared sprite files in archives below 32 MiB each; keep high-resolution masters separate and unchanged. Read the manifest and README before assigning frames. Record per-file hashes, dimensions, alpha bounds, logical canvas and feet anchors. Do not invent filenames, missing poses, physics or a replacement character.

Planned modules: asset mapping, renderer, animation state machine, safe-region controller, pointer/touch interaction, native/web event adapters and local settings. States: idle, blink, walk, sit, sleep, jump, happy, wave, dragged, hidden. Map each state to actual available frames before implementation. Preserve asymmetrical costume/hair/flame details and only mirror where the asset guidance permits it.

Settings: Enable Pet, Enable Animations, Flame Effects, Reduced Motion/Performance Mode, Reset Pet Position. Persist independently in native preferences/browser storage; no server or cloud sync. Hide/disable must leave server/media operation unchanged. Pointer capture must not activate controls under dragging; menu and toggle must remain keyboard/accessibility reachable.

React only to actual successful server state transitions and existing media/search/download event signals. Hide for fullscreen and critical dialogs; restore the prior enabled state afterward. Pause when backgrounded and honor prefers-reduced-motion. Decode/cache compact derivatives once; no per-frame high-resolution decoding. Avoid doubling flames already baked into base frames.

Acceptance: frame/anchor consistency, no flicker/stretch/offscreen travel, every state and interaction, saved settings, safe areas, fullscreen restoration, background timer suspension and measured CPU/memory impact on POCO F3 plus supported other phones. All checks pending; no performance or physical-device claims.
