import { readFileSync } from 'node:fs';
import { CinematicGrader, looks } from '../grade.js';

// stdin/stdout hold raw RGBA so the gallery can use the browser's grading core.
const [preset, dimension] = process.argv.slice(2);
const width = Number(dimension);
const source = readFileSync(0);
if (!Object.hasOwn(looks, preset) || !Number.isInteger(width) || width < 1
    || !source.length || source.length % (4 * width)) {
  throw new Error('Expected a preset, image width and complete raw RGBA input.');
}
const grader = new CinematicGrader();
for (let i = 0; i < 12; i++) grader.apply(Buffer.from(source), preset, { dt: 0.25, width });
grader.apply(source, preset, { dt: 0.25, width });
process.stdout.write(source);
