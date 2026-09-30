import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** A small sculpted character, built once and posed by the scene animator. */
export const createPipModel = () => {
  const root = new THREE.Group();
  const ceramic = new THREE.MeshPhysicalMaterial({
    color: '#cc875d',
    roughness: 0.32,
    metalness: 0,
    clearcoat: 0.65,
    clearcoatRoughness: 0.24,
  });
  const pot = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0.08),
        new THREE.Vector2(0.28, 0.08),
        new THREE.Vector2(0.36, 0.1),
        new THREE.Vector2(0.4, 0.16),
        new THREE.Vector2(0.48, 0.67),
        new THREE.Vector2(0.5, 0.77),
        new THREE.Vector2(0.49, 0.81),
        new THREE.Vector2(0.44, 0.81),
        new THREE.Vector2(0.43, 0.72),
      ],
      64,
    ),
    ceramic,
  );
  pot.castShadow = true;
  pot.receiveShadow = true;
  root.add(pot);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.477, 0.047, 12, 64), ceramic);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.77;
  rim.castShadow = true;
  root.add(rim);
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.438, 0.438, 0.035, 48),
    new THREE.MeshStandardMaterial({ color: '#34261e', roughness: 1 }),
  );
  soil.position.y = 0.739;
  soil.receiveShadow = true;
  root.add(soil);
  const grains = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.023, 0),
    new THREE.MeshStandardMaterial({ color: '#92724d', roughness: 1 }),
    28,
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 28; i++) {
    const angle = i * 2.39996;
    const radius = 0.1 + 0.3 * Math.sqrt(i / 28);
    dummy.position.set(Math.cos(angle) * radius, 0.765, Math.sin(angle) * radius);
    dummy.scale.set(1, 0.45, 0.7);
    dummy.updateMatrix();
    grains.setMatrixAt(i, dummy.matrix);
  }
  root.add(grains);

  const foliage = new THREE.Group();
  foliage.position.y = 0.76;
  root.add(foliage);
  const leafMaterial = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: 0.4,
    clearcoat: 0.3,
    clearcoatRoughness: 0.35,
  });
  const veinMaterial = new THREE.MeshStandardMaterial({ color: '#8fae52', roughness: 0.6 });
  const stemMaterial = new THREE.MeshStandardMaterial({ color: '#6d9b3f', roughness: 0.65 });
  const leaves: THREE.Group[] = [];
  const leafSpecs = [
    { length: 1.42, width: 0.36, lean: -0.16, turn: -0.45, depth: -0.1 },
    { length: 1.3, width: 0.4, lean: 0.52, turn: 0.7, depth: -0.1 },
    { length: 1.27, width: 0.4, lean: -0.7, turn: -0.48, depth: -0.04 },
    { length: 1.14, width: 0.38, lean: 1.03, turn: 0.1, depth: 0.08 },
    { length: 1.05, width: 0.39, lean: -1.06, turn: -0.12, depth: 0.12 },
    { length: 1.17, width: 0.34, lean: 0.2, turn: -0.15, depth: 0.17 },
    { length: 0.85, width: 0.29, lean: -0.42, turn: 0.28, depth: 0.24 },
  ];
  leafSpecs.forEach(({ length, width, lean, turn, depth }, index) => {
    const group = new THREE.Group();
    group.position.set(0, 0, depth);
    group.rotation.set(0, turn, lean);
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const dark = new THREE.Color(index < 3 ? '#123d27' : '#236431');
    const light = new THREE.Color(index < 3 ? '#63953c' : '#94c451');
    const point = (t: number, u: number) =>
      new THREE.Vector3(
        u * width * Math.pow(Math.sin(Math.PI * t), 0.8),
        0.15 + t * length,
        0.22 * Math.sin(t * Math.PI * 0.8) - 0.15 * u * u * Math.sin(t * Math.PI),
      );
    for (let y = 0; y <= 24; y++) {
      for (let x = 0; x <= 12; x++) {
        const t = y / 24;
        const u = (x / 12) * 2 - 1;
        const p = point(t, u);
        positions.push(p.x, p.y, p.z);
        const color = dark.clone().lerp(light, (1 - Math.abs(u) * 0.76) * (0.4 + t * 0.45));
        colors.push(color.r, color.g, color.b);
        if (y < 24 && x < 12) {
          const a = y * 13 + x;
          indices.push(a, a + 1, a + 13, a + 1, a + 14, a + 13);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const leaf = new THREE.Mesh(geometry, leafMaterial);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    group.add(leaf);
    const stem = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), point(0.12, 0), point(0.4, 0)]),
        12,
        0.019,
        6,
        false,
      ),
      stemMaterial,
    );
    group.add(stem);
    const tubes: THREE.BufferGeometry[] = [];
    const midrib = Array.from({ length: 13 }, (_, i) =>
      point(i / 12, 0).add(new THREE.Vector3(0, 0, 0.008)),
    );
    tubes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(midrib), 24, 0.009, 5, false));
    for (const t of [0.28, 0.45, 0.62]) {
      for (const side of [-1, 1]) {
        const points = [point(t, 0), point(t + 0.09, side * 0.4), point(t + 0.15, side * 0.86)].map(
          (p) => p.add(new THREE.Vector3(0, 0, 0.009)),
        );
        tubes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 8, 0.004, 4, false));
      }
    }
    group.add(new THREE.Mesh(mergeGeometries(tubes), veinMaterial));
    tubes.forEach((g) => {
      g.dispose();
    });
    foliage.add(group);
    leaves.push(group);
  });

  const face = new THREE.Group();
  root.add(face);
  const eyeMaterial = new THREE.MeshPhysicalMaterial({
    color: '#222c20',
    roughness: 0.14,
    clearcoat: 1,
  });
  const eyes: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.16, 0.46, 0.43);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.049, 20, 16), eyeMaterial);
    pupil.scale.set(1, 1.32, 0.56);
    eye.add(pupil);
    const glint = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 10, 8),
      new THREE.MeshBasicMaterial({ color: '#fff5da' }),
    );
    glint.position.set(-0.013, 0.024, 0.025);
    eye.add(glint);
    face.add(eye);
    eyes.push(eye);
    const cheek = new THREE.Mesh(
      new THREE.SphereGeometry(0.061, 16, 12),
      new THREE.MeshStandardMaterial({
        color: '#dc846f',
        roughness: 0.65,
        transparent: true,
        opacity: 0.66,
      }),
    );
    cheek.scale.set(1, 0.4, 0.18);
    cheek.position.set(side * 0.245, 0.35, 0.36);
    cheek.rotation.y = side * 0.5;
    face.add(cheek);
  }
  const mouth = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.07, 0.017, 0),
        new THREE.Vector3(-0.035, -0.025, 0.006),
        new THREE.Vector3(0.035, -0.025, 0.006),
        new THREE.Vector3(0.07, 0.017, 0),
      ]),
      16,
      0.012,
      8,
      false,
    ),
    eyeMaterial,
  );
  mouth.position.set(0, 0.335, 0.432);
  face.add(mouth);

  return { root, ceramic, foliage, leaves, leafSpecs, face, eyes, mouth };
};
