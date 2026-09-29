import * as THREE from 'three';

/** Curved, double-sided leaves with modeled ribs, rather than billboard images. */
function leafSurface(length: number, width: number) {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const rows = 32;
  const columns = 12;
  const point = (t: number, u: number) => {
    const profile = Math.pow(Math.sin(Math.PI * t), 0.78);
    return new THREE.Vector3(
      u * width * profile,
      t * length,
      0.35 * length * t * t +
        Math.abs(u) ** 1.6 * profile * 0.22 +
        Math.sin(t * 45 + Math.abs(u) * 3) * Math.abs(u) * profile * 0.006,
    );
  };
  const color = new THREE.Color();
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    for (let column = 0; column <= columns; column++) {
      const u = (column / columns) * 2 - 1;
      positions.push(...point(t, u).toArray());
      const stripe = Math.pow(Math.max(0, Math.cos(t * 48 - Math.abs(u) * 7)), 8);
      color.setHSL(
        0.28 + Math.abs(u) * 0.045,
        0.55,
        0.13 + stripe * 0.04 + (1 - Math.abs(u)) * 0.035,
      );
      colors.push(color.r, color.g, color.b);
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column;
        indices.push(a, a + 1, a + columns + 1, a + 1, a + columns + 2, a + columns + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return { geometry, point };
}

export function createBotanicalModel() {
  const world = new THREE.Group();
  const foliage = new THREE.Group();
  foliage.position.y = 0.5;
  world.add(foliage);
  const leaves: THREE.Group[] = [];
  const leafMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: 0.5,
    metalness: 0.03,
  });
  const stemMaterial = new THREE.MeshStandardMaterial({ color: '#526633', roughness: 0.55 });
  const veinMaterial = new THREE.MeshStandardMaterial({ color: '#8b9b53', roughness: 0.5 });
  for (let i = 0; i < 17; i++) {
    const branch = new THREE.Group();
    branch.rotation.y = i * 2.39996;
    const tier = i / 16;
    const height = 0.65 + tier * 1.1;
    const radius = 0.38 + (1 - tier) * 0.34;
    const stem = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, height * 0.6, radius * 0.23),
      new THREE.Vector3(0, height, radius),
    ]);
    branch.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(stem, 16, 0.018 - tier * 0.005, 6, false),
        stemMaterial,
      ),
    );
    const leaf = new THREE.Group();
    leaf.position.set(0, height, radius);
    leaf.rotation.x = 1.25 - tier * 1.0;
    const surface = leafSurface(1.05 + tier * 0.28, 0.36 + (1 - tier) * 0.08);
    const mesh = new THREE.Mesh(surface.geometry, leafMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    leaf.add(mesh);
    const midrib = Array.from({ length: 24 }, (_, j) =>
      surface.point(j / 23, 0).add(new THREE.Vector3(0, 0, 0.009)),
    );
    leaf.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(midrib), 24, 0.007, 5, false),
        veinMaterial,
      ),
    );
    branch.add(leaf);
    foliage.add(branch);
    leaves.push(branch);
  }

  // A closed ceramic shell with a rolled rim and a separate soil surface.
  const profile = [
    [0, 0],
    [0.45, 0],
    [0.72, 0.08],
    [0.96, 0.25],
    [1.08, 0.46],
    [1.09, 0.53],
    [1.06, 0.55],
    [1.02, 0.53],
    [0.98, 0.4],
    [0.8, 0.2],
    [0, 0.15],
  ].map(([x = 0, y = 0]) => new THREE.Vector2(x, y));
  const bowl = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 80),
    new THREE.MeshStandardMaterial({ color: '#e0decb', roughness: 0.28, metalness: 0.08 }),
  );
  bowl.castShadow = true;
  bowl.receiveShadow = true;
  world.add(bowl);
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(1.025, 1.025, 0.07, 64),
    new THREE.MeshStandardMaterial({ color: '#29231b', roughness: 1 }),
  );
  soil.position.y = 0.46;
  soil.receiveShadow = true;
  world.add(soil);
  const pebbleMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.88 });
  const pebbleGeometry = new THREE.IcosahedronGeometry(1, 2);
  const pebbles = new THREE.InstancedMesh(pebbleGeometry, pebbleMaterial, 95);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 95; i++) {
    const angle = i * 2.39996;
    const radius = Math.sqrt((i + 1) / 95) * 0.97;
    const size = i < 3 ? 0.2 : 0.025 + (Math.sin(i * 34) + 1) * 0.018;
    dummy.position.set(Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius);
    if (i < 3) dummy.position.set(Math.cos(angle) * 0.69, 0.54, Math.sin(angle) * 0.69);
    dummy.scale.set(size * 1.3, size * 0.65, size);
    dummy.rotation.set(i, i * 0.5, i * 0.3);
    dummy.updateMatrix();
    pebbles.setMatrixAt(i, dummy.matrix);
    pebbles.setColorAt(i, new THREE.Color(i < 3 ? '#72776a' : '#3c3325'));
  }
  pebbles.castShadow = true;
  world.add(pebbles);
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.48, 0.006, 6, 128),
    new THREE.MeshBasicMaterial({ color: '#c9df9a', transparent: true, opacity: 0.65 }),
  );
  orbit.rotation.x = Math.PI / 2;
  orbit.position.y = -0.2;
  world.add(orbit);
  return { world, foliage, leaves, leafMaterial };
}
