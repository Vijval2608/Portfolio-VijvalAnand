# Vijval Portfolio — Figma Hero Revert + V3 Navbar

This build intentionally returns to the original `vijval-portfolio-v3-retro-hero-figma` implementation.

## What was reverted
- Removed the single-viewport hero fitting introduced in the later versions.
- Restored the original 1512 × 982 Figma hero scaling/geometry.
- Restored all hero typography, artwork positions, music-card implementation and CTA behaviour from that original build.
- All portfolio sections below the hero remain the same as that build.

## What was retained from Hero V3
Only the navbar behaviour/style was carried forward:
- Fixed while scrolling across the entire portfolio.
- Desktop maximum width: **1284px**, matching the Figma navbar width.
- Width scales with the viewport below the 1512px design canvas.
- Height: **81px** desktop.
- PORTFOLIO: **16px**.
- Nav links: **14px**.
- Let's connect: **14px**.
- Figma-style translucent glass at the top of the page.
- Slightly stronger cream glass/blur after scrolling so it remains legible above every section.
- Original mobile navbar treatment retained at <= 820px.

No later hero viewport-fit rules are included.


## Final navbar pass
- Fixed navbar moved outside the hero stacking context so it remains the front-most layer across the site.
- Desktop/mobile navbar height: 60px.
- PORTFOLIO: 12px.
- Navigation links and connect CTA: 11px.
- Max desktop width remains 1284px and the persistent cream-glass scroll treatment is preserved.

## Music card
The hero music card is now a functional audio player with a Figma-matched smart-animate ON/OFF toggle and an analyser-driven waveform.

To play the requested track, place an audio file you are authorized to use at:

`assets/audio/sweet-dreams.mp3`

The site intentionally does not bundle third-party copyrighted audio. Browsers also require a user gesture for audible playback, so the control starts in OFF and plays when switched ON.

## Music card audio update

The supplied `Sweet dreams` MP3 is bundled at:

`assets/audio/sweet-dreams.mp3`

The hero music card uses the Web Audio API (`AnalyserNode`) to drive a 24-bar visualizer from the actual playing track. The frequency spectrum is grouped into logarithmically spaced bands so bass, vocals, and high-frequency detail produce distinct movement. All 24 waveform bars use exactly the same width; only their height/opacity changes during playback.

## Resume + navbar pass
- Hero "See my work" and "Download Resume" labels are 12px.
- Download Resume has no underline or chevron at rest; both appear on hover/focus.
- Hero Resume and navbar Resume both open the PDF in a new tab and trigger a local download.
- Navbar now has a plain `Resume` link immediately before the contact pill.
- Contact pill is 110px × 30px on desktop.

## Figma Work section

The Work section is implemented from Figma frame `436:3098`.
- `figma-work.css` contains the isolated Figma layout/styling.
- `figma-work.js` contains hover/tap preview behavior.
- All sections outside `#work` remain from the previous master build.

The source Figma uses the local/display fonts Mexcellent and Talina DEMO. The CSS requests those exact family names first and uses fallbacks only when those fonts are not installed/licensed as webfonts.

## Work typography + transitions (v3)
- Main Work heading now forces the exact Figma family name: `Mexcellent` (Regular, 64px, -3% tracking).
- Preview project titles force the exact Figma family name: `Talina DEMO` (Regular, 24px).
- Removed the old Monoton webfont import so it can no longer leak in as the Work heading.
- Project switching now keeps the glass card fixed and crossfades only its contents with a 520ms coordinated Smart-Animate-style transition.

Note: Mexcellent and Talina are commercial fonts. This build references their exact local family names rather than redistributing font files. For pixel-identical rendering on every deployed device, connect your licensed webfont kit to these family names.


## Font resolution fix

The Work section now declares `@font-face` aliases using `local(...)` for the internal names browsers commonly see for the two Figma fonts:

- Mexcellent / Mexcellent Regular / Mexcellent-Regular
- Talina DEMO / TalinaDEMO-Regular / Talina DEMO Regular

