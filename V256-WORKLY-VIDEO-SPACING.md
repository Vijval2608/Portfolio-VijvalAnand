# V256 — Workly video thumbnail + Selected Works spacing

Base: **V255 Workly + V253 merge**.

## Workly thumbnail
- Replaced the reconstructed Workly CSS/Figma-motion thumbnail with the **user-supplied MP4** as the actual Selected Works thumbnail.
- Compressed the original ~84 MB / 1600×1200 / 60 fps file to a web-friendly **1200×900 / 30 fps H.264 MP4** at roughly **2.8 MB**.
- Added a matching local WebP poster frame for immediate first paint while the video loads.
- The thumbnail stays muted, looping and `playsinline`, and only plays while the Workly card is front-most, the Selected Works section is near/in view, and the document is visible.
- For `prefers-reduced-motion`, Workly stays on its poster instead of autoplaying the thumbnail motion.

## Selected Works buttons
- Removed the fixed 113.4 px desktop/tablet width added in V255.
- Orange project CTAs now **hug their own label + icon content** with `width:auto`, `min-width:0`, and `flex:0 0 auto`.
- Existing height, icon puck, orange treatment and hover behavior remain unchanged.

## Selected Works spacing
- Added a small **3.6 px** gap between the project title and description on desktop/tablet.
- Added a small **4.5 px** gap between the description block and the tags/actions row.
- Rebalanced the existing bottom inset so the overall card height and stack geometry remain unchanged.
- Phone cards retain their existing mobile-specific spacing, which already includes separate title/description and description/footer gaps.

## Preserved
All project order/copy from V255, Workly naming, Rupantaran removal from Selected Works, Work card stack choreography, Hero, Pong, Process, Skills, Experience, About, Contact, footer and responsive behavior remain unchanged.
