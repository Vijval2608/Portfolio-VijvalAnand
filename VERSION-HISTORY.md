# Portfolio Version History

Current version: **v283**


## v283 — Skills code modal opacity
- Increased the hollow Skills code modal opacity by 20 percentage points without changing its geometry or interaction behavior.
- Outer cream frame increased from 70% to 90% opacity.
- Central black code surface increased from 40% to 60% opacity while remaining independent of the hollow outer frame.
- Preserved all v282 production security, Pong verification, startup, layout, and interaction behavior unchanged.


## v282 — Production protection + verified Pong wins
- Preserved the v281 visual layout, startup sequence, performance tuning, Selected Works behavior, Skills interactions, Contact layout, and all normal Pong controls/physics.
- Added an all-rights-reserved proprietary license and machine-readable author/copyright/rights metadata without adding visible page UI.
- Hardened Netlify response headers with anti-framing, HSTS, same-origin resource policy, no-archive guidance, a restrictive Permissions Policy, and a Content Security Policy.
- Replaced blanket inline-script permission with exact SHA-256 CSP hashes for the three required inline startup scripts.
- Added `robots.txt` opt-outs for common AI/model-training crawlers while keeping normal search indexing allowed.
- Kept Pong scores private inside the existing closure and froze the public Pong controller so it exposes only enter/exit/status methods.
- Added optional Netlify server-side Pong win verification: genuine matches collect low-rate internal physics evidence; the verifier checks score sequence, point boundary crossings, timing, and trajectory plausibility before issuing a signed proof code.
- A server-signed `VERIFIED` proof appears only on a validated player-win CRT state; changing DOM/canvas text or a client score alone cannot generate a valid proof.
- Added `/api/pong-verify` routing plus deployment notes. Verified-win signing requires a private `PONG_VERIFY_SECRET` Netlify environment variable and never stores that secret in the public site.
- Added SHA-256 deployment checksums after packaging for integrity tracking.

## v281 — Safe performance pass + Pong position
- Moved the Hero Pong CTA vertical offset from 80px to 50px; horizontal position remains 60%.
- Kept the v271 startup/CRT state machine and all approved interaction state logic untouched.
- Reduced the 3D Hero render oversampling from 1.42x to 1.30x, lowering WebGL pixel workload while preserving the high-resolution CRT texture.
- The Sweet Dreams waveform now stops repainting while the Hero is off-screen or the tab is hidden; audio playback itself continues normally and the waveform resumes on return.
- Throttled the Hero navbar scroll-state write through requestAnimationFrame and skip redundant class writes.
- The 3D periodic cursor-blink wake-up now runs only when the CRT is fully ready/idle, avoiding redundant wake-ups during startup and Pong where a render loop is already active.
- Added a preconnect/dns-prefetch hint for the existing GSAP CDN dependency.
- No changes to Selected Works state/order behavior, Skills CTA/modal interactions, project overlays, Pong gameplay, Hero reveal timing, or Contact layout.

## v280 — Pong CTA final position

- Moved the Hero `wanna play pong?` CTA to the requested manual position: `--v278-pong-x: 60%` and `--v278-pong-y: 80px`.
- Increased the Pong CTA font size by exactly **1px** (16px → 17px).
- Preserved the v279 Contact alignment, Selected Works behavior, Skills hollow glass, startup/CRT sequence, footer Pong link, project interactions, and all other approved behavior unchanged.

## v279 — Contact alignment + Pong hint nudge

- Moved the manually positioned Hero `wanna play pong?` hint **20px lower** while preserving the exposed v278 positioning variables for further manual tuning.
- Rebuilt the Contact bottom layout into two anchored stacks: conversational copy + the unchanged tiny Pong side quest at bottom-left, and email + contact CTAs at bottom-right.
- The right contact action stack now shares the same right card edge as the `OPEN TO THE RIGHT OPPORTUNITY` badge above for cleaner vertical alignment and spacing.
- Preserved the v278 hollow Skills glass treatment, Selected Works state behavior, footer Pong link, startup/CRT sequence, project interactions, Pong game, and responsive behavior.

## v278 — Hollow Skills glass + manual Pong positioning

- Rebuilt the Skills code window as a genuinely hollow cream frame: the outer frame uses roughly 70% translucent cream only around the code opening, while the central black code surface is independently roughly 40% opaque.
- Moved the Hero Pong hint below Download Resume and exposed `--v278-pong-x` / `--v278-pong-y` for manual positioning without JavaScript changes.
- Kept the tiny side-quest copy unchanged and presented it as a quiet Contact footnote.

