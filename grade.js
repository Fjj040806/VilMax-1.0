export const looks = {
  original: { name: 'Original', saturation: 1, contrast: 1, shadow: [0, 0, 0], light: [0, 0, 0] },
  neon: { name: 'Neon Rain', saturation: 1.19, contrast: 1.16, shadow: [-16, 13, 27], light: [28, -6, 10] },
  amber: { name: 'Amber Hour', saturation: 0.87, contrast: 0.98, shadow: [12, 1, -9], light: [33, 14, -23] },
  noir: { name: 'Silver Noir', saturation: 0, contrast: 1.42, shadow: [0, 0, 0], light: [0, 0, 0] },
  teal: { name: 'Teal & Copper', saturation: 0.89, contrast: 1.13, shadow: [-24, 14, 14], light: [33, 11, -17] },
};

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export class CinematicGrader {
  exposure = 1;

  reset() {
    this.exposure = 1;
  }

  apply(pixels, preset, { intensity = 1, adaptive = true, dt = 1 / 30 } = {}) {
    if (preset === 'original' || intensity === 0 || pixels.length === 0) return;
    const { saturation, contrast, shadow, light } = looks[preset];
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

    for (let i = 0; i < pixels.length; i += 4) {
      const y = luma(pixels[i], pixels[i + 1], pixels[i + 2]);
      const t = clamp(y * gain / 255, 0, 1);
      const highlights = t * t * (3 - 2 * t);
      const base = 127.5 + (y * gain - 127.5) * contrast;
      for (let channel = 0; channel < 3; channel++) {
        const input = pixels[i + channel];
        const graded = base + (input - y) * saturation * gain
          + shadow[channel] * (1 - highlights) + light[channel] * highlights;
        pixels[i + channel] = Math.round(clamp(input + (graded - input) * intensity, 0, 255));
      }
    }
  }
}