This fixes the common case where the font is installed on the computer but a normal HTML page fails to match the family name shown by Figma. For a deployed site that must render identically on machines where those fonts are not installed, connect your licensed webfont kit rather than redistributing desktop font files.

## Preview transition fix

The preview now uses one persistent `.figma-work-content-layer`. Project changes animate that one layer out, replace its contents, then animate it in. A transition serial cancels stale swaps, so rapid hover changes cannot leave old project content behind.

## Latest Work pass

- Removed the `Experience across` strip between Hero and Work.
- FitTribe preview now uses `assets/figma-work/fittribe-thumbnail.webp` (2x display resolution, centre-cropped to the 685:402 media ratio, ~223 KB).
- FitTribe `View` opens the supplied case study at `assets/case-studies/fittribe-case-study.pdf` inside the existing dark overlay viewer.
- Work preview card uses a stronger frosted/liquid-glass material while keeping typography outside permanent transforms for sharper rendering.
- Work `View` CTA now uses the same 126×42 / 12px primary-CTA language as the Hero CTA; both transition from orange to `#1e1e1e` on hover/focus.
- Work grain is now a local static texture behind the content rather than a live SVG turbulence layer over small type.

## Global design scale (current master)

This build intentionally bakes a **0.90 design scale** into the website so that Chrome at **100% browser zoom** visually matches the previous master when viewed at **90% browser zoom**.

This is not implemented with `transform: scale()` or CSS `zoom`, because those would distort viewport-relative (`vw`/`vh`) layout and fixed-position behavior. Instead, fixed CSS-pixel geometry and breakpoints are multiplied by 0.9 while viewport-relative percentages/units remain unchanged. Relevant JS pixel offsets and responsive thresholds are scaled as well.

For future design changes, `_scale-source/` contains the pre-scale source files. Edit those and run `python apply-design-scale.py` to regenerate the deployable root files at the locked 0.90 scale.

## Navbar alignment hotfix
The frosted-glass patch previously changed `.figma-nav-links` from `position:absolute` to `position:relative`, which shifted the tab group. The final override now preserves the glass material while keeping the original centered-tab positioning.

## Figma How I Work section
- Replaces only the previous How I Work section with Figma node `455:4405`.
- Source geometry is preserved in `_scale-source/figma-process.css` at 1512×1193.
- Root `figma-process.css` is the portfolio's locked 90% design-scale version.
- Vertical scroll pins the section and moves the 4326px film strip horizontally from the exact Figma starting position.
- Film perforations are generated locally (98 on each edge) and the process illustration is rebuilt as sharp DOM/CSS artwork, so this section has no expiring Figma asset URLs.


How I Work v2: fixed vertical perforation clipping, restored exact Figma header/tape spacing, updated note alignment to latest Figma, and reduced tape geometry to 92% while keeping native crisp typography.


## How I Work V3 viewport-fit fix
- The desktop film now scales proportionally only when the current viewport is too short to display the full tape.
- The complete lower perforation row is always kept inside the pinned viewport with a cream gap beneath it.
- A trailing blank film frame was added after `04 / SHIP + REFINE`, so the strip visually continues instead of ending at the final process card.
- The longer strip uses 118 perforations per edge and recalculates horizontal travel from its rendered width.


## V4 tape viewport fix
- Removed dynamic viewport fitting/scaling of the film strip.
- Reduced film perforations from 27.6×36.8px to 19.5×26px at source scale.
- Reduced perforation gap from 12.88px to 8.5px and rail-to-card spacing from 27.6px to 19px.
- Film height is now 501.68px at source scale (451.512px in the live 90% build).
- Desktop pin begins 120px later at source scale (108px in the live build), allowing the complete film strip to enter the viewport before horizontal scroll locks.
- Leading and trailing blank film frames are retained.