## v277 — Interaction state polish

- Changed Selected Works so Workly is forced only on the first visit; later re-entry preserves whichever project was last active, preventing the hidden Workly card overlap.
- Made the footer `Play Pong ↗` item visibly available on desktop/tablet.
- Refined Skills glass opacity and kept the head/eyes cursor-follow code sample.
- Kept the Contact challenge copy exactly as: `↳ tiny side quest: beat pong + send me a screenshot. I might owe you a free UX audit.`

## v276 — Hero/contact polish

- Updated the Hero bio to the approved Designer + CS wording.
- Refined the Pong hint positioning and Selected Works state handling.
- Added the subtle Pong side quest to Contact and preserved the footer Pong shortcut.

## v275 — Selected Works reset + interaction polish

- Selected Works now resets to **Workly Enterprise Suite** whenever the section is entered/re-entered, so the lead project is always the default instead of whichever card was last hovered.
- Restored the orange interactive cursor state on the clickable front Work thumbnail by explicitly treating the media shell as an interactive target.
- Repositioned the casual `psst... wanna play pong?` hint into visible breathing room directly beside the monitor and removed the curved arrow so it stays close to the object without crossing other Hero copy or the music-card hover note.
- Fixed the Skills illustration CTA hover gap with a transparent pointer bridge/focus-within state, so the annotation remains visible while moving from the artwork onto `wanna see how I built this? →`.
- Reduced the Skills code window opacity/visual weight so the illustration remains visible behind the glass panel.
- Replaced the previous leg-animation code excerpt with the actual head/eyes cursor-follow logic from the live Skills rig.
- Preserved v274 project opening routes, viewer cursor layering, startup/CRT behavior, Hero timing, Pong gameplay, responsive layout, and performance fixes.

## v274 — Interaction polish: Pong placement, Skills glass code panel, cursor layering

- Kept all v273 project-opening behavior, but removed the `open ↗` thumbnail hover badge so Selected Works thumbnails remain visually clean.
- Moved the casual `psst... wanna play pong?` Hero annotation into the lower-right breathing room, below the music-card hover copy, and redrew its curved arrow so it points back toward the computer without crossing the music card.
- Raised the custom selection cursor to the viewer's top stacking level so it remains visible above project overlays.
- Merged `wanna see how I built this? →` into the existing Skills illustration hover annotation, with the CTA in the site's dark ink color so it reads as a distinct action without creating a second floating label.
- Replaced the full project-viewer code preview with a local glassmorphism code window inside the Skills illustration. The panel includes a compact filename bar, real rig code, copy action, close control, keyboard Escape support, and never leaves the Skills section.
- Preserved v272/v273 startup timing, Hero motion, Pong behavior, Work project routing, Skills rig animation, responsive layout, and performance fixes.

## v273 — Final interaction affordances

- Preserved the stable v272 Hero startup, CRT power-on/BOOTING sequence, earlier 5% Hero reveal, computer movement, 3D runtime, Pong, and performance behavior.
- Selected Works thumbnails now open the front project directly. Workly Enterprise Suite and Real Estate Website Design go straight to their Figma files; Fittribe, Nippon, and Dior open in the existing portfolio viewer overlay.
- Clicking a project title in the left Selected Works list now follows the same open behavior while the rest of the row keeps its existing hover/select interaction.
- Added a small `open ↗` hover affordance on the active Work thumbnail without changing the card layout.
- Added an always-visible Skills illustration CTA: `wanna see how I built this? →`. It opens the existing retro viewer with a readable excerpt from the actual SVG/JavaScript rig and a working Copy code button with clipboard fallback.
- Added a casual Hero annotation, `psst... wanna play pong?`, with a curved arrow pointing toward the computer. The text itself can also enter Pong and participates in the Hero depth/reveal system so it does not float independently from the scene.
- Kept the package lean by removing the superseded unused `v271-hero-threshold-motion.js`; v272 remains the active Hero threshold controller.



## v272 — Earlier, faster Hero reveal

- Preserved the v271 startup/root-fix architecture without changing the CRT power-on, BOOTING sequence, computer movement, shadows, or 3D runtime ownership.
- Hero planes now start popping at 5% of the computer’s visible/eased relocation progress instead of 15%, so the page becomes readable almost immediately after the computer begins moving.
- Shortened the shared Hero/component reveal duration from 1950ms to 1050ms, including the navbar’s synchronized reveal, so the full Hero finishes loading much sooner while the computer continues its translation uninterrupted.
- Kept the reveal mathematically linked to the same visible relocation progress rather than a separate guessed timer.

