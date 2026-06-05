#!/usr/bin/env python3
"""Batch-fix MahaPoojan HTML pages: links, assets, branding."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent

REPLACEMENTS = [
    ("puja booking.html", "puja-booking.html"),
    ("Horoscope.html", "horoscope.html"),
    ("good.html", "bhajans.html"),
    ('WhatsApp Image 2026-06-04 at 11.55.34.jpeg', "assets/images/logo.jpeg"),
    ('WhatsApp%20Image%202026-06-04%20at%2011.55.34.jpeg', "assets/images/logo.jpeg"),
    ('href="puja.html" class="nav-cta"', 'href="puja-booking.html" class="nav-cta"'),
    ("Firstprinciple AppsForBharat Pvt. Ltd., Bengaluru", "MahaPoojan Devotional Services, India"),
    ("Firstprinciple AppsForBharat Pvt. Ltd., 4th Floor, Tower B, RMZ Ecoworld, Bengaluru – 560103, India", "MahaPoojan Devotional Services · Bengaluru, India"),
    ("© 2026 MahaPoojan · AppsForBharat", "© 2026 MahaPoojan"),
    ("© 2026 MahaPoojan · AppsForBharat · All Rights Reserved", "© 2026 MahaPoojan · All Rights Reserved"),
    ('id="com.mandir"', 'href="#" onclick="return false;" data-demo-app'),
    ("sri-mandir-your-own-temple/id1637621461", "#"),
    ('style="height: 100px; width: auto;"', 'class="logo-img"'),
    ('style="height: 70px; width: auto;"', 'class="logo-img"'),
    ('<a href="puja.html">Bhajans & Aartis</a>', '<a href="bhajans.html">Bhajans & Aartis</a>'),
    ('<a href="good.html">Bhajans & Aartis</a>', '<a href="bhajans.html">Bhajans & Aartis</a>'),
    ('<a href="good.html">Fasts & Festivals</a>', '<a href="bhajans.html">Fasts & Festivals</a>'),
    ('<a href="good.html">MahaPoojan Store</a>', '<a href="bhajans.html">MahaPoojan Store</a>'),
    ('<a href="good.html">Store</a>', '<a href="bhajans.html">Store</a>'),
    ('href="puja.html" class="btn-book"', 'href="puja-booking.html" class="btn-book"'),
    ("window.location.href = 'puja.html'", "window.location.href = 'puja-booking.html'"),
    ('<span class="cert-badge">ISO 27001</span>', '<span class="cert-badge">Secure Checkout</span>'),
    ('<span class="cert-badge">Digital India</span>', '<span class="cert-badge">Temple Verified</span>'),
    ('<span class="cert-badge">Razorpay Secured</span>', '<span class="cert-badge">Demo Mode</span>'),
    ('<div class="dl-trust-num">ISO</div>\n      <div class="dl-trust-label">27001 Certified</div>', '<div class="dl-trust-num">🔒</div>\n      <div class="dl-trust-label">Secure Platform</div>'),
]

SHARED_CSS = '<link rel="stylesheet" href="assets/css/shared.css"/>'
SHARED_JS = '<script src="assets/js/shared.js"></script>'

LOGO_ALT_FIX = re.compile(
    r'<img([^>]*?)src="assets/images/logo\.jpeg"([^>]*?)alt="[^"]*"([^>]*)>',
    re.I,
)


def inject_shared_assets(html: str) -> str:
    if "assets/css/shared.css" not in html and "</head>" in html:
        html = html.replace("</head>", f"  {SHARED_CSS}\n</head>", 1)
    if "assets/js/shared.js" not in html and "</body>" in html:
        html = html.replace("</body>", f"  {SHARED_JS}\n</body>", 1)
    return html


def fix_logo_imgs(html: str) -> str:
    html = LOGO_ALT_FIX.sub(r'<img\1src="assets/images/logo.jpeg"\2alt="MahaPoojan"\3>', html)
    return html


def fix_about_nav(html: str) -> str:
    # Remove duplicate closing </a> in about.html nav
    html = html.replace(
        """<a href="index.html" class="nav-logo" aria-label="MahaPoojan Home">
    <img class="logo-img" src="assets/images/logo.jpeg" alt="MahaPoojan Logo" class="logo-img">