## How I Work V5 refinement
- Restored process cards to the original Figma-derived 90% geometry (751.5 × 363.6px) so only one content frame is fully visible at once on the target desktop viewport.
- Kept compact sprocket holes/rail spacing so the larger cards do not make the tape unnecessarily tall.
- Increased the heading-to-film gap and delayed the desktop pin until the intro copy has moved above the viewport.
- Added a Lenis-homepage-inspired scroll-linked intro drift to the `02 / HOW I WORK`, headline, and supporting paragraph.
- Rebuilt ScrollTrigger lifecycle to kill stale triggers on resize, remeasure from an untransformed film, refresh after fonts/load, and use a single compositor-safe horizontal transform with smoother scrub.

## How I Work V6 refinement
- Intro is now a dedicated sticky scroll phase with significant cream space before and after it.
- The description starts below the heading and travels faster, catching it near the top before both exit.
- Tape only enters after the intro phase and a post-intro gap; the horizontal pin contains only the film.
- Process cards enlarged to 864×414px with larger typography, image, spacing and clearer hierarchy.
- Intro and film ScrollTriggers are independent to prevent conflicting transforms/pin glitches.


## V7 intro timing refinement
- Lenis-like intro motion now begins as the heading enters the viewport instead of waiting for the intro block to hit the top.
- Paragraph keeps the faster catch-up motion and exits with the heading.
- Intro scroll phase shortened from 175svh to 145svh.
- Post-intro cream gap reduced from 240px to 54px so the tape arrives before the screen can feel empty.
- Horizontal film implementation and all other website sections remain unchanged.


## V8 section-heading rule
- Reduced How I Work intro-to-film gap by 50% (54px → 27px in the live 90%-scale build; responsive 36px → 18px).
- Section kicker typography is canonical across the portfolio: use the same face as `01 / SELECTED WORK` — `font-family: 'Zillah Modern','ZillahModern',sans-serif; font-weight: 400`. Apply this to every new numbered section kicker.


## V9 — actual heading-to-film gap fix
- The large visible gap was caused by the unused tail of the 145svh intro scroll phase, not the small post-gap spacer.
- The desktop film stage is pulled upward by 364.5px in the live 90% build (405px in pre-scale source), cutting the user-measured 729px visual gap in half.
- Intro motion timing and horizontal film motion are unchanged.
- Mobile explicitly resets the overlap to 0.


## V15 redesigned tape — Figma 470:5362
- Rebuilt the desktop film strip from the redesigned Figma node.
- Exact 30×40 / 14px perforation rhythm, card dimensions, 28px scene gaps and 13px radii mapped through the site's locked 90% scale.
- Removed the previous illustration panels; oversized Mexcellent 01–04 numerals now form the card visuals exactly like the redesign.
- Kept the latest per-step copy while applying the redesigned card typography/layout.
- Horizontal travel stops on card 04 rather than scrolling through Figma's long blank tail.


## V16 film refinement
- Smaller 18×24px sprocket holes with 9px rhythm for a more authentic film-strip feel.
- Tightened vertical strip geometry: 16px outer padding and 18px rail-to-card gaps.
- Grain is now applied directly to the dark strip background and subtly to each card.
- Added a centered final card: “LOL that's it” in the same Edit Undo heading face.
- Horizontal travel now ends with the closing card fully visible.


## V18 seamless horizontal lock
- Replaced the GSAP `pin` handoff with a native CSS `position: sticky` runway.
- ScrollTrigger now controls only the horizontal film translation; it no longer changes the tape stage's positioning mode at lock time.
- The approved intro/tape overlap is preserved on the runway wrapper, avoiding negative-margin pin geometry.
- Horizontal scrub increased slightly to 1.05 for a softer wheel/trackpad continuation.
- Mobile remains non-pinned and unchanged.


## V19 — Skills section from Figma
- Replaced only the existing Skills section with Figma node 478:6523.
- Source frame: 1512×1478, implemented at the portfolio's locked 90% scale.
- Exact Figma title/kicker typography, sticky-note sizes, gradients, rotations, shadows and coordinates.
- Window/character artwork uses the exact vectorized Figma asset from node 479:7234.
- Existing global Figma-native grain layer retained to avoid doubling the native NOISE effect.
- Work, How I Work, Experience, About and Contact are untouched.