## Versioning rule

Every future requested change must be delivered as a new, sequentially numbered
portfolio version with its own ZIP filename and top-level folder. Preserve the
previous version. Append each release to this file inside the ZIP; do not make
a separate history download. Always include a ZIP download link in the handoff.

## v271 — Startup root-cause repair after optimization

- Traced the startup regression across v266 -> v267 -> v268/v270 instead of
  applying another visual timing patch.
- Restored `v218-figma-hero.js`, which the v268 cleanup accidentally removed
  even though `index.html` still dynamically loaded it. This file emits the
  real `hero:desktop-base-ready` signal used by the desktop Hero intro.
- Removed the v268 3D-runtime readiness gate from the Hero choreography. The
  intro once again starts from the base-Hero readiness signal exactly like the
  confirmed-good v266 flow, so asynchronous WebGL loading can never reorder
  blank -> power-on -> BOOTING.
- Restored one authoritative, frame-driven startup state machine for blank CRT,
  CRT power-on, BOOTING, computer relocation, and Hero reveal.
- Kept v270/v268's **15% Hero reveal timing**, fixed-viewport computer movement,
  final yaw, shadows, Pong, 100% page scale, copy, and lean package.
- Hardened the CRT controller's emergency fallbacks: once the real
  `hero:computer-ready` event has arrived, fallback power/boot timers are
  permanently disarmed and cannot race the main sequence.
- Hardened the optimized WebGL renderer so it remains continuously awake for
  every non-ready CRT state (blank/powering/booting/typing), then returns to
  idle/on-demand rendering only after the screen reaches its final ready state.
- Preserved the safe performance work from v267/v268: sleeping custom cursor,
  lower WebGL DPR, high-performance GPU hint, capped anisotropy, and clean ZIP.

## v270 — v268 restored + v266 CRT power-on + v269 About copy

- Reverted the working base to **v268**. None of v269's animation/timing changes are carried forward.
- Kept only the v269 About opening copy: “i like taking rough ideas, figuring out how they should work, and making them simple enough that people just get it.”
- Restored the CRT startup control flow from **v266**, the last confirmed-good power-on version: blank hold -> frame-driven horizontal CRT glow/open -> BOOTING.
- Restored v266-style continuous CRT frame servicing only while the startup copy is not ready, preventing the power-on texture from missing animation frames. Normal v268 on-demand rendering/performance behavior resumes after startup.
- Preserved v268's Hero copy, 15% component-reveal timing, fixed viewport, computer relocation/yaw, 100% initial page scale, performance optimizations, shadows, Pong, and lean package structure.

## v268 — Smoother intro, restored CRT power-on, 15% reveal, lean package

- Shortened the Hero copy to: “I’m a Product Designer with a CS background —
  equally curious about ‘why does this feel weird?’ and ‘can we actually ship it?’”
- Shortened the About lead to a single conversational line about the messy middle
  between “we kinda know what this should do” and something ready to ship.
- Repaired the v267 CRT power-on regression. The WebGL renderer now gets a
  dedicated ~560ms animation wake only while the CRT is powering on, then
  returns to the on-demand/idle-sleep behavior from the performance pass.
- Kept the opening strictly inside the Hero viewport and preserved the v266
  centered boot composition, Pixel Forge CRT, stronger left-facing final yaw,
  Pong, shadows, and fixed document scroll during startup.
- Changed the Hero component reveal trigger from 30% to **15% of the visible
  eased computer relocation progress**. The computer keeps moving continuously.
- Reduced intro jank by making blank/power/boot-hold stages timer-driven instead
  of running the Hero motion RAF while nothing is moving, and by moving the
  component reveal onto compositor-friendly translate/scale/opacity updates.
- Added a desktop startup readiness gate so the heavy 3D bundle/model setup
  finishes before the visible computer motion begins, preventing parse/model-build
  work from interrupting the intro mid-animation. A fallback path still starts
  the same sequence if WebGL is unavailable.
- Reduced desktop WebGL DPR cap from 1.35 to 1.15 (1.08 on narrower layouts)
  while retaining the 1728×1376 CRT texture, so screen text remains high-res.
- Set the site-owned page scale explicitly to 100% (`initial-scale=1`, `zoom:1`);
  user/browser zoom remains under browser control.
