import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { CompanionPreferences } from '../../entities/companion';
import { createPipModel } from './pip-model';

export interface PipOptions {
  pot: CompanionPreferences['pot'];
  personality: CompanionPreferences['personality'];
  mood: string;
  moving: boolean;
  dragging: boolean;
  revision: string | number;
}
const potColors = { terracotta: '#cd865c', sage: '#96ac83', cream: '#e9d9b7' };

export const createPipScene = (
  canvas: HTMLCanvasElement,
  initial: PipOptions,
  onLost: () => void,
  onReady?: () => void,
) => {
  let ready = false;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const lighting = pmrem.fromScene(environment, 0.04);
  scene.environment = lighting.texture;
  scene.environmentIntensity = 0.35;
  environment.dispose();
  pmrem.dispose();
  const camera = new THREE.OrthographicCamera(-1.3, 1.3, 1.65, -1.65, 0.1, 20);
  camera.position.set(0, 2.45, 6);
  camera.lookAt(0, 1.18, 0);
  const model = createPipModel();
  scene.add(model.root);
  scene.add(new THREE.HemisphereLight('#fff3d4', '#3c593b', 1.3));
  const key = new THREE.DirectionalLight('#fff1d6', 2.1);
  key.position.set(-3, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(512, 512);
  Object.assign(key.shadow.camera, { left: -2, right: 2, top: 3, bottom: -1, near: 0.1, far: 12 });
  key.shadow.normalBias = 0.025;
  const rim = new THREE.DirectionalLight('#def6aa', 1.7);
  rim.position.set(2, 3, -2);
  const fill = new THREE.DirectionalLight('#d0e4ff', 0.6);
  fill.position.set(3, 1, 3);
  scene.add(key, rim, fill);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader:
        'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:
        'varying vec2 vUv;void main(){float a=1.-smoothstep(0.,.5,length(vUv-.5));gl_FragColor=vec4(.02,.03,.015,a*.3);}',
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;
  scene.add(shadow);

  const particleGeometry = new THREE.OctahedronGeometry(0.055);
  const particleMaterial = new THREE.MeshStandardMaterial({
    color: '#d8efa0',
    emissive: '#7e952e',
    emissiveIntensity: 0.45,
    roughness: 0.3,
  });
  const particles = new THREE.InstancedMesh(particleGeometry, particleMaterial, 12);
  const heart = new THREE.Shape();
  heart.moveTo(0, -0.6);
  heart.bezierCurveTo(-1, 0, -0.8, 0.9, 0, 0.42);
  heart.bezierCurveTo(0.8, 0.9, 1, 0, 0, -0.6);
  const hearts = new THREE.InstancedMesh(
    new THREE.ExtrudeGeometry(heart, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSize: 0.08,
      bevelThickness: 0.06,
      bevelSegments: 2,
      steps: 1,
      curveSegments: 10,
    }),
    new THREE.MeshStandardMaterial({ color: '#ed9c98', roughness: 0.4 }),
    6,
  );
  const dropGeometry = new THREE.SphereGeometry(0.024, 8, 6);
  const drops = new THREE.InstancedMesh(
    dropGeometry,
    new THREE.MeshPhysicalMaterial({
      color: '#a8e2ec',
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1,
    }),
    14,
  );
  scene.add(particles, hearts, drops);
  const dummy = new THREE.Object3D();
  let options = initial;
  let age = 0;
  let time = 0;
  let previous = 0;
  let frame = 0;
  let disposed = false;
  let inView = true;
  let gazeX = 0;
  let gazeY = 0;
  let facing = 0;
  const control = canvas.closest('button');
  let pointerHover = Boolean(
    window.matchMedia('(hover: hover)').matches && control?.matches(':hover'),
  );
  let keyboardHover = control?.matches(':focus-visible') ?? false;
  let hoverActive = false;
  let hoverAmount = 0;
  let hoverTime = 0;
  const targetColor = new THREE.Color();

  const pose = (delta: number) => {
    const animate = options.moving;
    if (animate) {
      time += delta;
      age += delta;
    }
    const t = animate ? time : 0;
    const reactionTime = animate ? age : 0.6;
    const speed =
      options.personality === 'cheerful' ? 1.4 : options.personality === 'calm' ? 0.65 : 1;
    const joy = ['cart', 'studio', 'hello', 'dance'].includes(options.mood);
    const sleep = options.mood === 'sleep';
    const water = options.mood === 'water';
    const worried = options.mood === 'error';
    const engaged =
      animate &&
      !options.dragging &&
      (pointerHover || keyboardHover) &&
      ['idle', 'peek'].includes(options.mood);
    if (engaged && !hoverActive) hoverTime = 0;
    if (engaged) hoverTime += delta;
    if (engaged !== hoverActive) canvas.dataset.hovered = String(engaged);
    hoverActive = engaged;
    hoverAmount =
      animate && !options.dragging
        ? THREE.MathUtils.damp(hoverAmount, Number(engaged), 7, delta)
        : 0;
    const greeting = engaged ? Math.sin(hoverTime * 9) * Math.exp(-hoverTime * 1.6) : 0;
    const envelope = Math.max(0, 1 - reactionTime / 3.8);
    const hop = animate && joy ? Math.abs(Math.sin(reactionTime * 5.4)) * 0.12 * envelope : 0;
    const smoothing = animate ? 1 - Math.exp(-delta * 7) : 1;
    targetColor.set(potColors[options.pot]);
    model.ceramic.color.lerp(targetColor, smoothing);
    const turn = sleep ? -0.12 : Math.max(-0.28, Math.min(0.28, gazeX * 0.2));
    facing = THREE.MathUtils.lerp(facing, turn, smoothing);
    const spinProgress = THREE.MathUtils.smoothstep(reactionTime, 0.15, 1.8);
    model.root.rotation.y =
      facing + (animate && options.mood === 'dance' ? spinProgress * Math.PI * 2 : 0);
    model.root.rotation.z = options.dragging
      ? Math.sin(t * 8) * 0.075
      : worried
        ? Math.sin(reactionTime * 12) * 0.06 * envelope
        : options.mood === 'peek'
          ? -0.1
          : Math.sin(t * 1.5 * speed) * 0.018 + hoverAmount * gazeX * 0.045;
    model.root.rotation.x = -hoverAmount * 0.075;
    model.root.position.y = options.dragging ? 0.08 : hop + hoverAmount * 0.055;
    const invitationScale = 1 + hoverAmount * 0.045;
    model.root.scale.set(
      invitationScale + hop * 0.12,
      invitationScale - hop * 0.08,
      invitationScale,
    );
    model.foliage.rotation.z = Math.sin(t * 1.7 * speed) * 0.026;
    model.leaves.forEach((leaf, i) => {
      const spec = model.leafSpecs[i];
      if (!spec) return;
      const wave =
        options.mood === 'hello' && i === 4 ? Math.sin(reactionTime * 9) * 0.24 * envelope : 0;
      leaf.rotation.z =
        spec.lean +
        Math.sin(t * 2 * speed + i * 0.65) * 0.035 +
        wave +
        hoverAmount * (-Math.sign(spec.lean) * 0.085 + (i === 4 ? greeting * 0.2 : 0)) +
        (sleep ? Math.sign(spec.lean) * 0.14 : 0);
      leaf.rotation.x = (water ? Math.sin(t * 7 + i) * 0.035 : 0) + (options.dragging ? 0.12 : 0);
    });
    const blinkPhase = t % 5.3;
    const blink =
      animate && blinkPhase > 4.95 ? Math.max(0.08, Math.abs(blinkPhase - 5.12) / 0.17) : 1;
    model.eyes.forEach((eye, index) => {
      const wink =
        engaged && index === 0 && hoverTime > 0.48 && hoverTime < 0.76
          ? Math.max(0.12, Math.abs(hoverTime - 0.62) / 0.14)
          : 1;
      eye.scale.y = sleep ? 0.12 : options.dragging ? 1.3 : blink * wink * (1 + hoverAmount * 0.14);
      eye.position.y = 0.46 + (animate && !sleep ? gazeY * 0.013 : 0);
    });
    model.mouth.rotation.z = worried ? Math.PI : 0;
    model.mouth.scale.y = sleep ? 0.2 : joy ? 1.35 : 1 + hoverAmount * 0.22;
    shadow.scale.setScalar(1 - hop * 0.5 - hoverAmount * 0.06);
    particles.visible = (joy && options.mood !== 'hello') || water;
    hearts.visible = options.mood === 'hello';
    drops.visible = water;
    particleMaterial.color.set(options.mood === 'hello' ? '#f3bba8' : '#d8efa0');
    for (let i = 0; i < 12; i++) {
      const phase = (reactionTime * 0.5 + i / 12) % 1;
      const angle = i * 2.39996;
      const radius = 0.65 + phase * 0.5;
      dummy.position.set(Math.cos(angle) * radius, 0.75 + phase * 1.6, Math.sin(angle) * 0.35);
      dummy.rotation.set(t + i, t * 0.7, t);
      dummy.scale.setScalar(Math.sin(phase * Math.PI) * (water ? 0.45 : 0.75));
      dummy.updateMatrix();
      particles.setMatrixAt(i, dummy.matrix);
      if (i < 6) {
        const heartPhase = (reactionTime * 0.4 + i / 6) % 1;
        dummy.position.set(
          Math.sin(i * 2.4) * (0.8 + heartPhase * 0.3),
          0.7 + heartPhase * 1.5,
          0.3,
        );
        dummy.rotation.set(0.1, Math.sin(t + i) * 0.35, Math.sin(t + i) * 0.2);
        dummy.scale.setScalar(Math.sin(heartPhase * Math.PI) * 0.12);
        dummy.updateMatrix();
        hearts.setMatrixAt(i, dummy.matrix);
      }
    }
    particles.instanceMatrix.needsUpdate = true;
    hearts.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < 14; i++) {
      const phase = (reactionTime * 0.8 + i / 14) % 1;
      dummy.position.set(
        Math.sin(i * 2.4) * 0.7,
        2.6 - phase * 1.65,
        Math.cos(i * 2.4) * 0.3 + 0.2,
      );
      dummy.rotation.set(0, 0, -0.12);
      dummy.scale.set(1, 2.7, 1);
      dummy.updateMatrix();
      drops.setMatrixAt(i, dummy.matrix);
    }
    drops.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      onReady?.();
    }
  };
  const tick = (now: number) => {
    frame = 0;
    if (disposed || document.hidden || !inView) return;
    const elapsed = previous ? (now - previous) / 1000 : 1 / 30;
    if (elapsed >= 1 / 32) {
      previous = now;
      pose(Math.min(elapsed, 0.05));
    }
    if (options.moving) frame = requestAnimationFrame(tick);
  };
  const wake = () => {
    if (disposed) return;
    cancelAnimationFrame(frame);
    previous = 0;
    frame = requestAnimationFrame(tick);
  };
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const halfHeight = 1.48;
    camera.left = (-halfHeight * width) / height;
    camera.right = (halfHeight * width) / height;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    wake();
  };
  const pointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || !options.moving) return;
    const rect = canvas.getBoundingClientRect();
    gazeX = THREE.MathUtils.clamp((event.clientX - rect.left - rect.width / 2) / 220, -1, 1);
    gazeY = THREE.MathUtils.clamp(-(event.clientY - rect.top - rect.height / 2) / 220, -1, 1);
  };
  const lost = (event: Event) => {
    event.preventDefault();
    onLost();
  };
  const enter = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') pointerHover = true;
  };
  const leave = () => {
    pointerHover = false;
  };
  const focus = () => {
    keyboardHover = control?.matches(':focus-visible') ?? false;
  };
  const blur = () => {
    keyboardHover = false;
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const intersection = new IntersectionObserver((entries) => {
    inView = entries.some((entry) => entry.isIntersecting);
    wake();
  });
  intersection.observe(canvas);
  window.addEventListener('pointermove', pointer, { passive: true });
  control?.addEventListener('pointerenter', enter);
  control?.addEventListener('pointerleave', leave);
  control?.addEventListener('focus', focus);
  control?.addEventListener('blur', blur);
  document.addEventListener('visibilitychange', wake);
  canvas.addEventListener('webglcontextlost', lost);
  resize();
  return {
    update(next: PipOptions) {
      if (next.mood !== options.mood || next.revision !== options.revision) age = 0;
      options = next;
      wake();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', pointer);
      control?.removeEventListener('pointerenter', enter);
      control?.removeEventListener('pointerleave', leave);
      control?.removeEventListener('focus', focus);
      control?.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', wake);
      canvas.removeEventListener('webglcontextlost', lost);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const mesh = object as THREE.Mesh;
          geometries.add(mesh.geometry);
          for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
            materials.add(material);
          if (object instanceof THREE.InstancedMesh) object.dispose();
        }
      });
      geometries.forEach((geometry) => {
        geometry.dispose();
      });
      materials.forEach((material) => {
        material.dispose();
      });
      key.shadow.dispose();
      lighting.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
};

export type PipScene = ReturnType<typeof createPipScene>;