## V20 — Skills sticky notes realism pass
- Added paper-like surface treatment to all four sticky notes.
- Added folds/creases, richer inset/highlight shadows, and more tactile depth.
- Added attachment details: tape on Product & UX / Tools; pins on Research / Visual + Brand.
- Kept layout, typography, positions, and overall section composition unchanged.


## V22 — Fixed disappearing sticky notes
- Rebuilt from V20, the last known-good visible-note version.
- Preserved all original Figma note width/height/background/rotation rules.
- Removed pin visuals using safe late CSS overrides only.
- Added irregular brown torn masking tape to every note.
- Added unique crease/fold patterns to each paper instead of repeating one fold.


## V23 — Skills full Figma redesign sync
- Rebuilt Skills from the latest Figma node 478:6523.
- Removed the prior custom tape/paper realism overrides and matched the redesigned Figma frame instead.
- Added the exact Figma tape vector assets with their canvas positions, mirrors and rotations.
- Enlarged/repositioned the window to the latest Figma dimensions and added its side/ledge shadow layers.
- Preserved every section outside Skills.


## V24 — responsive Skills clusters
- Re-parented every Figma tape vector into its corresponding note wrapper.
- Tape coordinates are now local to each note cluster, so note + tape scale and reposition as one unit.
- Added tablet, compact-tablet, mobile and narrow-mobile layouts while preserving desktop pixel-match.
- Window illustration also scales/reflows below the notes on narrower screens.

## V25 — deterministic bidirectional horizontal scroll
- Replaced the horizontal ScrollTrigger scrub tween with a direct scroll-position → film-X mapping.
- Native CSS sticky still owns the screen lock, so there is no fixed-position pin handoff.
- Scrolling upward and downward now uses the exact same progress equation; the tape cannot lag, get stuck, then skip the section.
- Added pageshow/load/font/resize re-measurement so restored scroll positions and layout refreshes stay synchronized.
- Kept the approved visual design, tape cards, Skills responsive work, and all other sections unchanged.


## V26 — per-component spring motion
- Added reversible viewport spring scaling to individual section children, not section containers.
- Uses CSS individual `scale`, so existing rotate/translate/GSAP transforms remain untouched.
- How I Work cards spring individually as they enter/leave the horizontal viewport.
- Skills note+tape wrappers animate as one cluster, preserving responsive tape attachment.
- Very small 1.0105 overshoot, soft settle, and subtle stagger; children shrink to 0.958 after leaving.

## V27 — Corrected child spring behavior
- Removed viewport spring animation entirely from How I Work; that section now has only its existing horizontal-scroll motion.
- Moved the small starting scale into CSS so animated components render at 0.958 from the first painted frame, rather than briefly appearing at normal size.
- Components spring from 0.958 to their true normal size (1), then remain exactly at 1 for the entire time they are visible.
- Components only scale back to 0.958 after fully leaving the viewport.
- Kept the small spring overshoot extremely subtle and settled final state exactly at 1.


## V28 — Work Experience redesign
- Reworked only the Work Experience visual system; content/card structure remains intact.
- Added a symmetric alternating center-line timeline on desktop.
- Matched portfolio theme with Figma cream background, orange/olive accents, Zillah Modern kicker/company labels, Mexcellent section title, Edit Undo role titles, and Poppins copy.
- Normalized card dimensions, padding, hierarchy, badge/tag treatments and alignment.
- Added clean responsive collapse to a single left-rail card timeline on mobile.
- Existing child spring behavior remains active for Experience items; How I Work remains excluded as in V27.


## V29 — Global kicker typography
- Added one shared `.section-kicker` class across Selected Work, How I Work, Skills, Experience, About and Say Hello.
- All section kickers now use IBM Plex Mono Regular at exactly 13px with the canonical #FC5134 orange.
- Experience's 04 / EXPERIENCE label now uses the shared kicker class rather than the old section-index/mono treatment.
- Preserved each section's existing positioning and spacing.


