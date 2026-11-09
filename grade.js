export const looks = {
  original: { name: 'Original', saturation: 1, contrast: 1, shadow: [0, 0, 0], light: [0, 0, 0] },
  neon: { name: 'Neon Rain', saturation: 1.19, contrast: 1.16, shadow: [-16, 13, 27], light: [28, -6, 10] },
  amber: { name: 'Amber Hour', saturation: 0.87, contrast: 0.98, shadow: [12, 1, -9], light: [33, 14, -23] },
  noir: { name: 'Silver Noir', saturation: 0, contrast: 1.42, shadow: [0, 0, 0], light: [0, 0, 0] },
  silent: { name: 'Silent Film', saturation: 0, contrast: 1.31, shadow: [-3, -7, -12], light: [13, 6, -7], grain: 17, vignette: 0.43 },
  sepia: { name: 'Sepia Archive', saturation: 0.05, contrast: 0.96, shadow: [13, 1, -14], light: [31, 12, -23], grain: 6, vignette: 0.20 },
  pastel: { name: 'Pastel Daydream', saturation: 0.62, contrast: 0.75, shadow: [20, 14, 21], light: [11, 5, 9] },
  tungsten: { name: 'Tungsten Night', saturation: 0.79, contrast: 1.19, shadow: [-22, -9, 25], light: [22, 8, -16] },
  reversal: { name: 'Slide Film', saturation: 1.52, contrast: 1.24, shadow: [-7, 0, 11], light: [14, 3, -5], grain: 4 },
  bleach: { name: 'Bleach Bypass', saturation: 0.37, contrast: 1.46, shadow: [-6, 2, 8], light: [3, 4, 3] },
  teal: { name: 'Teal & Copper', saturation: 0.89, contrast: 1.13, shadow: [-24, 14, 14], light: [33, 11, -17] },
};

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export class CinematicGrader {
  exposure = 1;

  reset() {
    this.exposure = 1;
  }

  apply(pixels, preset, { intensity = 1, adaptive = true, dt = 1 / 30, width = 0 } = {}) {
    if (preset === 'original' || intensity === 0 || pixels.length === 0) return;
    const { saturation, contrast, shadow, light, grain = 0, vignette = 0 } = looks[preset];
    if (adaptive) {
      let sum = 0;
      let count = 0;
      // Sample every 17th pixel to keep metering inexpensive.
      for (let i = 0; i < pixels.length; i += 68) {
        sum += luma(pixels[i], pixels[i + 1], pixels[i + 2]);
        count++;
      }
      const target = clamp(112 / Math.max(sum / count, 1), 0.82, 1.24);
      const alpha = 1 - Math.exp(-clamp(dt, 0, 0.25) / 0.45);
      this.exposure += alpha * (target - this.exposure);
    }
    const gain = adaptive ? this.exposure : 1;

    const height = width ? pixels.length / (4 * width) : 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const y = luma(pixels[i], pixels[i + 1], pixels[i + 2]);
      const t = clamp(y * gain / 255, 0, 1);
      const highlights = t * t * (3 - 2 * t);
      const base = 127.5 + (y * gain - 127.5) * contrast;
      const pixel = i / 4;
      // Fixed grain stays stable between frames, without a random draw per pixel.
      const hash = Math.imul(pixel ^ (pixel >>> 13), 0x45d9f3b);
      const noise = grain * (((hash ^ (hash >>> 16)) & 255) / 255 - 0.5);
      let falloff = 1;
      if (vignette && width && height) {
        const x = 2 * ((pixel % width + 0.5) / width) - 1;
        const z = 2 * ((Math.floor(pixel / width) + 0.5) / height) - 1;
        falloff -= vignette * Math.min(1, (x * x + z * z) / 2);
      }
      for (let channel = 0; channel < 3; channel++) {
        const input = pixels[i + channel];
        const graded = base + (input - y) * saturation * gain
          + shadow[channel] * (1 - highlights) + light[channel] * highlights;
        pixels[i + channel] = Math.round(clamp(input + (graded * falloff + noise - input) * intensity, 0, 255));
      }
    }
  }
}
