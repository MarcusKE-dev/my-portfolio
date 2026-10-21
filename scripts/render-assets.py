"""Optional asset regeneration with Pillow and the site's Google Fonts TTFs.
Usage: python3 scripts/render-assets.py /path/to/SpaceGrotesk.ttf /path/to/Outfit.ttf
The site and npm build need neither Python nor Pillow.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys
root = Path(__file__).resolve().parent.parent
space, outfit = sys.argv[1:3]
image = Image.new('RGB', (1200, 630), '#000000')
draw = ImageDraw.Draw(image)
draw.text((82, 135), 'Dev.John', font=ImageFont.truetype(space, 92), fill='#f5f5f5')
draw.text((86, 269), 'John Mwaura', font=ImageFont.truetype(space, 48), fill='#f5f5f5')
draw.text((86, 345), 'Web and software developer in Kenya', font=ImageFont.truetype(outfit, 36), fill='#8a8a8a')
draw.text((86, 482), 'devjohn.site', font=ImageFont.truetype(outfit, 30), fill='#f5f5f5')
image.save(root / 'images/og-default.png', optimize=True)
icon = Image.new('RGB', (512, 512), '#000000')
draw = ImageDraw.Draw(icon)
draw.text((256, 256), 'DJ', anchor='mm', font=ImageFont.truetype(space, 275), fill='#f5f5f5')
for size in (48, 192, 512):
    icon.resize((size,size), Image.Resampling.LANCZOS).save(root / f'favicon-{size}.png', optimize=True)
icon.resize((180,180), Image.Resampling.LANCZOS).save(root / 'apple-touch-icon.png', optimize=True)
icon.save(root / 'favicon.ico', sizes=[(16,16),(32,32),(48,48)])
(root / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>Dev John</title><path fill="#000" d="M0 0h512v512H0z"/><g fill="none" stroke="#f5f5f5" stroke-width="34" stroke-linejoin="round"><path d="M97 137v238h55c113 0 113-238 0-238z"/><path d="M284 137h133m-30 0v174c0 86-103 86-103 12"/></g></svg>\n')
