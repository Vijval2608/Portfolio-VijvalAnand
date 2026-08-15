V94 Caveat font support

The Skills notes use Caveat everywhere (headings + body text).

The page already loads Caveat from Google Fonts as an immediate web-font fallback.
For a self-hosted copy, add ONE of these files under assets/fonts/:

  Caveat-VariableFont_wght.ttf   (preferred variable font)
  Caveat.ttf
  Caveat.otf

The CSS checks the filenames above in that order.
Do not change the CSS font-family name; the site uses CaveatLocal -> Caveat -> cursive fallback order.
