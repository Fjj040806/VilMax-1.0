import { CinematicGrader, looks } from './grade.js';

const get = (id) => document.getElementById(id);
const canvas = get('preview');
const context = canvas.getContext('2d', { willReadFrequently: true });
const video = document.createElement('video');
video.muted = true;
video.playsInline = true;
video.loop = true;

const samples = {
  city: ['City street · real photo', './assets/scenes/city.jpg'],
  desk: ['Office desk · real photo', './assets/scenes/desk.jpg'],
  bedroom: ['Bedroom · real photo', './assets/scenes/bedroom.jpg'],
  synthetic: ['Synthetic street scene', './assets/demo/street-input.jpg'],
};
const grader = new CinematicGrader();
let source;
let stream;
let objectUrl;
let request = 0;
let generation = 0;
let previousTime;

for (const [key, look] of Object.entries(looks)) get('look').add(new Option(look.name, key));
get('look').value = 'neon';

function stop() {
  cancelAnimationFrame(request);
  request = 0;
  stream?.getTracks().forEach((track) => track.stop());
  stream = undefined;
  video.pause();
  video.removeAttribute('src');
  video.srcObject = null;
  video.load();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = undefined;
  source = undefined;
  previousTime = undefined;
  context.clearRect(0, 0, canvas.width, canvas.height);
  grader.reset();
  get('camera').textContent = 'Start camera';
}

function draw(time) {
  request = 0;
  if (!source) return;
  const width = source === video ? video.videoWidth : source.naturalWidth;
  const height = source === video ? video.videoHeight : source.naturalHeight;
  if (width && height) {
    const scale = Math.min(960 / width, 720 / height, 1);
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    context.drawImage(source, 0, 0, w, h);
    const image = context.getImageData(0, 0, w, h);
    const split = get('compare').checked ? Math.floor(w / 2) : 0;
    grader.apply(image.data, get('look').value, {
      width: w,
      intensity: Number(get('intensity').value) / 100,
      adaptive: get('adaptive').checked,
      dt: source !== video ? 0.25 : previousTime === undefined ? 1 / 30 : (time - previousTime) / 1000,
    });
    context.putImageData(image, 0, 0, split, 0, w - split, h);
    if (split) {
      context.fillStyle = '#fff1d5';
      context.fillRect(split, 0, 2, h);
    }
  }
  previousTime = time;
  if (source === video) request = requestAnimationFrame(draw);
}

async function load(kind, file) {
  const current = ++generation;
  const sample = samples[get('sample').value];
  stop();
  get('status').textContent = 'Opening source…';
  try {
    if (kind === 'camera') {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Open this page on localhost or HTTPS.');
      const camera = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 960 } }, audio: false });
      if (current !== generation) {
        camera.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = camera;
      video.srcObject = camera;
    } else if (file) {
      objectUrl = URL.createObjectURL(file);
    }
    if (kind === 'sample' || kind === 'image') {
      const image = new Image();
      image.src = kind === 'sample' ? sample[1] : objectUrl;
      await image.decode();
      if (current !== generation) return;
      source = image;
    } else {
      if (kind === 'video') video.src = objectUrl;
      await video.play();
      if (current !== generation) return;
      source = video;
    }
    if (kind === 'camera') get('camera').textContent = 'Stop camera';
    get('status').textContent = kind === 'sample' ? sample[0] : kind === 'camera' ? 'Live camera' : file.name;
    if (source !== video) {
      // Settle still-image metering deterministically without a render loop.
      const meter = document.createElement('canvas');
      meter.width = 160;
      meter.height = 90;
      const ctx = meter.getContext('2d');
      ctx.drawImage(source, 0, 0, 160, 90);
      const sample = ctx.getImageData(0, 0, 160, 90).data;
      for (let i = 0; i < 12; i++) grader.apply(sample.slice(), 'neon', { dt: 0.25 });
    }
    request = requestAnimationFrame(draw);
  } catch (error) {
    if (current !== generation) return;
    stop();
    get('status').textContent = error.message || 'Unable to open source.';
  }
}

get('sample').onchange = () => load('sample');
get('load-sample').onclick = () => load('sample');
get('camera').onclick = () => {
  if (stream) {
    generation++;
    stop();
    get('status').textContent = 'Camera stopped.';
  } else {
    load('camera');
  }
};
get('file').onchange = ({ target }) => {
  const file = target.files[0];
  if (file) load(file.type.startsWith('video/') ? 'video' : 'image', file);
  target.value = '';
};
for (const id of ['look', 'intensity', 'adaptive', 'compare']) {
  get(id).oninput = () => {
    if (source && source !== video && !request) request = requestAnimationFrame(draw);
  };
}
window.addEventListener('pagehide', () => { generation++; stop(); });
load('sample');
