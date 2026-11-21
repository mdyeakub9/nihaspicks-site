# nihaspicks.com

Static affiliate site (no build step).

## Deploy on Coolify
1. New Resource → Public/Private Repository → this repo, branch `main`.
2. Build Pack: **Dockerfile** (uses `Dockerfile` + `nginx.conf` in the root).
3. Domains: `https://nihaspicks.com,https://www.nihaspicks.com` → Deploy. SSL is automatic.

## Configure
- Meta Pixel: set `META_PIXEL_ID` at the top of `assets/main.js`.
- Contact email: `contact@nihaspicks.com` (used on legal pages) — create this mailbox or forwarder.

## Pages
- `/` home · `/stem-gift/` Curiosity Box lander · `/privacy/` `/terms/` `/disclosure/` `/contact/`

## Tracking
Affiliate links have `data-aff`. `main.js` adds `s1` (utm_source / fb), `s2` (utm_content = ad name), `s3` (button position) — visible in MaxBounty reports by sub-ID.
In Meta ads, set URL parameters: `utm_source=fb&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`
