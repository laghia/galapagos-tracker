# Galápagos Tracker

A mobile-first static site for tracking animal sightings on a Galápagos trip.
Tap a tile to mark a species sighted (saved in `localStorage`), drag the
right-edge index to jump alphabetically, watch the tally fill in. Works
offline once a tile's photo has been viewed at least once (service worker
runtime cache).

## Status: photos are hotlinked from Wikipedia, not yet downloaded

The grid, tap-to-toggle with persistence, tally/progress bar, draggable A–Z
index, and offline caching are all built and tested.

Photos are currently resolved **live, in the visitor's browser**, from
Wikipedia's REST API — `index.html` calls
`GET https://en.wikipedia.org/api/rest_v1/page/summary/<slug>` the first
time each tile scrolls into view, takes `thumbnail.source` (bumped to
`/400px-`, falling back to `originalimage.source`), and sets it as the
tile's `<img src>`. Resolved URLs are cached in `localStorage`
(`galapagos-thumb-urls-v1`) so repeat visits don't refetch, and the service
worker opportunistically caches each image once it's loaded so it's
available offline afterward. A species with no Wikipedia image, or one that
fails to resolve, falls back to a graceful placeholder (a colored square
with its first letter).

This is a stopgap: this build environment's egress policy blocks
`en.wikipedia.org` and `upload.wikimedia.org` entirely (confirmed via
direct requests), so photos couldn't be downloaded and committed into the
repo from here. **Downloaded, locally-hosted photos are the better version
of this app** — they load instantly with no per-tile API round-trip, and
they're reliably available offline from the very first visit rather than
only after each tile has been viewed online at least once.

### Switching to downloaded local photos

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
summary of any species it couldn't find an image for at the end (the
standard library `urllib` script has no other dependencies to install).

Once `images/` is populated, swap `index.html`'s tile image source back to
the local file (`images/<slug>.jpg`, replacing the runtime `fetch()` calls
in `loadThumbnail`), restore the local file list to `sw.js`'s `ASSETS`
precache array, commit, and push — or ask Claude to do that swap once the
images are in the repo.

## Deployment

Push to `main` and enable **Settings → Pages → Source: Deploy from a
branch → main → / (root)**. The site will be live at
`https://laghia.github.io/galapagos-tracker/`.