## V30 — About redesign
- Rebuilt About to match the cream/orange/olive retro design system used across the portfolio.
- Replaced the old circular/cropped About image with the newly supplied full portrait.
- Added a floating 3D portrait device with pointer-reactive tilt, light reflection and interval static/glitch pulses.
- Kept the existing About heading while rewriting the body in a more personal, quirky voice.
- Added design-belief, brain-as-AI, music-head and Kagurabachi details without turning the section into a dense bio.
- Added a hover/focus glass popover for Kagurabachi with April 2027 / Cypic information.
- Updated About viewport springs to animate individual children rather than the whole image/copy containers.
- Added responsive mobile layouts and touch behavior for the anime detail card.


## V31 — About refinement
- Reduced About heading size while preserving the Mexcellent editorial treatment.
- Reworked portrait depth with a thicker chassis, deeper multi-layer shadow and moving floor shadow.
- Increased pointer tilt range and synchronized highlight/shadow response so the 3D interaction reads immediately.
- Strengthened the timed TV-static effect with multi-band glitching and randomized intervals.
- Removed the `05. HUMAN` footer label from the portrait card.
- Added icon-only LinkedIn and Behance links under the About text in #1E1E1E.


## V32 - About balance + punctuation cleanup
- Restored About heading typography to the same 54-68px system as Experience and shortened the heading instead.
- New heading: `Close to the problem. / Closer to the people.`
- Reduced portrait device from 430px max width to 365px for better symmetry with the right-side copy.
- Rebuilt the floating floor shadow as a broad 25-29px blurred ambient shadow that blends into the cream background.
- Removed LinkedIn and Behance buttons from About for now.
- Removed em dashes from visible HTML/project content across the site.


## V33 - Contact theme pass
- Kept the existing Contact card structure and Bricolage Grotesque headline treatment.
- Aligned materials/colors with the rest of the portfolio: #F2E9DB, #1E1E1E, #FC5134, #59664F and subtle paper/glass depth.
- Kept the global IBM Plex Mono 13px section kicker.
- Set supporting paragraph copy in Poppins and utility/status/action text in IBM Plex Mono.
- Added LinkedIn and Behance buttons directly beside WhatsApp in the existing secondary action row.
- Preserved phone, email, main CTA hierarchy and overall layout.
- Added responsive tablet/mobile cleanup without changing the section concept.


## V34 - Detail polish
- Restored the V32 top-right concentric ring system inside the Contact card.
- Unified WhatsApp with the other secondary Contact buttons.
- Restyled the footer with cream background, IBM Plex Mono links, subtle orange partial underlines and clean spacing.
- Reused the Kagurabachi partial-to-full orange underline interaction on Hero Download Resume.
- Enlarged the Hero music card slightly for clearer toggle visibility.
- Changed center navbar hover to orange underline only, with no fade, color shift, scale or rise.
- Enlarged the white arrow circle in the Hero See my work CTA.


## V35 - Navbar + footer correction
- Removed the old opacity/translate hover rules from navbar center links and Resume at source.
- Nav text links now only draw an orange underline on hover/focus.
- Disabled lift/scale behavior on the navbar Connect pill.
- Footer now uses a full-width outer element and shell-aligned inner content.
- Removed every footer border/separator, including pseudo-element separators.


## V36 - Nav hover + seamless footer
- Replaced navbar pseudo-element hover underline with an in-anchor background underline animation to eliminate glass clipping/stacking issues.
- Navbar links remain completely static in color, position and scale; only background-size animates from 0% to 100%.
- Increased Contact bottom breathing room from 44px to 124px desktop, 104px tablet and 82px mobile so the card shadow fully fades before footer content.
- Contact and Footer keep the exact same #F2E9DB background with no footer border or shadow.


## V37 - Type + CTA cleanup
- Footer copyright and all footer links set to 9px.
- Contact buttons set to 9px.
- About BACKGROUND / DEFAULT MODE set to 9px; VIT Vellore / then stare at it for too long set to 10px.
- All live Zillah Modern usage and references removed; IBM Plex Mono used instead.
- Hero intro paragraph vertically centered relative to orange vertical line.
- Hero See my work icon exactly matches Work View: 16.2px white circle, 3.6px padding, 9px arrow.


