/*
  ==============================================================
  WORK DATA — ADD / EDIT PROJECTS HERE
  ==============================================================

  This file drives the complete Work section.
  You DO NOT need to edit the HTML to add a project.

  featured: true  -> visible in Selected Work
  featured: false -> appears after “Show more designs”

  visual types:
    { type: "image", src: "assets/example.png", position: "center" }
    { type: "art", art: "edpi" } // generated with HTML/CSS

  action kinds:
    { kind: "figma", label: "Figma", href: "https://..." }
    { kind: "live", label: "Live demo", href: "https://..." }
    { kind: "behance", label: "Behance", href: "https://..." }

    // Opens INSIDE the portfolio overlay:
    { kind: "view", label: "View", viewer: { type: "pdf", src: "assets/case-studies/project.pdf" } }
    { kind: "view", label: "View", viewer: { type: "video", src: "assets/videos/ad.mp4", poster: "assets/poster.jpg" } }
    { kind: "view", label: "View", viewer: { type: "images", images: ["assets/case-studies/01.jpg", "assets/case-studies/02.jpg"] } }

    // Demo gallery rendered by this template. Useful until final files are added:
    { kind: "view", label: "View", viewer: { type: "generated", art: "fittribe" } }

  IMPORTANT:
  Buttons render ONLY when an action exists. So if a project has no live
  website, simply do not add a "live" action.
  ==============================================================
*/

