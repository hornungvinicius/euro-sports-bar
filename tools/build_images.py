"""Build responsive WebP derivatives from the original photos in the Euro Sports Drive folder.

Usage:  python tools/build_images.py [slug ...]
Reads tools/images.json:
  { "slug": {"src": "<path inside the Drive folder>", "id": "<Drive file id>"?,
             "crop": [x0, y0, x1, y1]?, "widths": [..]?, "q": 76? } }
crop is in 0-1 fractions of the upright image. Originals are fetched once by Drive id into
the system temp dir (faster than the synced folder) and fall back to the local Drive path.
Output: assets/img/<slug>-<w>.webp and assets/img/manifest.json (real size of each crop).
"""
import json, os, sys, tempfile, urllib.request
from PIL import Image, ImageOps

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pass

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(SITE)  # the Drive folder holding the photo library
OUT = os.path.join(SITE, 'assets', 'img')
CACHE = os.path.join(tempfile.gettempdir(), 'euro-sports-originals')  # outside the synced Drive folder
DEFAULT_WIDTHS = [640, 1024, 1600, 2200]


def source(s):
    if not s.get('id'):
        return os.path.join(ROOT, s['src'])
    os.makedirs(CACHE, exist_ok=True)
    cached = os.path.join(CACHE, s['id'] + '.jpg')
    if not os.path.exists(cached):
        url = f"https://drive.google.com/thumbnail?id={s['id']}&sz=w8000"  # sz above the original returns it full size
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=300).read()
            open(cached, 'wb').write(data)
        except OSError:
            return os.path.join(ROOT, s['src'])
    return cached


spec = json.load(open(os.path.join(SITE, 'tools', 'images.json'), encoding='utf-8'))
only = set(sys.argv[1:])
manifest = {}
for slug, s in spec.items():
    if only and slug not in only:
        continue
    im = ImageOps.exif_transpose(Image.open(source(s))).convert('RGB')
    if s.get('crop'):
        x0, y0, x1, y1 = s['crop']
        W, H = im.size
        im = im.crop((round(x0 * W), round(y0 * H), round(x1 * W), round(y1 * H)))
    widths = [w for w in s.get('widths', DEFAULT_WIDTHS) if w <= im.width] or [im.width]
    for w in widths:
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(
            os.path.join(OUT, f'{slug}-{w}.webp'), 'WEBP', quality=s.get('q', 74), method=6)
    manifest[slug] = {'w': im.width, 'h': im.height, 'widths': widths}
    print(f'{slug:16} {im.size} {widths}', flush=True)

path = os.path.join(OUT, 'manifest.json')
old = json.load(open(path)) if os.path.exists(path) else {}
old.update(manifest)
json.dump(old, open(path, 'w'), indent=1)
