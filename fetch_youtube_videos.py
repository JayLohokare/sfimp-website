import urllib.request
import xml.etree.ElementTree as ET
import json
import time
import os
import re

CHANNEL_ID = 'UCPfOZK-GfS92UG4yaFJszNA' # SFIMP Channel ID
OUTPUT_FILE = 'youtube_videos.js'
MAX_RETRIES = 3
RETRY_DELAY_S = 5
NUM_VIDEOS = 6

def load_existing_videos():
    """Load the current youtube_videos.js so we can merge with newer ones."""
    if not os.path.exists(OUTPUT_FILE):
        return []
    try:
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        json_str = content.split('const youtubeVideos = ', 1)[1].rstrip().rstrip(';')
        return json.loads(json_str)
    except Exception:
        return []

def save_videos(videos):
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(f'const youtubeVideos = {json.dumps(videos, indent=2, ensure_ascii=False)};\n')

def fetch_via_rss(channel_id):
    """Strategy 1: YouTube RSS feed (works from residential IPs, often blocked from CI)."""
    rss_url = f'https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    req = urllib.request.Request(rss_url, headers=headers)
    response = urllib.request.urlopen(req, timeout=15)
    xml_data = response.read()

    root = ET.fromstring(xml_data)
    ns = {'atom': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015'}

    videos = []
    for entry in root.findall('atom:entry', ns):
        video_id = entry.find('yt:videoId', ns).text
        title = entry.find('atom:title', ns).text
        videos.append({'id': video_id, 'title': title})
        if len(videos) >= NUM_VIDEOS:
            break
    return videos

INVIDIOUS_INSTANCES = [
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://iv.datura.network',
    'https://invidious.jing.rocks',
    'https://yewtu.be',
    'https://vid.puffyan.us',
    'https://invidious.lunar.icu',
]

def fetch_via_invidious(channel_id):
    """Strategy 2: Invidious API (open-source YouTube frontend with public API)."""
    for instance in INVIDIOUS_INSTANCES:
        try:
            url = f'{instance}/api/v1/channels/{channel_id}/videos?sort_by=newest'
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json',
            })
            response = urllib.request.urlopen(req, timeout=10)
            data = json.loads(response.read())
            videos = []
            for vid in data.get('videos', [])[:NUM_VIDEOS]:
                videos.append({
                    'id': vid.get('videoId', vid.get('videoID', '')),
                    'title': vid.get('title', ''),
                })
            if videos:
                print(f"  ✅ Invidious instance {instance} worked")
                return videos
        except Exception as e:
            print(f"  ⚠️ Invidious {instance} failed: {e}")
            continue
    return None

def fetch_via_scrape(channel_id):
    """Strategy 3: Scrape the YouTube channel page for video IDs."""
    url = f'https://www.youtube.com/channel/{channel_id}'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    req = urllib.request.Request(url, headers=headers)
    response = urllib.request.urlopen(req, timeout=15)
    html = response.read().decode('utf-8', errors='ignore')

    # Extract video IDs from the page source (appears in initial data JSON)
    video_ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
    # Extract titles paired with those video IDs
    # The JSON structure has videoId and title close together
    title_map = {}
    for match in re.finditer(r'"videoId":"([a-zA-Z0-9_-]{11})".*?"title":\{"runs":\[\{"text":"(.*?)"\}\]', html):
        vid_id, title = match.group(1), match.group(2)
        title_map[vid_id] = title.replace('\\"', '"').replace('\\u0026', '&')

    videos = []
    seen = set()
    for vid_id in video_ids:
        if vid_id in seen:
            continue
        seen.add(vid_id)
        title = title_map.get(vid_id, f'Video {vid_id}')
        videos.append({'id': vid_id, 'title': title})
        if len(videos) >= NUM_VIDEOS:
            break
    return videos if videos else None

def fetch_videos():
    """Try multiple strategies to fetch YouTube videos."""
    strategies = [
        ('YouTube RSS', fetch_via_rss),
        ('Invidious API', lambda cid: fetch_via_invidious(cid)),
        ('YouTube scrape', fetch_via_scrape),
    ]

    for name, strategy in strategies:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                print(f"🔄 Trying {name} (attempt {attempt}/{MAX_RETRIES})...")
                videos = strategy(CHANNEL_ID)
                if videos:
                    print(f"✅ {name} returned {len(videos)} videos")
                    return videos
            except Exception as e:
                print(f"⚠️ {name} attempt {attempt}/{MAX_RETRIES} failed: {e}")
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY_S)

    return None

# Main
fetched = fetch_videos()

if fetched is not None:
    # Merge: new videos first, then keep any existing ones not already in the new list
    existing = load_existing_videos()
    new_ids = {v['id'] for v in fetched}
    merged = fetched + [v for v in existing if v['id'] not in new_ids]
    save_videos(merged[:NUM_VIDEOS])
    print(f"✅ youtube_videos.js updated with {len(fetched)} new videos ({len(merged[:NUM_VIDEOS])} total).")
else:
    existing = load_existing_videos()
    if existing:
        print(f"⚠️ YouTube fetch failed after all strategies. Keeping {len(existing)} existing videos.")
    else:
        print(f"❌ YouTube fetch failed and no existing video data found.")