</a>
  </a>""",
        """<a href="index.html" class="nav-logo" aria-label="MahaPoojan Home">
    <img class="logo-img" src="assets/images/logo.jpeg" alt="MahaPoojan">
  </a>""",
    )
    html = re.sub(r'class="logo-img"([^>]*?)class="logo-img"', r'class="logo-img"\1', html)
    return html


def process_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    text = inject_shared_assets(text)
    text = fix_logo_imgs(text)
    if path.name == "about.html":
        text = fix_about_nav(text)
    if path.name == "darshan.html" and 'class="dark-nav"' not in text:
        text = text.replace("<body>", '<body class="dark-nav">', 1)
    if path.name == "index.html":
        text = text.replace(
            '<a href="#" class="btn-primary">Participate in this Puja →</a>',
            '<a href="puja-booking.html" class="btn-primary">Participate in this Puja →</a>',
        )
        text = text.replace(
            '<a href="#" class="btn-primary" style="background: var(--gold); color: var(--ink-mid);">\n        Download the App →\n      </a>',
            '<a href="puja-booking.html" class="btn-primary" style="background: var(--gold); color: var(--ink-mid);">\n        Book a Puja →\n      </a>',
        )
        # Fix broken app store links
        text = re.sub(
            r'href="https://play\.google\.com/store/apps/details\?href="#" onclick="return false;" data-demo-app"',
            'href="#" onclick="return false;" aria-disabled="true"',
            text,
        )
    path.write_text(text, encoding="utf-8")
    print(f"Updated {path.name}")


def rewrite_temples_html() -> None:
    path = ROOT / "temples.html"
    text = path.read_text(encoding="utf-8")

    # Char dham images
    text = text.replace(
        'src="WhatsApp%20Image%202026-06-04%20at%2015.40.23(1).jpeg"',
        'src="assets/images/badrinath.jpeg"',
    )
    text = text.replace(
        'src="WhatsApp%20Image%202026-06-04%20at%2015.41.15.jpeg"',
        'src="assets/images/dwarka.jpeg"',
    )
    text = text.replace(
        'src="WhatsApp%20Image%202026-06-04%20at%2015.42.28.jpeg"',
        'src="assets/images/puri.jpeg"',
    )
    text = text.replace(
        'src="WhatsApp Image 2026-06-04 at 15.47.15.jpeg"',
        'src="assets/images/rameshwaram.jpeg"',
    )
    text = text.replace(
        'src="WhatsApp Image 2026-06-04 at 15.48.51.jpeg"',
        'src="assets/images/jyotirlinga-default.jpeg"',
    )
    text = text.replace(
        'src="WhatsApp Image 2026-06-04 at 16.06.39.jpeg"',
        'src="assets/images/maharashtra-temple.jpeg"',
    )
    text = text.replace(
        'src="WhatsApp Image 2026-06-04 at 16.09.05.jpeg"',
        'src="assets/images/vaidyanath.jpeg"',
    )
    text = text.replace(
        'src="WhatsApp Image 2026-06-04 at 15.59.37.jpeg"',
        'src="assets/images/grishneshwar.jpeg"',
    )
    text = re.sub(
        r'https://www\.daiwikhotels\.com/wp-content/uploads/2024/07/kashi-viswanath-temple-cvr-2\.jpg',
        'assets/images/kashi.jpeg',
        text,
    )
    text = re.sub(
        r'https://www\.trawell\.in/admin/images/upload/900551700Dwarka_Nageshwar_Temple_main\.jpg',
        'assets/images/dwarka.jpeg',
        text,
    )
    # Remove duplicate alt on kashi jl card
    text = text.replace('alt="Kashi Vishwanath Temple" alt="Kashi Vishwanath"', 'alt="Kashi Vishwanath"')

    # Replace inline temples array with external script
    text = re.sub(
        r"<script>\s*const temples = \[.*?\];\s*\n\s*let currentType",
        '<script src="assets/js/temples-data.js"></script>\n<script>\nlet currentType',
        text,
        count=1,
        flags=re.S,
    )

    text = text.replace('href="puja.html" class="btn-book"', 'href="puja-booking.html" class="btn-book"')
    text = text.replace(
        '<span class="results-count" id="resultsCount">Showing all temples</span>',
        '<span class="results-count" id="resultsCount">Showing partner temples</span>',
    )

    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    text = inject_shared_assets(text)
    text = fix_logo_imgs(text)
    path.write_text(text, encoding="utf-8")
    print("Rewrote temples.html")


if __name__ == "__main__":
    for html in sorted(ROOT.glob("*.html")):
        if html.name == "temples.html":
            rewrite_temples_html()
        else:
            process_file(html)
