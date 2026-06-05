# MahaPoojan — Project Checklist

Track what's done and what's left for a production-ready site.

---

## Completed fixes

- [x] Renamed `good.html` → `bhajans.html`
- [x] Renamed `puja booking.html` → `puja-booking.html`
- [x] Renamed `Horoscope.html` → `horoscope.html` (Linux-safe lowercase)
- [x] Organized images under `assets/images/` with clean filenames
- [x] Added shared CSS (`assets/css/shared.css`) for logo + mobile menu
- [x] Added shared JS (`assets/js/shared.js`) for hamburger navigation
- [x] Cleaned `temples.html` — removed base64 blobs, external hotlinks
- [x] Extracted temple data to `assets/js/temples-data.js`
- [x] Unified "Book Puja" CTAs → `puja-booking.html`
- [x] Fixed `horoscope.html` link case mismatches across footers
- [x] Standardized logo size (56px via `.logo-img`)
- [x] Removed copied AppsForBharat / Sri Mandir branding from footers
- [x] Replaced misleading certification badges with honest demo labels
- [x] Fixed broken duplicate `</a>` in `about.html` nav
- [x] Added `README.md` with structure and run instructions

---

## High priority — do next

- [ ] **Extract shared nav/footer HTML** into a build step or server includes (still duplicated in 12 files)
- [ ] **Extract shared CSS variables** from each page into one `main.css` (large refactor)
- [ ] **Wire real puja booking** — form POST to backend or Formspay/Netlify Forms
- [ ] **Integrate Razorpay** (test mode) on `puja-booking.html` and `puja.html` modal
- [ ] **Add SEO** — meta description, Open Graph, favicon per page
- [ ] **Accessibility pass** — skip links, focus traps in modals, aria labels on forms
- [ ] **Remove or relocate** root-level WhatsApp JPEG originals (now copied to `assets/images/`)

---

## Medium priority — product features

- [ ] **Panchang API** — Prokerala, Drik Panchang, or custom calculation service
- [ ] **Horoscope API** — real daily predictions by sign
- [ ] **Live darshan** — embed YouTube/live streams from partner temples
- [ ] **Library audio** — host MP3s or embed YouTube; connect player to real sources
- [ ] **User accounts** — login, booking history, "My Bookings" on `puja.html`
- [ ] **Email notifications** — booking confirmation via SendGrid/Resend
- [ ] **Expand temple catalog** — align count with "100+" marketing or adjust copy
- [ ] **Expand puja catalog** — add remaining pujas or fix sidebar counts (shows 24, has 6)

---

## Low priority — polish

- [ ] Add hamburger animation and slide-in transition polish
- [ ] Lazy-load images below the fold
- [ ] Compress JPEGs in `assets/images/` (several are 200KB+)
- [ ] Add `404.html` and custom error page
- [ ] Deploy to Netlify/Vercel/GitHub Pages with CI
- [ ] Add Playwright smoke tests for nav links
- [ ] Hindi / regional language toggle
- [ ] Dark mode toggle (darshan page already dark)

---

## Architecture options (pick one)

| Approach | Pros | Cons |
|----------|------|------|
| **Stay static** | Simple hosting, fast | Hard to maintain 12 HTML files |
| **Eleventy / Astro** | Components, still static | Requires build step |
| **Next.js / React** | Full app, APIs easy | Heavier stack |
| **WordPress + theme** | Non-dev editable | Less custom design control |

---

## File map

| Page | Purpose | Backend needed? |
|------|---------|-----------------|
| `index.html` | Marketing home | No |
| `puja.html` | Browse pujas | Yes for booking |
| `puja-booking.html` | Book puja form | Yes |
| `temples.html` | Temple directory | Optional CMS |
| `darshan.html` | Live streams | Video CDN |
| `chadhava.html` | Offerings shop | Payment |
| `panchang.html` | Daily calendar | Panchang API |
| `horoscope.html` | Astrology | Horoscope API |
| `library.html` | Media library | Audio/video hosting |
| `bhajans.html` | Bhajans & store | E-commerce |
| `about.html` | Company info | No |
| `legal.html` | Legal & support | No |

---

*Last updated: June 2026*
