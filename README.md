# GFit

Website of GFit, the strength and running coaching practice of Gad Fenesh (גד פנש). Live at [gfit.energy](https://gfit.energy/).

The site is in Hebrew (right to left). Static HTML, CSS and JavaScript, no build step.

## Layout

- `index.html`: the single page, with SEO meta tags and schema.org JSON-LD.
- `styles.css`, `script.js`: styling and behavior (mobile action bar, scroll reveal, goal chips, contact form, GoatCounter event tracking).
- `images/`: photos, logo, and client before/after photos and WhatsApp messages (`result-*.jpg`, `msg-*.jpg`).
- `llms.txt`, `robots.txt`, `sitemap.xml`: files for search engines and AI crawlers.
- `CNAME`: the custom domain, `gfit.energy`.

The contact form posts to Web3Forms, which sends the message by email.

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Every push to `main` deploys the repo root to GitHub Pages through `.github/workflows/deploy.yml`.
