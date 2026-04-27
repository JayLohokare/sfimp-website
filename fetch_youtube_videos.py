import urllib.request
import xml.etree.ElementTree as ET
import json

CHANNEL_ID = 'UCPfOZK-GfS92UG4yaFJszNA' # SFIMP Channel ID
rss_url = f'https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}'

try:
    req = urllib.request.Request(rss_url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    xml_data = response.read()
    
    root = ET.fromstring(xml_data)
    ns = {'atom': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015'}
    
    videos = []
    for entry in root.findall('atom:entry', ns):
        video_id = entry.find('yt:videoId', ns).text
        title = entry.find('atom:title', ns).text
        videos.append({
            'id': video_id,
            'title': title
        })
        if len(videos) >= 6: # Get latest 6 videos
            break
            
    with open('youtube_videos.js', 'w', encoding='utf-8') as f:
        f.write(f'const youtubeVideos = {json.dumps(videos, indent=2, ensure_ascii=False)};\n')
    
    print("✅ youtube_videos.js created with latest videos.")
except Exception as e:
    print(f"❌ Failed to fetch videos: {e}")