- Cleaned the deliverable: removed superseded version bundles/scripts/styles,
  duplicate release-note files, unused 3D development assets, and unused Work
  thumbnails. `VERSION-HISTORY.md` remains the single in-ZIP change log.

## v267 — Performance optimization + Hero/About copy swap

- Preserved the approved v266 Hero choreography, 30% reveal timing, CRT clarity,
  Pong behavior, shadows, and default 3D resting angle.
- Reworked the custom selection cursor so it sleeps when fully settled instead
  of running a permanent requestAnimationFrame loop across the whole site.
- Reworked the soft cursor glow the same way: it renders only while catching up
  to actual pointer movement, then stops. Removed its extra CSS blur filter; the
  radial gradient already supplies the visual feather without that compositor cost.
- Reduced active Hero WebGL pixel ratio to a capped 1.35x on desktop (1.2x on
  narrower desktop/tablet widths) while retaining the high-resolution CRT texture.
- Switched the WebGL renderer power hint from low-power to high-performance and
  capped texture anisotropy at 4x to reduce GPU sampling cost.
- Added direct CRT DOM mutation wake-ups and removed the previous pre-copy-ready
  60fps polling loop. The 3D renderer now wakes when the screen actually changes,
  while camera motion/Pong continue to update when needed.
- Hero paragraph now uses the previous About lead: computer-science background,
  “why does this feel weird?” and “can we actually ship it?”
- About lead now carries the previous Hero idea in a more conversational version:
  turning messy early product ideas into clear, scalable, production-ready systems.
- v266 and all earlier version files remain packaged as local history.

## v266 — Fixed-viewport computer flow, 30% reveal, sharper CRT

- Removed the v265 scene/camera-rig relocation entirely. The Hero scene now
  remains fixed while only the computer moves from its centered 72% boot state
  into the original final Hero coordinates, keeping the whole intro visually
  inside the first viewport.
- Added a desktop-only intro scroll lock so wheel/trackpad input cannot move the
  document during the startup choreography; normal scrolling is restored as soon
  as the Hero intro completes.
- Rebuilt the relocation as one continuous cubic ease-in/out. X/Y translation
  stays strictly monotonic; scale and 3D yaw receive that same visible progress.
- Kept the spring feeling inside the relocation itself as one small scale/depth
  overshoot during the final 28% of the move. There is no separate post-settle
  animation and no backward camera/position oscillation.
- Hero elements now start their existing pop/reveal when the **visible eased
  computer relocation reaches 30%**. The computer continues moving without a
  pause while those elements emerge.
- Kept the stronger ~16.6 degree left-facing resting angle from v265, but its
  startup yaw is now driven directly by the same relocation progress instead of
  a separate front-loaded easing curve.
- Kept Pixel Forge for `BOOTING`, its loader, and
  `DESIGNING / PRODUCTS THAT / HIT DIFFERENT.`
- Doubled the live CRT texture from 864×688 to 1728×1376 before mapping it onto
  the angled 3D glass, making the pixel glyphs substantially clearer.
- Increased CRT copy contrast/size slightly and disabled smoothing on the
  intermediate canvas pass. Pong inherits the same high-resolution CRT surface.
- Added vertical reveal headroom above/below every CRT text line in both the DOM
  fallback and live 3D renderer so Pixel Forge's top pixels are no longer clipped
  while typing or while `BOOTING` is visible.
- v265 and all earlier version files remain packaged as local history.

## v265 — Camera-rig relocation, true 50% reveal, integrated spring, Pixel Forge CRT

- Restored Pixel Forge for both `BOOTING` and the normal CRT message
  (`DESIGNING / PRODUCTS THAT / HIT DIFFERENT.`) in the fallback DOM and live
  WebGL CRT texture. Pong remains Pixel Forge as well.
- Increased the default/resting left turn to roughly 16.6 degrees and slightly
  front-loaded the yaw during the relocation so the stronger turn is visible
  throughout the move, not only at the end.
- Rebuilt the relocation as a scene/camera-rig move: the Macintosh stays at its
  native position/scale inside the Hero scene while the entire scene pans and
  zooms from the centered 72% boot framing into the final composition. This is
  intended to feel like the camera is moving around a stationary computer.
- Hero elements now begin their pop when the **visible/eased camera progress**
  crosses exactly 50%. The reveal uses an immediate ease-out start so the first
  visible motion happens on that midpoint instead of appearing delayed.
- Removed the separate post-settle computer spring phase. The damped overshoot
  now lives inside the final third of the same camera relocation and resolves to
  the exact final state at the end of that one continuous movement.
