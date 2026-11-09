"""Render the real-photo gallery with the same engine as the viewfinder."""
from pathlib import Path
from subprocess import run

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SCENES = ROOT / 'assets/scenes'
LOOKS = {
    'original': 'Original', 'silent': 'Silent Film', 'sepia': 'Sepia Archive',
    'pastel': 'Pastel Daydream', 'tungsten': 'Tungsten Night', 'reversal': 'Slide Film',
    'bleach': 'Bleach Bypass', 'neon': 'Neon Rain', 'amber': 'Amber Hour',
    'noir': 'Silver Noir', 'teal': 'Teal & Copper',
}
PAIRS = [
    ('city', 'City street', 'silent'),
    ('desk', 'Office desk', 'pastel'),
    ('bedroom', 'Bedroom', 'tungsten'),
]
BACKGROUND, PAPER, ACCENT = '#111319', '#f6eee3', '#edbb82'


def grade(source, preset):
    data = run(
        ['node', str(ROOT / 'tools/grade_photo.mjs'), preset, str(source.width)],
        input=source.tobytes(), capture_output=True, check=True,
    ).stdout
    return Image.frombytes('RGBA', source.size, data).convert('RGB')


def label(draw, xy, words, size, color=PAPER):
    draw.text(xy, words, font=ImageFont.load_default(size=size), fill=color)


def paste_photo(canvas, image, xy, size):
    canvas.paste(ImageOps.pad(image, size, method=Image.Resampling.LANCZOS, color='#1b1d24'), xy)


featured = Image.new('RGB', (1200, 714), BACKGROUND)
featured_draw = ImageDraw.Draw(featured)
label(featured_draw, (24, 16), 'VIilMx 1.0  /  EVERYDAY SCENES', 24)
label(featured_draw, (24, 48), 'ORIGINAL PHOTOGRAPHY  /  SOFTWARE GRADES', 14, ACCENT)

for index, (key, scene, featured_look) in enumerate(PAIRS):
    with Image.open(SCENES / f'{key}.jpg') as image:
        source = image.convert('RGBA')
    frames = {preset: grade(source, preset) for preset in LOOKS}
    gallery = Image.new('RGB', (1200, 728), BACKGROUND)
    draw = ImageDraw.Draw(gallery)
    label(draw, (24, 18), scene, 26)
    label(draw, (24, 52), 'SAME PHOTOGRAPH  /  TEN CINEMATIC LOOKS', 15, ACCENT)
    for i, (preset, title) in enumerate(LOOKS.items()):
        x, y = 24 + (i % 4) * 290, 84 + (i // 4) * 212
        paste_photo(gallery, frames[preset], (x, y), (280, 182))
        label(draw, (x, y + 185), title, 16, ACCENT if preset == 'original' else PAPER)
    gallery.save(SCENES / f'{key}-looks.jpg', quality=87, optimize=True)
    x = 24 + index * 388
    label(featured_draw, (x, 80), scene, 20, ACCENT)
    for row, preset in enumerate(('original', featured_look)):
        y = 112 + row * 292
        paste_photo(featured, frames[preset], (x, y), (376, 256))
        label(featured_draw, (x, y + 261), LOOKS[preset], 17)
featured.save(SCENES / 'everyday-comparison.jpg', quality=88, optimize=True)
