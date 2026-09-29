import * as THREE from 'three';
import { createBotanicalModel } from './botanical-model';

export interface BotanicalOptions {
  night: boolean;
  rain: boolean;
  growth: number;
  paused: boolean;
  reducedMotion: boolean;
}

/** Owns the WebGL lifecycle. React only sends changes made by the visitor. */
export function createBotanicalScene(canvas: HTMLCanvasElement, onLost: () => void) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
  const { world, foliage, leaves, leafMaterial } = createBotanicalModel();
  scene.add(world);
  const hemisphere = new THREE.HemisphereLight('#e7f0d6', '#303d28', 2.1);
  const key = new THREE.DirectionalLight('#fff1d8', 4);
  key.position.set(-3, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -3;
  key.shadow.normalBias = 0.035;
  const rim = new THREE.DirectionalLight('#d7ed99', 3);
  rim.position.set(3, 3, -3);
  const fill = new THREE.DirectionalLight('#d9e8cd', 0.85);
  fill.position.set(0, 1.5, 5);
  scene.add(hemisphere, key, rim, fill);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4.8, 4.8),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader:
        'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:
        'varying vec2 vUv; void main(){float a=1.0-smoothstep(0.0,0.5,length(vUv-0.5)); gl_FragColor=vec4(0.015,0.02,0.01,a*0.32);}',
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.35;
  scene.add(floor);

  const rainPositions = new Float32Array(150 * 6);
  const rainGeometry = new THREE.BufferGeometry();
  const rainAttribute = new THREE.BufferAttribute(rainPositions, 3);
  rainGeometry.setAttribute('position', rainAttribute);
  const rain = new THREE.LineSegments(
    rainGeometry,
    new THREE.LineBasicMaterial({ color: '#bce5ee', transparent: true, opacity: 0.5 }),
  );
  world.add(rain);
  const fireflyPositions = new Float32Array(30 * 3);
  const fireflyGeometry = new THREE.BufferGeometry();
  const fireflyAttribute = new THREE.BufferAttribute(fireflyPositions, 3);
  fireflyGeometry.setAttribute('position', fireflyAttribute);
  const fireflies = new THREE.Points(
    fireflyGeometry,
    new THREE.PointsMaterial({ color: '#d8ff97', size: 0.035, transparent: true, opacity: 0.9 }),
  );
  world.add(fireflies);

  let options: BotanicalOptions = {
    night: false,
    rain: false,
    growth: 80,
    paused: false,
    reducedMotion: false,
  };
  let visible = false;
  let disposed = false;
  let frame = 0;
  let previous = 0;
  let time = 0;
  let rotation = 0;
  let growth = 0.8;
  let light = 0;
  let dragging = false;
  let pointerX = 0;
  let activePointer: number | null = null;
  let lastInteraction = 0;
  let dirty = true;
  const warm = new THREE.Color('#fff1d8');
  const cool = new THREE.Color('#9cbeff');

  function draw(delta: number) {
    const animate = !options.paused && !options.reducedMotion;
    if (animate) time += delta;
    if (animate && !dragging && performance.now() - lastInteraction > 3500)
      rotation += delta * 0.09;
    const targetGrowth = options.growth / 100;
    const targetLight = Number(options.night);
    const immediate = options.reducedMotion || options.paused;
    growth = immediate ? targetGrowth : THREE.MathUtils.damp(growth, targetGrowth, 6, delta);
    light = immediate ? targetLight : THREE.MathUtils.damp(light, targetLight, 4, delta);
    world.rotation.y = rotation;
    world.position.y = animate ? Math.sin(time * 0.8) * 0.035 : 0;
    foliage.scale.setScalar(0.38 + growth * 0.7);
    leaves.forEach((leaf, i) => {
      leaf.rotation.z = animate ? Math.sin(time * 1.1 + i * 0.7) * 0.025 : 0;
      leaf.scale.setScalar(0.75 + growth * 0.25);
    });
    key.color.copy(warm).lerp(cool, light);
    key.intensity = 3.2 - light * 1.8;
    hemisphere.intensity = 1.8 - light * 1.0;
    rim.intensity = 2.2 + light;
    leafMaterial.roughness = options.rain ? 0.3 : 0.5;
    rain.visible = options.rain;
    fireflies.visible = options.night;
    for (let i = 0; i < 150; i++) {
      const x = Math.sin(i * 127.1) * 1.7;
      const z = Math.cos(i * 311.7) * 1.4;
      const y = 0.55 + ((i * 0.173 + 1000 - time * 2.3) % 3.2);
      rainPositions.set([x, y, z, x + 0.012, y - 0.09, z], i * 6);
    }
    rainAttribute.needsUpdate = true;
    for (let i = 0; i < 30; i++) {
      const angle = i * 2.4 + time * 0.12;
      fireflyPositions.set(
        [
          Math.cos(angle) * (1.1 + Math.sin(i) * 0.5),
          0.5 + (i % 7) * 0.39 + Math.sin(time + i) * 0.08,
          Math.sin(angle) * 1.6,
        ],
        i * 3,
      );
    }
    fireflyAttribute.needsUpdate = true;
    renderer.render(scene, camera);
    dirty = Math.abs(growth - targetGrowth) > 0.001 || Math.abs(light - targetLight) > 0.001;
  }

  function tick(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden || renderer.getContext().isContextLost()) return;
    const delta = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    draw(delta);
    if ((!options.paused && !options.reducedMotion) || dirty) frame = requestAnimationFrame(tick);
  }
  function wake() {
    if (!frame && !disposed && visible && !document.hidden) {
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const wide = window.innerWidth > 1000;
    camera.position.set(wide ? -1.05 : 0, 2.85, wide ? 8.2 : 8.5);
    camera.lookAt(wide ? -1.05 : 0, 1.5, 0);
    camera.updateProjectionMatrix();
    dirty = true;
    wake();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (!visible) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else wake();
  });
  observer.observe(canvas);
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else wake();
  };
  const down = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    dragging = true;
    activePointer = event.pointerId;
    pointerX = event.clientX;
    lastInteraction = performance.now();
    canvas.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== activePointer) return;
    rotation += (event.clientX - pointerX) * 0.009;
    pointerX = event.clientX;
    lastInteraction = performance.now();
    wake();
  };
  const up = () => {
    dragging = false;
    activePointer = null;
  };
  const keyboard = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    rotation += event.key === 'ArrowLeft' ? -0.2 : 0.2;
    lastInteraction = performance.now();
    wake();
  };
  const lost = (event: Event) => {
    event.preventDefault();
    onLost();
  };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('lostpointercapture', up);
  canvas.addEventListener('keydown', keyboard);
  canvas.addEventListener('webglcontextlost', lost);
  document.addEventListener('visibilitychange', visibility);
  resize();
  return {
    update(next: BotanicalOptions) {
      options = next;
      dirty = true;
      wake();
    },
    reset() {
      rotation = 0;
      time = 0;
      lastInteraction = performance.now();
      dirty = true;
      wake();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('lostpointercapture', up);
      canvas.removeEventListener('keydown', keyboard);
      canvas.removeEventListener('webglcontextlost', lost);
      const geometries = new Set<{ dispose: () => void }>();
      const materials = new Set<{ dispose: () => void }>();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.LineSegments ||
          object instanceof THREE.Points
        ) {
          if (object.geometry instanceof THREE.BufferGeometry) geometries.add(object.geometry);
          const items: unknown[] = Array.isArray(object.material)
            ? object.material
            : [object.material];
          items.forEach((material) => {
            if (material instanceof THREE.Material) materials.add(material);
          });
        }
      });
      geometries.forEach((geometry) => {
        geometry.dispose();
      });
      materials.forEach((material) => {
        material.dispose();
      });
      key.shadow.map?.dispose();
      renderer.dispose();
      if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
    },
  };
}
