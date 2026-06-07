import urllib.request
import xml.etree.ElementTree as ET
import json
import time
import os

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
        # Extract JSON array between "const youtubeVideos = " and ";\n"
        json_str = content.split('const youtubeVideos = ', 1)[1].rstrip().rstrip(';')
        return json.loads(json_str)
    except Exception:
        return []

def save_videos(videos):
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(f'const youtubeVideos = {json.dumps(videos, indent=2, ensure_ascii=False)};\n')

def fetch_videos():
    rss_url = f'https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}'
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            req = urllib.request.Request(rss_url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
            })
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
        except Exception as e:
            print(f"⚠️ Attempt {attempt}/{MAX_RETRIES} failed: {e}")
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
        print(f"⚠️ YouTube fetch failed after {MAX_RETRIES} retries. Keeping {len(existing)} existing videos.")
    else:
        print(f"❌ YouTube fetch failed and no existing video data found.")