window.PORTFOLIO_PROJECTS = [
  {
    id: "edpi",
    featured: true,
    title: "EdPi",
    eyebrow: "AI-supported B2B SaaS",
    year: "2025 — now",
    summary: "Product design across the website, design system, dashboards and complex organization-management workflows.",
    tags: ["Product design", "Design system", "B2B SaaS", "Motion"],
    visual: { type: "art", art: "edpi" },
    floaters: [
      { kicker: "ROLE", value: "Product Designer II" },
      { kicker: "SCOPE", value: "0 → Pilot" }
    ],
    actions: [
      { kind: "view", label: "View", viewer: { type: "generated", art: "edpi" } }
    ]
  },
  {
    id: "serene",
    featured: true,
    title: "Serene Homes",
    eyebrow: "Real estate · Product + brand",
    year: "2024",
    summary: "Responsive web experience and product UI supported by a scalable design system and a complete visual refresh.",
    tags: ["UX/UI", "Responsive web", "Brand", "Design system"],
    visual: { type: "image", src: "assets/serene-homes.png", position: "center top" },
    floaters: [
      { kicker: "ENGAGEMENT", value: "+42%" },
      { kicker: "BOUNCE RATE", value: "−17%" }
    ],
    actions: [
      { kind: "figma", label: "Figma", href: "https://www.figma.com/design/jpMgKSoyqRkMLv39LaGLWb/Serene-Homes-Design?m=auto&t=pGfZkcsrhDtwHbOk-6" },
      { kind: "live", label: "Live demo", href: "https://serenehomes.co.in/" }
    ]
  },
  {
    id: "fittribe",
    featured: true,
    title: "FitTribe",
    eyebrow: "Fitness mobile app · Case study",
    year: "2026",
    summary: "A social fitness experience designed around consistency, guided workouts and progress without turning fitness into homework.",
    tags: ["Mobile product", "UX research", "UI system", "Case study"],
    visual: { type: "art", art: "fittribe" },
    floaters: [
      { kicker: "FORMAT", value: "Mobile" },
      { kicker: "FOCUS", value: "Consistency" }
    ],
    actions: [
      /* Add your Figma URL when ready:
      { kind: "figma", label: "Figma", href: "YOUR_FIGMA_URL" },
      */
      { kind: "view", label: "View case study", viewer: { type: "generated", art: "fittribe" } }
    ]
  },
  {
    id: "rupantaran",
    featured: true,
    title: "Rupantaran",
    eyebrow: "NGO · Web product",
    year: "2023 — 24",
    summary: "A complete website redesign and implementation focused on making the organization easier to understand, trust and support.",
    tags: ["UX/UI", "Web design", "React", "PHP"],
    visual: { type: "image", src: "assets/rupantaran.png", position: "center top" },
    floaters: [
      { kicker: "VOLUNTEERS", value: "+60%" },
      { kicker: "DONATIONS", value: "+45%" }
    ],
    actions: [
      { kind: "figma", label: "Figma", href: "https://www.figma.com/design/Vnzu98wlvWUYIGTVtAVl5n/Rupantaran-NGO-Web-Design?m=auto&t=pGfZkcsrhDtwHbOk-6" },
      { kind: "live", label: "Live demo", href: "https://rupantaran.co.in/" }
    ]
  },
  {
    id: "wareiq-ad",
    featured: true,
    title: "WareIQ — AI Ad",
    eyebrow: "AI video · Creative direction",
    year: "2026",
    summary: "A short-form AI-generated advertising experiment built around one clear product idea and a cinematic visual rhythm.",
    tags: ["AI video", "Art direction", "Motion", "Ad creative"],
    visual: { type: "art", art: "wareiq" },
    floaters: [
      { kicker: "MEDIUM", value: "AI Video" },
      { kicker: "ROLE", value: "Direction" }
    ],
    actions: [
      /* Add when the MP4 is ready:
      { kind: "view", label: "Play video", viewer: { type: "video", src: "assets/videos/wareiq.mp4", poster: "assets/wareiq-poster.jpg" } }
      */
    ]
  },
  {
    id: "dior-ad",
    featured: true,
    title: "Dior Sauvage — AI Ad",
    eyebrow: "Spec ad · AI video",
    year: "2026",
    summary: "A cinematic spec-ad exploration focused on atmosphere, pacing and premium product storytelling through generative video.",
    tags: ["Spec ad", "AI video", "Visual direction", "Motion"],
    visual: { type: "art", art: "dior" },
    floaters: [
      { kicker: "TYPE", value: "Spec Ad" },
      { kicker: "MOOD", value: "Cinematic" }
    ],
    actions: [
      /* Add when the MP4 is ready:
      { kind: "view", label: "Play video", viewer: { type: "video", src: "assets/videos/dior-sauvage.mp4", poster: "assets/dior-poster.jpg" } }
      */
    ]
  },

  // ----------------------- MORE WORK -----------------------
  {
    id: "zenme",
    featured: false,
    title: "ZenMe",
    eyebrow: "Mental health · Mobile UI/UX",
    year: "Selected work",
    summary: "A calmer mobile mental-health experience designed to make support feel approachable and easy to navigate.",
    tags: ["Mobile UI", "Wellness", "UX", "Prototype"],
    visual: { type: "image", src: "assets/zenme.png", position: "center top" },
    floaters: [{ kicker: "FORMAT", value: "Mobile" }],
    actions: [
      { kind: "figma", label: "Figma", href: "https://www.figma.com/design/uFBS1scokRbs0GvP0KXtuU/ZenMe-Mental-Health-App?m=auto&t=pGfZkcsrhDtwHbOk-6" }
    ]
  },
  {
    id: "fasco",
    featured: false,
    title: "Fasco",
    eyebrow: "Web design exploration",
    year: "Selected work",
    summary: "A visual web-design exploration focused on premium composition, typography and product presentation.",
    tags: ["Web design", "Visual UI", "Art direction"],
    visual: { type: "art", art: "fasco" },
    floaters: [{ kicker: "FORMAT", value: "Web" }],
    actions: []
  },
  {
    id: "logos",
    featured: false,
    title: "Logo Works",
    eyebrow: "Identity explorations",
    year: "Ongoing",
    summary: "A collection of identity and mark explorations across product, brand and experimental briefs.",
    tags: ["Logo", "Identity", "Typography"],
    visual: { type: "art", art: "logos" },
    floaters: [{ kicker: "COLLECTION", value: "Identity" }],
    actions: []
  },
  {
    id: "fitagotchi",
    featured: false,
    title: "Fitagotchi",
    eyebrow: "Playful fitness product",
    year: "In progress",
    summary: "A character-led fitness concept where progress feels more like caring for something than filling another dashboard.",
    tags: ["Product concept", "Gamification", "Mobile", "Motion"],
    visual: { type: "art", art: "fitagotchi" },
    floaters: [{ kicker: "STATUS", value: "In progress" }],
    actions: []
  },
  {
    id: "nippon",
    featured: false,
    title: "NIPPON",
    eyebrow: "Graphic design · Poster series",
    year: "2026",
    summary: "A visual tribute to Japanese heritage through bold typography, poster composition and graphic experimentation.",
    tags: ["Poster design", "Graphic design", "Typography"],
    visual: { type: "art", art: "nippon" },
    floaters: [{ kicker: "SERIES", value: "Posters" }],
    actions: [
      { kind: "behance", label: "Behance", href: "https://www.behance.net/vijvalanand" }
    ]
  },
  {
    id: "more-ads",
    featured: false,
    title: "More AI Ads",
    eyebrow: "Motion experiments",
    year: "Ongoing",
    summary: "A growing collection of short-form generative ads exploring product storytelling, pacing and art direction.",
    tags: ["AI video", "Motion", "Creative direction"],
    visual: { type: "art", art: "ads" },
    floaters: [{ kicker: "COLLECTION", value: "Motion" }],
    actions: []
  }
];
