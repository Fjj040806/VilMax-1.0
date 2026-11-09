import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CinematicGrader } from '../grade.js';

const directory = fileURLToPath(new URL('../assets/demo/', import.meta.url));
const ffmpeg = (args, input) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
  input, maxBuffer: 16 * 1024 * 1024,
});
const width = 960;
const height = 540;
const input = ffmpeg(['-i', directory + 'street-input.jpg', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-']);
for (const preset of ['neon', 'amber', 'noir', 'teal']) {
  const grader = new CinematicGrader();
  for (let i = 0; i < 12; i++) grader.apply(Buffer.from(input), preset, { dt: 0.25 });
  const output = Buffer.from(input);
  grader.apply(output, preset, { dt: 0.25 });
  ffmpeg(['-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', `${width}x${height}`, '-i', '-', '-frames:v', '1', '-q:v', '2', directory + preset + '.jpg'], output);
}
