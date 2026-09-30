/* global document, window, Image */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  createBotanicalModel,
  growBotanicalModel,
} from '../../frontend/src/widgets/home/lib/botanical-model.ts';

const portrait = new URLSearchParams(window.location.search).has('portrait');
const W = portrait ? 1080 : 1920;
const H = 1080;
const canvas = document.querySelector('#film');
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext('2d');
const gl = document.createElement('canvas');
const renderer = new THREE.WebGLRenderer({
  canvas: gl,
  alpha: true,
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setSize(W, H);
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const environment = new RoomEnvironment();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(environment, 0.05).texture;
scene.environmentIntensity = 0.38;
environment.dispose();
pmrem.dispose();
const camera = new THREE.PerspectiveCamera(35, W / H, 0.05, 50);
const plant = createBotanicalModel();
plant.world.children.at(-1).visible = false;
scene.add(plant.world);
const macro = plant.leaves[10].leaf.clone(true);
macro.traverse((object) => {
  if (object.isMesh) {
    object.geometry = object.geometry.clone();
    object.material = object.material.clone();
  }
});
macro.position.set(0, 0, 0);
scene.add(macro);
const dewMaterial = new THREE.MeshPhysicalMaterial({
  color: '#e0f4d9',
  roughness: 0.06,
  metalness: 0.05,
  transmission: 0.8,
  thickness: 0.09,
  ior: 1.33,
  transparent: true,
  opacity: 0.85,
});
for (let i = 0; i < 9; i++) {
  const t = 0.18 + (i / 9) * 0.65,
    u = Math.sin(i * 2.4) * 0.65,
    profile = Math.sin(Math.PI * t) ** 0.78;
  const drop = new THREE.Mesh(
    new THREE.SphereGeometry(0.014 + (i % 3) * 0.005, 16, 12),
    dewMaterial,
  );
  drop.position.set(
    u * 0.3825 * profile,
    t * 1.225,
    0.35 * 1.225 * t * t + Math.abs(u) ** 1.6 * profile * 0.22 + 0.026,
  );
  drop.scale.z = 0.6;
  macro.add(drop);
}
const key = new THREE.DirectionalLight('#fff2d6', 4);
key.position.set(-3, 5, 5);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
Object.assign(key.shadow.camera, { left: -4, right: 4, top: 5, bottom: -3, near: 0.1, far: 15 });
key.shadow.normalBias = 0.035;
const rim = new THREE.DirectionalLight('#d4eca2', 3.4);
rim.position.set(3, 3, -2);
scene.add(key, rim, new THREE.HemisphereLight('#e8f1d6', '#252f20', 1.5));
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.ShadowMaterial({ opacity: 0.22 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.03;
floor.receiveShadow = true;
scene.add(floor);
const images = {};
await Promise.all(
  Object.entries({
    minimal: '/rooms/minimal.webp',
    cozy: '/rooms/cozy.webp',
    gallery: '/rooms/gallery.webp',
    desk: '/plants/desk-plant-1200.webp',
    calathea: '/plants/calathea-plant-1200.webp',
    rubber: '/plants/rubber-plant-1200.webp',
    monstera: '/plants/monstera-deliciosa-1200.webp',
  }).map(async ([name, src]) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    images[name] = image;
  }),
);
const clamp = (n) => Math.max(0, Math.min(1, n));
const ease = (n) => {
  n = clamp(n);
  return n * n * (3 - 2 * n);
};
const ink = '#edf0df';
function background(a, b) {
  const g = ctx.createRadialGradient(W * 0.62, H * 0.4, 10, W * 0.5, H * 0.5, W * 0.7);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}
function text(value, x, y, size, color = ink, serif = false) {
  ctx.fillStyle = color;
  ctx.font = `${serif ? 'italic ' : ''}${size}px ${serif ? 'Georgia' : 'Arial'}`;
  ctx.fillText(value, x, y);
}
function label(value, x, y, color = '#d6e6b1') {
  ctx.font = '500 20px Arial';
  ctx.letterSpacing = '5px';
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
  ctx.letterSpacing = '0px';
}
function type(lines, local, { x = 100, y = 440, size = 110, color = ink } = {}) {
  lines.forEach((line, i) => {
    const a = ease((local - i * 0.18) / 0.95);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.rect(x - 5, y + (i - 1) * size * 1.04 + 15, W, size * 1.2);
    ctx.clip();
    text(line, x, y + i * size * 1.04 + (1 - a) * size * 0.65, size, color, i === lines.length - 1);
    ctx.restore();
  });
}
function photo(image, zoom = 1, offset = 0) {
  const scale = Math.max(W / image.width, H / image.height) * zoom;
  const w = image.width * scale,
    h = image.height * scale;
  ctx.drawImage(image, (W - w) / 2 + offset, (H - h) / 2, w, h);
  return { scale, x: (W - w) / 2 + offset, y: (H - h) / 2 };
}
const bottoms = new Map();
for (const image of Object.values(images)) {
  const probe = document.createElement('canvas');
  probe.width = image.width;
  probe.height = image.height;
  const c = probe.getContext('2d');
  c.drawImage(image, 0, 0);
  const data = c.getImageData(0, 0, image.width, image.height).data;
  let bottom = image.height;
  outer: for (let y = image.height - 1; y >= 0; y--) {
    for (let x = 0; x < image.width; x++) {
      if (data[(y * image.width + x) * 4 + 3] > 64) {
        bottom = y + 1;
        break outer;
      }
    }
  }
  bottoms.set(image, bottom / image.height);
}
function cutout(image, cx, base, size, angle = 0) {
  ctx.save();
  ctx.translate(cx, base);
  ctx.rotate(angle);
  ctx.drawImage(image, -size / 2, -bottoms.get(image) * size, size, size);
  ctx.restore();
}
function shadow(cx, cy, w, opacity = 0.2) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(w, 22);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, `rgba(10,17,8,${opacity})`);
  g.addColorStop(1, 'rgba(10,17,8,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}
function dust(t, amount = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 36; i++) {
    const x = ((i * 197.13 + t * (4 + (i % 4))) % (W + 100)) - 50,
      y = ((i * 83.91 - t * 9 + H * 3) % (H + 100)) - 50;
    const r = 1.3 + (i % 3);
    ctx.fillStyle = `rgba(224,237,186,${(0.04 + 0.05 * Math.sin(i + t)) * amount})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
function render3d(t, close) {
  plant.world.visible = !close;
  macro.visible = close;
  floor.visible = !close;
  if (close) {
    macro.rotation.set(-0.15 + Math.sin(t * 0.15) * 0.05, -0.35 + t * 0.055, -0.45);
    camera.position.set(0.3, 0.7, 2.2 - t * 0.06);
    camera.lookAt(portrait ? 0 : -0.58, 0.65, 0);
  } else {
    const p = ease(t / 6.5);
    growBotanicalModel(plant.leaves, p, t, true, false);
    plant.world.rotation.y = -0.5 + t * 0.13;
    camera.position.set(
      portrait ? 0.1 : -0.9,
      portrait ? 2.9 : 2.6,
      portrait ? 8.8 : 7.8 - t * 0.06,
    );
    camera.lookAt(portrait ? 0 : -1.15, portrait ? 0.9 : 1.45, 0);
  }
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  ctx.drawImage(gl, 0, 0);
}
function opening(t) {
  background('#35452b', '#0b140e');
  render3d(t, true);
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, '#0b140edf');
  grad.addColorStop(0.65, '#0b140e00');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  label('PLANTO / A LITTLE LIFE', portrait ? 64 : 104, 110);
  type(['Life starts', 'with a little.'], t - 0.3, {
    x: portrait ? 64 : 104,
    y: portrait ? 750 : 520,
    size: portrait ? 90 : 125,
  });
  dust(t);
}
function growing(t) {
  background('#33402b', '#121c13');
  render3d(t, false);
  label('01 / GROW', portrait ? 64 : 104, 110);
  type(['A little care.', 'A living world.'], t - 0.15, {
    x: portrait ? 64 : 104,
    y: portrait ? 810 : 490,
    size: portrait ? 74 : 105,
  });
  if (t > 3) {
    ctx.globalAlpha = ease(t - 3);
    text(
      'One leaf at a time.',
      portrait ? 64 : 108,
      portrait ? 1010 : 770,
      portrait ? 26 : 30,
      '#c1cdb0',
    );
    ctx.globalAlpha = 1;
  }
  dust(t + 5);
}
function room(t, evening = false) {
  const framing = photo(
    images[evening ? 'cozy' : 'minimal'],
    1.04 + t * 0.008,
    Math.sin(t * 0.2) * 12,
  );
  // Keep the pot's contact point in room coordinates so camera movement
  // carries the table, plant and contact shadow together.
  const cx = framing.x + (portrait ? 770 : 860) * framing.scale;
  const base = framing.y + (evening ? 635 : 660) * framing.scale;
  const size = 430 * framing.scale;
  shadow(cx, base, size * 0.17, 0.32);
  cutout(images[evening ? 'desk' : 'calathea'], cx, base, size);
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, evening ? '#172013dc' : '#182417c2');
  g.addColorStop(0.72, '#18241700');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  label(evening ? '03 / SLOW DOWN' : '02 / MAKE ROOM', portrait ? 64 : 104, 110);
  type(evening ? ['Come home.', 'Exhale.'] : ['Same space.', 'New feeling.'], t - 0.15, {
    x: portrait ? 64 : 104,
    y: portrait ? 860 : 480,
    size: portrait ? 80 : 112,
  });
  dust(t + 12, 0.6);
}
function collection(t) {
  background('#d9d7be', '#a3ae8d');
  const positions = portrait ? [0.2, 0.5, 0.8] : [0.25, 0.5, 0.75];
  const sizes = portrait ? [440, 620, 430] : [610, 650, 610];
  const keys = ['rubber', 'desk', 'monstera'];
  positions.forEach((p, i) => {
    const a = ease((t - i * 0.22) / 1.2);
    const x = W * p;
    shadow(x, H * 0.88, sizes[i] * 0.22, 0.14 * a);
    ctx.save();
    ctx.globalAlpha = a;
    cutout(images[keys[i]], x, H * 0.89 + (1 - a) * 180, sizes[i], Math.sin(t * 0.4 + i) * 0.006);
    ctx.restore();
  });
  label('04 / YOUR KIND OF GREEN', portrait ? 64 : 104, 110, '#34472e');
  ctx.fillStyle = '#20301d';
  ctx.fillRect(portrait ? 64 : 104, 130, 64, 2);
  type(['Make room for life.'], t - 0.1, {
    x: portrait ? 64 : 104,
    y: portrait ? 250 : 265,
    size: portrait ? 84 : 132,
    color: '#20301d',
  });
}
function finale(t) {
  background('#30432a', '#101a11');
  const a = ease(t / 1.2);
  ctx.save();
  ctx.globalAlpha = 0.7;
  cutout(images.monstera, portrait ? 50 : 150, H + 220, portrait ? 740 : 1000, -0.2 + t * 0.005);
  cutout(images.rubber, W - (portrait ? 5 : 40), H + 260, portrait ? 730 : 1100, 0.15 - t * 0.007);
  ctx.restore();
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  text('Planto.', W / 2, H * 0.49 + (1 - a) * 35, portrait ? 190 : 235, ink, true);
  text('A little green. A different feeling.', W / 2, H * 0.6, portrait ? 29 : 36, '#d4e4b3');
  ctx.strokeStyle = '#d4e4b366';
  ctx.beginPath();
  ctx.moveTo(W / 2 - 50, H * 0.68);
  ctx.lineTo(W / 2 + 50, H * 0.68);
  ctx.stroke();
  text('planto-react.web.app', W / 2, H * 0.76, 23, '#b4c2a6');
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
  dust(t + 25);
}
const shots = [
  { start: 0, fn: opening },
  { start: 5, fn: growing },
  { start: 12, fn: (t) => room(t, false) },
  { start: 16, fn: (t) => room(t, true) },
  { start: 20, fn: collection },
  { start: 24, fn: finale },
];
const previous = document.createElement('canvas');
previous.width = W;
previous.height = H;
const previousCtx = previous.getContext('2d');
window.renderFilm = (time) => {
  ctx.clearRect(0, 0, W, H);
  const index = shots.findLastIndex((s) => time >= s.start);
  const shot = shots[Math.max(0, index)];
  const local = time - shot.start;
  shot.fn(local);
  if (index > 0 && local < 0.65) {
    previousCtx.clearRect(0, 0, W, H);
    previousCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, W, H);
    shots[index - 1].fn(shot.start - shots[index - 1].start + local);
    ctx.globalAlpha = ease(local / 0.65);
    ctx.drawImage(previous, 0, 0);
    ctx.globalAlpha = 1;
  }
  const fade = ease(time / 0.75) * (1 - ease((time - 27.2) / 0.8));
  ctx.fillStyle = `rgba(8,15,9,${1 - fade})`;
  ctx.fillRect(0, 0, W, H);
  return canvas.toDataURL('image/jpeg', 0.94).split(',')[1];
};
window.renderFilm(2);
window.filmReady = true;