## V38 - Music card type balance
- NOW PLAYING set to 9px.
- ON/OFF toggle label set to 9px.
- Toggle resized to 49 x 25px to properly fit the larger label.
- White speaker knob increased to 19px with a 10.5px speaker icon.
- ON/OFF smart-toggle positions recalibrated for the larger control.


## V39 - Laptop + music alignment
- Tightened the laptop/shadow overlap to remove the small visual seam.
- Main laptop moved slightly down; both shadow assets moved slightly upward on desktop.
- Mobile shadow bottom position adjusted separately to preserve the same contact.
- Sweet dreams title increased slightly to 13.2px desktop / 9px mobile.
- Song title weight set to 400 with 0.3px vertical padding.
- ON/OFF label weight explicitly locked to 300.


## V40 - Navbar hover hard fix
- Replaced CSS background/pseudo underline attempts with a real `.figma-nav-hover-line` child inside Work, Skills, About, Experience and Resume.
- Added `nav-hover.js` to animate only the orange line on mouseenter/mouseleave and keyboard focus/blur.
- Link text has no color, opacity, scale or position transition.
- Kept a CSS hover fallback so the underline still works if JavaScript is unavailable.


## V41 - Navbar interaction cleanup
- Removed the conflicting JS + CSS underline animation combination.
- Underline now uses one 300ms CSS transform transition from left to right.
- Moved each underline inside its text label, fixing the larger Resume gap.
- Work, Skills, About, Experience and Resume now share identical underline geometry.
- Restored Contact glass button hover lift to -1.8px with its elevated shadow.


## V42 - Hero first-load sequence
- Added a pre-paint `hero-intro-pending` state to prevent content flash before animation initialization.
- VIJVAL and ANAND are letterized at runtime and enter as one continuous staggered wave with spring overshoot and settle.
- Full-word grain overlay stays hidden until the letter build completes, preserving the letter-by-letter illusion.
- Role, years and navbar follow after the name with soft directional reveals.
- Hero intro orange rule draws vertically before its paragraph slides/fades in.
- CTA buttons lift in with a small stagger.
- Laptop rises while both shadow assets spread into place; stars spring/twinkle in.
- Music card is the final beat, floating in with a subtle depth rotation settle.
- Reduced-motion users and restored pages away from the top skip the entrance and see the final hero immediately.
- Existing Hero audio, Resume, navbar hover, section springs and downstream section motion remain intact.


## V43 - Figma Work glass stack
- Implemented Figma node 470:5958 / stack node 489:7971 while preserving the existing Work list exactly.
- New stack geometry at portfolio 90% scale: 666.9 x 555.3; cards 594.9 x 497.7.
- Exact five stack slots: x 0/18/36/54/72 and y 57.6/43.2/28.8/14.4/0.
- Updated card media padding to 21.6px from the new Figma 24px source padding.
- Every current Work project owns a persistent glass card; content is no longer swapped inside one preview shell.
- Hover/focus bubbles the requested project forward one neighboring card at a time with a short refractive blur/opacity phase at each z-plane crossing.
- Existing list active-state behavior and all View/openProject functionality remain intact.
- Back cards are non-interactive and removed from keyboard tab order until they reach the front.
- Responsive layouts scale the complete Figma stack as one object rather than changing its internal spacing.


## V44 - Direct card phase
- Replaced the V43 one-layer-at-a-time stack traversal with one direct selected-card-to-front transition.
- Selected card now reaches the front in ~286ms with a short blur/opacity refraction at the z-plane crossing.
- Cards previously in front shift backward together with only a 12ms micro-stagger for depth.
- Final stack order, Figma geometry, Work list and View functionality remain unchanged.
- Strengthened the selected card's temporary refractive glass rim during the fast phase.


