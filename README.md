# Galápagos Tracker

A mobile-first static site for tracking animal sightings on a Galápagos trip.
Tap a tile to mark a species sighted (saved in `localStorage`), drag the
right-edge index to jump alphabetically, watch the tally fill in. Works
offline once loaded (service worker precache).

## Status: images not yet downloaded

Everything is built and tested — the grid, tap-to-toggle with persistence,
tally/progress bar, draggable A–Z index, and offline caching all work (see
`sw.js`, `index.html`). What's missing is the one thing this build
environment could not do: **download the 100 species photos**. Outbound
network access here is restricted by an organization egress policy to a
small allowlist (npm, PyPI, GitHub, the Anthropic API); `en.wikipedia.org`
and `upload.wikimedia.org` are both blocked, for API calls and for image
downloads alike, so no photo could be fetched or committed from this
session.

Every tile currently falls back to its graceful placeholder (a colored
square with the species' first letter) via the `<img>` `onerror` handler in
`index.html` — the site is fully functional, just without real photos yet.

### Finishing it: run the fetch script

From any machine/environment that *can* reach `en.wikipedia.org`:

```bash
python3 scripts/fetch_images.py
```

This reads `data/species.tsv` (name, Wikipedia slug, output filename — one
row per species) and for each one:

1. Calls `GET https://en.wikipedia.org/api/rest_v1/page/summary/<slug>`
2. Takes `thumbnail.source`, bumping any `/NNNpx-` in the URL to `/400px-`
   (falls back to `originalimage.source` if there's no thumbnail)
3. Saves the image to `images/<slug>.jpg`

It skips files that already exist, so it's safe to re-run, and it prints a
summary of any species it couldn't find an image for at the end (no
network calls needed to add those by hand afterward — the standard library
`urllib` script has no other dependencies).

Once `images/` is populated, commit and push it — no changes to
`index.html` are needed, since it already references `images/<slug>.jpg`
for every species.

## Deployment

Push to `main` and enable **Settings → Pages → Source: Deploy from a
branch → main → / (root)**. The site will be live at
`https://laghia.github.io/galapagos-tracker/`.
