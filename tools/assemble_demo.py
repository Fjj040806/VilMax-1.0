"""Build the labeled comparison and a wipe preview from graded stills."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1] / 'assets/demo'
looks = {'teal': 'Teal & Copper', 'street-input': 'Original', 'neon': 'Neon Rain', 'amber': 'Amber Hour', 'noir': 'Silver Noir'}
images = {key: Image.open(root / f'{key}.jpg').convert('RGB') for key in looks}
font = ImageFont.load_default(size=19)
small = ImageFont.load_default(size=14)
cream, muted, background = '#f6eee3', '#c9b9aa', '#111319'

poster = Image.new('RGB', (1200, 770), background)
draw = ImageDraw.Draw(poster)
draw.text((24, 19), 'VIilMx 1.0  /  LIVE IN THE MOVIE', font=font, fill=cream)
draw.text((24, 47), 'SOFTWARE VIEWFINDER   ·   SYNTHETIC STREET SCENE', font=small, fill=muted)
for i, (key, name) in enumerate(list(looks.items())[1:]):
    x, y = 24 + i % 2 * 582, 80 + i // 2 * 337
    poster.paste(images[key].resize((570, 321), Image.Resampling.LANCZOS), (x, y))
    draw.rectangle((x + 11, y + 11, x + 156, y + 45), fill=background)
    draw.text((x + 22, y + 17), name, font=font, fill=cream)
poster.save(root / 'comparison.jpg', quality=90, optimize=True)

w, h = 320, 180
frames = []
durations = []
original = images['street-input'].resize((w, h), Image.Resampling.LANCZOS)
for key in ('neon', 'amber', 'noir', 'teal'):
    graded = images[key].resize((w, h), Image.Resampling.LANCZOS)
    for step in range(6):
        boundary = round(w * (5 - step) / 5)
        frame = Image.new('RGB', (w, h + 35), background)
        frame.paste(original)
        if boundary < w:
            frame.paste(graded.crop((boundary, 0, w, h)), (boundary, 0))
        draw = ImageDraw.Draw(frame)
        if 0 < boundary < w:
            draw.line((boundary, 0, boundary, h), fill=cream, width=2)
        draw.text((10, h + 8), 'VIilMx  /  ' + (looks[key] if step else 'Original'), font=font, fill=cream)
        frames.append(frame.quantize(colors=64))
        durations.append(900 if step == 5 else 100)
frames[0].save(root / 'live-in-the-movie.gif', save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=True)