- v264 and all earlier version files remain packaged as local history.

## v264 — Mid-relocation Hero reveal, stronger left turn, final spring, new CRT font

- Kept the Macintosh relocation as one synchronized move/scale/yaw animation,
  gently extended to 1.45s.
- Hero elements now begin their existing pop/reveal at exactly 50% of that
  relocation instead of waiting for the computer to finish. There is no pause;
  both animations overlap as one continuous opening flow.
- Moved the synchronized Navbar/component-start event to the same midpoint.
- Increased the final/default 3D left turn from roughly 10 degrees to roughly
  12 degrees while preserving the pointer-driven yaw behavior.
- Added a short 560ms damped spring after the computer reaches its exact final
  position/size/yaw, producing a subtle physical pop into place while the Hero
  reveal continues underneath it.
- Changed the normal CRT message (`DESIGNING / PRODUCTS THAT / HIT DIFFERENT.`)
  from Pixel Forge to IBM Plex Mono 500 in both fallback DOM and live WebGL
  rendering. Pong intentionally retains Pixel Forge.
- V263 and all earlier version files remain packaged as local history.

## v263 — Blank CRT power-on, synchronized settle, tighter soft shadows

- Computer now arrives with a genuinely blank CRT; it no longer enters already
  showing `BOOTING`.
- Added a separate old-CRT turn-on effect: thin horizontal glow -> expanding
  screen bloom -> stable screen. `BOOTING` begins only after power-on completes.
- Added the same power-on treatment to the live WebGL CRT texture, not only the
  fallback DOM screen.
- Preserved the centered small spring entrance and the `. .. ... .. .` loader.
  Relocation now starts at roughly 2.67s from intro start.
- Unified the relocation into one gentle 1.35s motion: X/Y translation, scale,
  and 3D yaw all use the exact same smootherstep progress. Removed the old
  relocation arc/depth bump and separate exponential yaw release.
- Tightened computer/cassette contact-shadow footprints and lowered opacity.
  Rebuilt their shader falloff as core + soft + feather layers with alpha fully
  fading before the plane edge.
- Shortened the directional cast shadow by moving the key light more overhead,
  reduced ground-shadow opacity from 0.24 to 0.14, and increased VSM softness.
- Increased WebGL paint safety margin to 21% per side while keeping camera
  compensation, so the softer shadow has room to fade without changing model
  size or stealing CTA interaction.
- v262 and all earlier files remain packaged as local version history.

## v262 — Boot-first hero, larger CRT/Pong type, softer full shadows

- Added a desktop first-load boot sequence: computer starts centered, smaller,
  straight-on, and springs in before anything else in the Hero is revealed.
- CRT now shows `BOOTING` with the `. .. ... .. . .. ... .. .` loading cycle;
  relocation begins roughly 2.5 seconds after the boot trigger.
- After boot, the computer translates/scales into its original v261 Hero
  position and rotates from front-facing into the established slightly-left
  resting angle. Only after it settles does the preserved Hero component reveal
  begin.
- Increased the live 3D screen copy ceiling from 76px to 92px (82px safe floor)
  and enlarged the fallback DOM CRT text/cursor to match.
- Enlarged actual Pong canvas scores, labels, ready/win messages, controls and
  restart/serve copy without changing gameplay physics.
- Expanded the WebGL render margin by 18% and compensated the orthographic
  camera so the model keeps its size while the complete shadow can paint.
- Reworked contact shadows with wider shader planes, edge feathering, and
  tight/soft/broad falloff layers; increased directional shadow softness.
- Kept the expanded WebGL paint margin non-interactive so Hero CTA hit areas are
  not covered.
- Validation: changed JS/MJS syntax checks, active asset/ref wiring, timing
  assertions, version-history packaging, and ZIP integrity. A full GPU visual
  browser pass could not be completed in the container environment.

## v261 — Model shadows, readable screen, directional parallax

- Removed both old hero SVG shadow elements and the computer layer's CSS drop
  shadow. Custom 3D shadows now provide the complete ground treatment.
- Refined separate contact shadows around the actual computer foot and cassette
  shell, with tighter contact, soft falloff, and directional ambient spread.
- Increased screen text from 54px to up to 76px on the 864px display texture,
  with font-aware fitting, brighter amber, larger cursor, and updated spacing.
- Cursor left turns the computer/cassette slightly left; cursor right settles
  them into a straight front view. The interaction spans the hero, uses smooth
  easing, and retains reduced-motion and Pong behavior.
