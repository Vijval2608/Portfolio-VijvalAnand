# Production protection notes — v282

This is a public browser application. Browser-delivered HTML/CSS/JavaScript can
never be made impossible to inspect or extract. The protections in this build
are defense-in-depth: legal ownership notices, anti-framing headers, a strict
Content Security Policy, crawler opt-outs, private in-memory Pong score state,
and optional server-side verification of completed Pong wins.

## Required for verified Pong wins on Netlify

Set a Netlify environment variable named `PONG_VERIFY_SECRET` to a long random
secret (at least 32 characters). Do not commit the secret into this ZIP or any
public repository. Then deploy with Netlify Functions enabled.

When configured, a legitimate player win is checked server-side against match
telemetry and receives a short signed `VERIFIED` proof code inside the CRT win
screen. Editing the visible canvas/DOM score alone will not produce a valid
proof code. The verifier endpoint can also validate a proof code with:

`/api/pong-verify?proof=<CODE>`

The game remains playable if the function or secret is unavailable, but no
server-signed verification code will be issued.
