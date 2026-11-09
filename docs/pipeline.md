# Cinematic grading pipeline

`grade.js` is the shared CPU reference for the browser and offline demo renderer. It takes 8-bit RGBA pixels from the browser canvas or FFmpeg. The original preset bypasses processing and alpha remains unchanged.

1. Sample every 17th pixel and estimate mean luma with Rec. 709 weights on encoded RGB.
2. Estimate an exposure gain toward luma 112, constrained to 0.82–1.24. Smooth the estimate with an exponential response with a 0.45 s time constant. Reset the estimator whenever the media source changes.
3. Separate luma from color by subtracting the original luma from each channel. Adjust contrast around midpoint gray, scale the color residual for saturation, and blend shadow and highlight offsets with a smoothstep weight derived from exposed luma.
4. For film presets that use texture, add deterministic pixel-index grain and apply a radial vignette using the frame width and height.
5. Blend the result with the original pixel by the intensity slider, then clip back to 8-bit. In comparison mode, the left half retains original pixels.

Neon Rain cools shadows and pushes highlights toward magenta. Amber Hour warms highlights. Silver Noir removes chroma and increases contrast. Teal & Copper contrasts cool shadows with warm highlights.

Silent Film adds a warm tint, stronger contrast, stable grain and a pronounced vignette. Sepia Archive uses brown toning. Pastel Daydream lifts dark tones. Tungsten Night cools the low tones and warms highlights. Slide Film increases chroma. Bleach Bypass emphasizes contrast with low saturation.

This baseline uses scene brightness, with manual look selection. Processing is local and the demo makes no network requests for media beyond its bundled sample. For future embedded integration, map capture and presentation to the supported hardware interfaces and measure actual throughput and end-to-end latency on that device.