- Disabled the old pointer translation only on the ready 3D computer layer.
  Other hero layers, page content, textures, proportions, and scroll motion
  remain unchanged.
- Validation: text fitting, turn direction/endpoints, shadow footprint alignment,
  removal of legacy shadow elements, source syntax, and bundled asset wiring.
  Browser visual testing was not performed.

## v260 — Surface texture and shadow refinement

Internal hero revision previously delivered in the v258 ZIP. Corrected the top
and side grain mapping, added subtle ABS bump relief and matte studio lighting,
and introduced soft cast/contact shadows.

## v259 — Direct texture loading

Internal hero revision previously delivered in the v258 ZIP. Replaced GLB-based
runtime texture loading with direct RGBA reference textures and a GPU color
check. Added unique loading scripts and a 22-degree resting view.

## v258 — 3D hero introduction and repairs

Replaced the desktop hero computer image with a 3D computer and cassette based
on the supplied front/right references. Retained typing and Pong on the CRT.
Follow-up repairs corrected blank texture exports and increased computer width
by 10% and depth by 35%.

## v257 — Workly alignment and tags

Aligned the Workly video thumbnail at its top edge, updated its tags to product,
AI, SaaS, and workflow, and changed the illustration hover copy to “coded it”.
Earlier project-specific notes remain in the included versioned Markdown files.


## v276 — Final interaction/layout polish
- Hero bio shortened to: “I’m a Designer with a CS background so equally curious about ‘why does this feel weird?’ and ‘can we actually ship it?’”
- Repositioned the Pong hint into the free band immediately to the right of the computer monitor, away from ANAND and the music card.
- Hardened Selected Works re-entry: reset now occurs on actual viewport entry, invalidates in-flight stack animations, clears stale inline properties, and re-snaps/rescales Workly cleanly as the lead project.
- Added an explicit interactive cursor hook to Work thumbnails so hovering the active thumbnail uses the orange clickable cursor state.
- Reduced opacity of the entire Skills code-preview window to 80%; head + eyes cursor-follow snippet remains unchanged.
- Added a casual Pong challenge note in Contact inviting a screenshot for a possible free audit.
- Kept and verified the existing Play Pong footer shortcut.


## v277 — interaction state + final easter-egg polish
- Selected Works resets to Workly only on the visitor's first actual entry; later re-entry preserves the last hovered/active project and stack order.
- Pong hint is dynamically positioned 8px to the left of the actual CRT screen and aligned with its lower edge.
- Skills glass shell opacity restored; only the central dark code surface remains strongly translucent.
- Footer Play Pong link is persistently visible on desktop/tablet layouts where the Hero computer experience exists.
- Contact Pong challenge moved out of the main copy and restyled as a quiet “tiny side quest” note.
- Preserved all v276 startup, project-opening, cursor, Skills CTA, and Pong gameplay behavior.

## v278 — hollow Skills glass + manual Pong placement + contact side-quest polish
- Rebuilt the Skills code preview as a genuinely hollow glass frame: the cream outer shell is ~70% translucent only around the code rectangle, while the central black code surface is independently ~40% opaque with no cream layer underneath it.
- Moved the Hero Pong hint directly below the Download Resume action and exposed `--v278-pong-x` and `--v278-pong-y` on `.figma-actions` for manual position tuning.
- Removed the previous CRT-bound JS positioning logic for the Pong hint; its position is now intentionally simple and CSS-controlled.
- Kept the “tiny side quest” copy exactly unchanged, but moved it to the left/contact-copy column as a quiet dashed footnote so it reads as an easter egg instead of competing with contact actions.
- Preserved all v277 Work state behavior, startup sequence, project interactions, footer Pong link, Skills CTA behavior, and Pong gameplay.

## v285 — correct cold-cache fallback reference + remove legacy computer asset
- Corrected the v284 packaging mistake where only the preload referenced the new placeholder while the actual Hero `<img>` still referenced the old `computer-image-594-186-v131.png`.
- Both the preload and the rendered Hero fallback now use `assets/figma-hero/computer-image-3d-placeholder-v285.png`.
- Physically removed the legacy `computer-image-594-186-v131.png` asset from the production package.
- Kept a short opacity handoff so the matching placeholder fades gently when the WebGL/Three.js canvas becomes ready.
- Rebuilt from the deployed v283 checkpoint so all protected production behavior, Pong verification, startup choreography, interactions, and layout remain unchanged.
