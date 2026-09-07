# V255 — Workly + V253 merge

Base: **V254 Workflow Suite**, with the omitted V253 refinements merged back in.

## Selected Works
- Renamed **Workflow Suite** to **Workly Enterprise Suite**.
- Workly is still project 01 and the default active project.
- Updated Workly copy to: **An AI-native B2B SaaS suite that brings everyday operations and complex enterprise workflows into one connected workspace.**
- Updated the list subtitle to **AI-native enterprise management suite**.
- Removed **Rupantaran Website Design** from Selected Works only. Its Experience entry remains unchanged.
- Selected Works is back to five projects: Workly, Fittribe, Serene Homes, Nippon, Dior.
- Workly's Figma action now opens the supplied frame: `723:216981`.

## Workly thumbnail motion
Figma source: `Workflow Suite / 723:216981`.

The website uses the exact Figma Motion Context timing/vector:
- `723:216985`: `(-2684.161, -1427.194) → (0, 0)`
- `723:223867`: `(0, 0) → (-2684.161, -1427.194)`
- duration: `20s`
- easing: `linear`
- loop: `infinite`

The values are scaled from the 1600px Figma source frame to the rendered Work media width. Motion runs only while the Workly card is front-most, the Work section is in view, and the document is visible. `prefers-reduced-motion` keeps a static state.

Figma's direct MP4 renderer returned a server-side render error for this timeline, so the site reproduces the timeline natively in CSS instead of depending on a flattened video or short-lived Figma asset URL. The screen artwork is packaged locally with the site.

## Work CTA sizing
On desktop/tablet, every orange Work action uses the same external geometry as Hero **See my work**:
- `113.4px × 37.8px`
- `16.2px` white icon puck
- matching radius/type/spacing and the existing orange → ink hover behavior

The phone Work card retains its scaled source-stage behavior so the rendered CTA remains approximately the same physical size as the phone Hero CTA.

## Restored V253 refinements
- Restored the roomier phone major-section gap: `78px → 92px` fluid range.
- Re-applied the safer landscape-tablet Work guardrail while leaving desktop and portrait structure intact.
- Made Pong's CPU more beatable by reducing its tracking ease from the V254 value (`5.6 + ...`) to the recovered V253-style softer tracking (`4.15 + ...`).
- Process content/layout is otherwise untouched.

## Preserved
Hero, navbar, music player, retro computer, Pong presentation, Work card transition choreography, Process, Skills, Experience, About, Contact, footer, custom cursor, responsive phone composition, and existing accessibility/reduced-motion behavior are otherwise unchanged from V254/V252.
