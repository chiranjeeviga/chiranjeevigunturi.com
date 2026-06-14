# Portfolio site — chiranjeevigunturi.com

Static, dependency-free portfolio for Chiranjeevi Gunturi. Hand-built HTML/CSS/JS — no build step. Content is the rendered form of the wiki layer (`../wiki/`).

## Files
- `index.html` — the single-page site (semantic sections: hero, proof, offers, products, about, contact).
- `styles.css` — design system (OKLCH warm-paper palette, Bricolage Grotesque + Spectral, editorial layout).
- `app.js` — progressive enhancement (reveal-on-scroll, sticky header, mobile nav).
- `favicon.svg`, `CNAME` (for the custom domain).

## Preview locally
```bash
cd site
python3 -m http.server 8080   # then open http://localhost:8080
```

## Deploy (any static host)
- **Vercel / Netlify:** point at this `site/` folder, no build command, output dir = `.`.
- **GitHub Pages:** serve from `site/`; `CNAME` already set to `chiranjeevigunturi.com`. Add the matching DNS records at your registrar.

## Edit cheatsheet
- Headline / copy → `index.html`. Colors / type / spacing → tokens at the top of `styles.css`.
- Swap the "Email me" / "Connect on LinkedIn" CTAs in the contact section (and the LinkedIn handle) once confirmed.
