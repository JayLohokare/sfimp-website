import urllib.request
import xml.etree.ElementTree as ET
import json
import time
import os
import re

CHANNEL_ID = 'UCPfOZK-GfS92UG4yaFJszNA' # SFIMP Channel ID
HANDLE = '@sfindianmusicproject'
VIDEOS_FILE = 'youtube_videos.js'
SHORTS_FILE = 'youtube_shorts.js'
NUM_VIDEOS = 6
NUM_SHORTS = 6
MAX_RETRIES = 3
RETRY_DELAY_S = 3

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}

def load_existing(filename, var_name):
    if not os.path.exists(filename):
        return []
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        json_str = content.split(f'const {var_name} = ', 1)[1].rstrip().rstrip(';')
        return json.loads(json_str)
    except Exception:
        return []

def save_data(filename, var_name, data):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(f'const {var_name} = {json.dumps(data, indent=2, ensure_ascii=False)};\n')

def extract_yt_initial_data(url):
    req = urllib.request.Request(url, headers=HEADERS)
    response = urllib.request.urlopen(req, timeout=15)
    html = response.read().decode('utf-8', errors='ignore')
    idx = html.find('var ytInitialData = ')
    if idx != -1:
        end = html.find(';</script>', idx)
        if end != -1:
            return json.loads(html[idx + len('var ytInitialData = '):end])
    return None

def fetch_shorts():
    """Fetch latest YouTube Shorts from channel /shorts tab."""
    print("🔄 Fetching latest YouTube Shorts...")
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            url = f'https://www.youtube.com/{HANDLE}/shorts'
            data = extract_yt_initial_data(url)
            if not data:
                continue
            tabs = data.get('contents', {}).get('twoColumnBrowseResultsRenderer', {}).get('tabs', [])
            shorts = []
            for t in tabs:
                if t.get('tabRenderer', {}).get('title') == 'Shorts':
                    rg = t['tabRenderer']['content']['richGridRenderer']['contents']
                    for item in rg:
                        slvm = item.get('richItemRenderer', {}).get('content', {}).get('shortsLockupViewModel', {})
                        if slvm:
                            vid_id = slvm.get('entityId', '').replace('shorts-shelf-item-', '')
                            title = slvm.get('overlayMetadata', {}).get('primaryText', {}).get('content', '')
                            if vid_id and title:
                                shorts.append({'id': vid_id, 'title': title})
                            if len(shorts) >= NUM_SHORTS:
                                break
                    break
            if shorts:
                print(f"✅ Fetched {len(shorts)} YouTube Shorts")
                return shorts
        except Exception as e:
            print(f"⚠️ Shorts attempt {attempt} failed: {e}")
            time.sleep(RETRY_DELAY_S)
    return None

def fetch_videos_via_yt_data():
    """Extract regular videos from /videos tab using ytInitialData."""
    url = f'https://www.youtube.com/{HANDLE}/videos'
    data = extract_yt_initial_data(url)
    if not data:
        return None
    tabs = data.get('contents', {}).get('twoColumnBrowseResultsRenderer', {}).get('tabs', [])
    videos = []
    for t in tabs:
        if t.get('tabRenderer', {}).get('title') == 'Videos':
            rg = t['tabRenderer']['content']['richGridRenderer']['contents']
            for item in rg:
                lvm = item.get('richItemRenderer', {}).get('content', {}).get('lockupViewModel', {})
                if lvm:
                    content_id = lvm.get('contentId', '')
                    title = lvm.get('metadata', {}).get('lockupMetadataViewModel', {}).get('title', {}).get('content', '')
                    if content_id and title:
                        videos.append({'id': content_id, 'title': title})
                    if len(videos) >= NUM_VIDEOS:
                        break
            break
    return videos if videos else None

def fetch_videos_via_noembed(video_ids):
    videos = []
    for vid_id in video_ids[:NUM_VIDEOS]:
        try:
            url = f'https://noembed.com/embed?url=https://www.youtube.com/watch?v={vid_id}'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req, timeout=10)
            d = json.loads(res.read())
            title = d.get('title', '')
            if title and title != vid_id:
                videos.append({'id': vid_id, 'title': title})
        except Exception:
            continue
    return videos if videos else None

def fetch_videos_via_scrape():
    url = f'https://www.youtube.com/{HANDLE}/videos'
    req = urllib.request.Request(url, headers=HEADERS)
    html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')
    video_ids = []
    seen = set()
    for vid_id in re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html):
        if vid_id not in seen:
            seen.add(vid_id)
            video_ids.append(vid_id)
        if len(video_ids) >= NUM_VIDEOS:
            break
    return fetch_videos_via_noembed(video_ids) if video_ids else None

def fetch_videos():
    """Fetch regular YouTube videos using multiple fallback strategies."""
    print("🔄 Fetching latest YouTube full videos...")
    for strategy in [fetch_videos_via_yt_data, fetch_videos_via_scrape]:
        try:
            vids = strategy()
            if vids:
                print(f"✅ Fetched {len(vids)} full YouTube videos")
                return vids
        except Exception as e:
            print(f"⚠️ Strategy failed: {e}")
    return None

# Execute fetch & save
if __name__ == '__main__':
    # 1. Update Videos
    fetched_videos = fetch_videos()
    if fetched_videos:
        existing = load_existing(VIDEOS_FILE, 'youtubeVideos')
        new_ids = {v['id'] for v in fetched_videos}
        merged = fetched_videos + [v for v in existing if v['id'] not in new_ids]
        save_data(VIDEOS_FILE, 'youtubeVideos', merged[:NUM_VIDEOS])
        print(f"✅ {VIDEOS_FILE} updated ({len(merged[:NUM_VIDEOS])} videos)")
    else:
        print(f"⚠️ Keeping existing {VIDEOS_FILE}")

    # 2. Update Shorts
    fetched_shorts = fetch_shorts()
    if fetched_shorts:
        existing_s = load_existing(SHORTS_FILE, 'youtubeShorts')
        new_s_ids = {s['id'] for s in fetched_shorts}
        merged_s = fetched_shorts + [s for s in existing_s if s['id'] not in new_s_ids]
        save_data(SHORTS_FILE, 'youtubeShorts', merged_s[:NUM_SHORTS])
        print(f"✅ {SHORTS_FILE} updated ({len(merged_s[:NUM_SHORTS])} shorts)")
    else:
        print(f"⚠️ Keeping existing {SHORTS_FILE}")