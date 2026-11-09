# VIilMx 1.0

**Live in the Movie.**

See an ordinary scene in a different light. VIilMx is a cinematic smart-glasses project built around a forward-facing camera, a head-mounted display design, and a live color-grading pipeline. The software viewfinder lets you try the visual experience on a computer before connecting any wearable hardware.

![VIilMx industrial design concept render](assets/hardware/concept-render.jpg)

*Industrial design concept render from the project workspace.*

## Everyday scenes, recast

![Original and graded comparisons on a city street, office desk and bedroom](assets/scenes/everyday-comparison.jpg)

*Real photographs, graded with the VIilMx software. See [all ten looks on each scene and photo credits](docs/gallery.md).*

[Animated software preview on a synthetic street](assets/demo/live-in-the-movie.gif) · [16-step hardware build dossier](docs/build-log.md) · [Grading pipeline](docs/pipeline.md) · [中文项目说明](docs/README.zh-CN.md)

## Try the software viewfinder

From the repository root, start a local server with Python 3:

```bash
python -m http.server 8000
```

Open [localhost:8000](http://localhost:8000). The real city street loads by default. Choose a city street, office desk, bedroom, or synthetic street from the sample menu. Try a look, adjust its intensity, then turn the comparison on or off. You can also open a local photo or video, or select **Start camera** and grant browser permission. Your media is processed locally. **Stop camera** releases the live stream.

| Look | Visual treatment |
| --- | --- |
| Neon Rain | Cool shadows and magenta highlights |
| Amber Hour | Warm highlights and restrained saturation |
| Silver Noir | Monochrome with deeper contrast |
| Teal & Copper | Cool shadow tones and warmer highlights |
| Silent Film | Warm monochrome, strong contrast, grain and vignette |
| Sepia Archive | Brown toning, soft contrast and fine grain |
| Pastel Daydream | Lifted shadows and muted, soft color |
| Tungsten Night | Violet-blue shadows and warmer practical-light highlights |
| Slide Film | Punchy colors and contrast |
| Bleach Bypass | Desaturated color and a hard contrast curve |

## What is in this repository

| Path | Contents |
| --- | --- |
| `index.html`, `viewfinder.js` | Browser viewfinder with camera, local media and split comparison |
| `grade.js` | Shared grading engine with luminance analysis, smoothed exposure and tonal color mapping |
| `assets/demo/` | Generated scene, filter outputs, comparison image and animated preview |
| `assets/hardware/` | Owner-provided design, wiring, mechanical and assembly screenshots |
| `assets/scenes/` | Three real sample photos, side-by-side images and full look grids |
| [Hardware overview](docs/hardware.md) | Component list, electrical and mechanical details, and verification points |
| [Build dossier](docs/build-log.md) | All 16 supplied workflow steps, with links to the original screenshots |

The visual software is runnable on a desktop browser. Hardware screenshots document the design and build workflow. This publication does not include wearable capture, device firmware, or measured headset performance.

## Rebuild the demo stills

The included `tools/render_street.py` renders the input with Blender 4.x and Cycles. The bundled input can also be used directly. The grading renderer requires Node.js, FFmpeg, and Python with Pillow 10.1+ for the comparison and animation.

```bash
blender -b --python tools/render_street.py
node tools/make_demo.mjs
python tools/assemble_demo.py
```
