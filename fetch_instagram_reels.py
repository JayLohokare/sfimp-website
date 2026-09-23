#!/usr/bin/env python3
"""
Fetch Instagram reels using Playwright headless browser.

Instagram blocks all simple scraping (no RSS, no public API, empty HTML shells).
This script uses Playwright to render the page like a real browser and extract
reel shortcodes from the DOM.

In GitHub Actions: playwright install chromium is run before this script.
Locally: requires `pip install playwright && playwright install chromium`.
"""

import json
import os
import re
import sys

USERNAME = 'sfindianmusicproject'
OUTPUT_FILE = 'instagram_reels.js'
NUM_REELS = 6

def load_existing_reels():
    if not os.path.exists(OUTPUT_FILE):
        return []
    try:
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        json_str = content.split('const instagramReels = ', 1)[1].rstrip().rstrip(';')
        return json.loads(json_str)
    except Exception:
        return []

def save_reels(reels):
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(f'const instagramReels = {json.dumps(reels, indent=2, ensure_ascii=False)};\n')

def fetch_reels_playwright():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("⚠️ Playwright not installed, skipping browser-based fetch.")
        return None

    reels = []
    seen = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        )
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 800},
        )
        page = context.new_page()

        try:
            print(f"🔄 Loading Instagram reels page for @{USERNAME}...")
            page.goto(f'https://www.instagram.com/{USERNAME}/reels/', timeout=30000, wait_until='domcontentloaded')

            # Wait for content to render
            page.wait_for_timeout(5000)

            # Try to dismiss login popup if it appears
            try:
                # Instagram often shows "Log in to see more" - close it
                close_btn = page.locator('button:has-text("Not Now"), button:has-text("Close"), [aria-label="Close"]').first
                if close_btn.is_visible(timeout=2000):
                    close_btn.click()
                    page.wait_for_timeout(1000)
            except Exception:
                pass

            # Scroll down to load more reels
            for _ in range(5):
                page.evaluate('window.scrollBy(0, 600)')
                page.wait_for_timeout(1500)

            # Extract reel links from the rendered DOM
            links = page.evaluate('''() => {
                const reelLinks = [];
                // Find all anchor tags that link to reels
                const anchors = document.querySelectorAll('a[href*="/reel/"], a[href*="/reels/"]');
                anchors.forEach(a => {
                    reelLinks.push({
                        href: a.href,
                        text: (a.textContent || '').trim().substring(0, 150)
                    });
                });
                return reelLinks;
            }''')

            for link in links:
                match = re.search(r'/reel/([A-Za-z0-9_-]+)', link['href'])
                if match:
                    shortcode = match.group(1)
                    if shortcode not in seen and len(shortcode) >= 6:
                        seen.add(shortcode)
                        reels.append({
                            'id': shortcode,
                            'url': f'https://www.instagram.com/reel/{shortcode}/',
                            'thumbnail': f'https://www.instagram.com/p/{shortcode}/media/?size=l',
                            'title': link['text'] or f'Instagram Reel',
                        })
                if len(reels) >= NUM_REELS:
                    break

            print(f"  Found {len(reels)} reels from Playwright")

        except Exception as e:
            print(f"  ⚠️ Playwright error: {e}")
        finally:
            browser.close()

    return reels if reels else None


def fetch_reels_fallback():
    """Fallback: try scraping the HTML (works rarely but worth trying)."""
    import urllib.request

    url = f'https://www.instagram.com/{USERNAME}/reels/'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    req = urllib.request.Request(url, headers=headers)
    response = urllib.request.urlopen(req, timeout=15)
    html = response.read().decode('utf-8', errors='ignore')

    reels = []
    seen = set()

    for pattern in [r'/reel/([A-Za-z0-9_-]+)', r'"shortcode":"([A-Za-z0-9_-]+)"']:
        for match in re.finditer(pattern, html):
            sc = match.group(1)
            if len(sc) >= 8 and sc not in seen:
                seen.add(sc)
                reels.append({
                    'id': sc,
                    'url': f'https://www.instagram.com/reel/{sc}/',
                    'thumbnail': f'https://www.instagram.com/p/{sc}/media/?size=l',
                    'title': '',
                })
            if len(reels) >= NUM_REELS:
                break

    return reels if reels else None


def main():
    # Try Playwright first (most reliable)
    reels = None

    if os.environ.get('GITHUB_ACTIONS') or os.environ.get('PLAYWRIGHT_AVAILABLE'):
        print("🔄 Attempting Playwright fetch (CI environment)...")
        reels = fetch_reels_playwright()

    # Fallback to HTML scraping
    if not reels:
        print("🔄 Attempting HTML scraping fallback...")
        try:
            reels = fetch_reels_fallback()
            if reels:
                print(f"✅ HTML scraping found {len(reels)} reels")
        except Exception as e:
            print(f"⚠️ HTML scraping failed: {e}")

    if reels:
        existing = load_existing_reels()
        new_ids = {r['id'] for r in reels}
        merged = reels + [r for r in existing if r['id'] not in new_ids]
        save_reels(merged[:NUM_REELS])
        print(f"✅ instagram_reels.js updated with {len(reels)} reels ({len(merged[:NUM_REELS])} total).")
    else:
        existing = load_existing_reels()
        if existing:
            print(f"⚠️ Instagram fetch failed. Keeping {len(existing)} existing reels.")
        else:
            fallback = [{
                'id': 'profile-link',
                'url': f'https://www.instagram.com/{USERNAME}/reels/',
                'title': f'Follow @{USERNAME} on Instagram for reels!',
                'thumbnail': '',
            }]
            save_reels(fallback)
            print(f"⚠️ No reels found. Created fallback profile link.")


if __name__ == '__main__':
    main()