## V45 - Ultra smooth direct phase
- Extended selected-card travel from ~286ms to 420ms with a softer ease-out curve.
- Reduced opacity loss from 42% to only ~4.5% at the depth crossing.
- Reduced blur peak from 2.7px to 0.8px for a cleaner glass refraction feel.
- Displaced cards now glide backward over 390ms with only 7ms micro-stagger.
- Z-plane swap moved to the softened midpoint at ~218ms.
- Final coordinates exactly match committed stack slots, eliminating end-frame snapping.
- Glass rim/shadow interpolation softened to 340ms.


## V46 - Work media + project actions
- FitTribe now has Figma + View. View keeps the existing PDF overlay.
- Serene Homes now has Figma + View; View opens the live website.
- Rupantaran now has Figma only; the old View action is removed.
- Nippon now uses the supplied Nippon graphics PNG as its thumbnail and onsite overlay preview, plus Figma + View.
- Dior now uses the supplied MP4 as a muted looping front-card preview and has View only.
- Dior View opens the real MP4 in the existing dark overlay with native playback controls.
- Dior poster is extracted from the uploaded video itself at 5.5 seconds.
- Added compact secondary Figma pills next to the existing orange primary View pill without changing stack geometry.


## V47 - Figma links + CTA redesign
- Serene Homes Figma destination updated to the supplied Serene Homes Design file.
- Rupantaran Figma destination updated to the supplied Rupantaran NGO Web Design file.
- Figma no longer looks like a tag: it is now a filled ink CTA with the same height, rounded silhouette, typography, and circular-arrow anatomy as View.
- View stays orange and turns ink on hover; Figma starts ink and turns orange on hover, keeping both actions visually related but instantly distinguishable.
- All existing Work stack, image, PDF, external-link, and video-overlay behavior is preserved.


## V48 - Serene/Rupantaran thumbnails + orange Figma CTA + performance
- Replaced Serene Homes Work card thumbnail with the supplied Thumbnail_Serene artwork.
- Replaced Rupantaran Work card thumbnail with the supplied Thumbnail_Rupantaran artwork.
- Both supplied PNGs are shipped as high-quality WebP thumbnails to reduce decode/network cost.
- Figma CTA is now orange by default and turns ink/black on hover/focus, matching View.
- Nippon's heavy PNG is preserved but the Work card/viewer uses a high-quality WebP derivative.
- Dior preview uses preload=none and only plays when its card is front + the Work section is near/in view + the tab is visible.
- Work card phase animation now uses compositor-friendly transform/opacity rather than animated CSS blur/filter.
- Only the front/phasing glass cards run the expensive backdrop blur, avoiding five simultaneous large blur layers.


## V49 - Glass frost restore
- Figma CTA text is exactly 9px across desktop, tablet and mobile.
- Reverted the V48 visual optimization that removed backdrop frost from back cards.
- Every stacked Work card now uses the same 27px frosted backdrop material as V47.
- Kept safe V48 optimizations: compressed thumbnails, Nippon WebP, Dior preload/pause behavior, and transform/opacity stack motion.


## V52 - Stable top-three responsiveness
- Rebuilt directly from V49, not V50/V51.
- figma-process.css and figma-process.js are byte-identical to V49.
- No responsive override targets How I Work or Skills.
- Hero becomes a real vertical document-flow stack below 774px.
- Work becomes a clean one-column layout while its existing JS keeps the glass stack scaled proportionally.
- Music hover copy shortened to `this was on loop while i built the portfolio :)` at 9px orange.
- Music hover retains the subtle scale and slightly deeper shadow.


## V53 - Final horizontal-film sticky fix
- Removed the responsive layer's global body overflow-x:hidden.
- That overflow was becoming a scroll ancestor above the native sticky tape stage, so the lock was skipped while the runway height remained.
- Restored normal visible root overflow outside viewer/menu states.
- How I Work CSS, JS, and markup remain unchanged and match the stable V49 implementation.
- This restores the horizontal lock and makes the runway release directly into the existing Skills spacing instead of a blank gap.
