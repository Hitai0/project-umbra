import * as THREE from 'three';

export class Terrain {
  public mesh: THREE.Mesh;
  public gridHelper: THREE.GridHelper;
  public environmentGroup: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.environmentGroup = new THREE.Group();

    // 1. Procedural Stylized Grass & Cobblestone Texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base Grass Green
    ctx.fillStyle = '#4c8c2b';
    ctx.fillRect(0, 0, 512, 512);

    // Pixelated noise / tile variation
    for (let x = 0; x < 512; x += 16) {
      for (let y = 0; y < 512; y += 16) {
        const shade = Math.floor((Math.random() - 0.5) * 30);
        const r = Math.min(255, Math.max(0, 76 + shade));
        const g = Math.min(255, Math.max(0, 140 + shade * 1.5));
        const b = Math.min(255, Math.max(0, 43 + shade));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 16, 16);
      }
    }

    // Cobblestone path in center
    ctx.fillStyle = '#9e8c6c';
    for (let y = 0; y < 512; y += 16) {
      const offsetX = Math.floor(Math.sin(y / 40) * 20);
      for (let x = 220 + offsetX; x < 290 + offsetX; x += 16) {
        const shade = Math.floor((Math.random() - 0.5) * 25);
        ctx.fillStyle = `rgb(${158 + shade},${140 + shade},${108 + shade})`;
        ctx.fillRect(x, y, 16, 16);
        ctx.strokeStyle = '#5a4d38';
        ctx.strokeRect(x, y, 16, 16);
      }
    }

    const groundTexture = new THREE.CanvasTexture(canvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(8, 8);
    groundTexture.magFilter = THREE.NearestFilter; // Sharp pixelated look
    groundTexture.minFilter = THREE.NearestFilter;

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.85,
      metalness: 0.1
    });

    this.mesh = new THREE.Mesh(groundGeo, groundMat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    // RO-style subtle grid overlay
    this.gridHelper = new THREE.GridHelper(80, 40, 0x3d6e24, 0x386121);
    this.gridHelper.position.y = 0.01;
    scene.add(this.gridHelper);

    // 2. Add Stylized 3D Props (Trees, Ruins, Lanterns)
    this.createEnvironmentProps();
    scene.add(this.environmentGroup);
  }

  private createEnvironmentProps() {
    // Stylized Low-Poly Trees
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + (Math.random() * 0.2);
      const radius = 22 + Math.random() * 12;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      this.createTree(x, z);
    }

    // Prontera Stone Pillars
    this.createStonePillar(-12, -8);
    this.createStonePillar(12, -8);
    this.createStonePillar(-12, 16);
    this.createStonePillar(12, 16);
  }

  private createTree(x: number, z: number) {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 2.5, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Foliage (Stacked Low-Poly Cones)
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x2e6f24,
      roughness: 0.8,
      flatShading: true
    });

    const f1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.2, 7), foliageMat);
    f1.position.y = 2.8;
    f1.castShadow = true;
    tree.add(f1);

    const f2 = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.9, 7), foliageMat);
    f2.position.y = 4.0;
    f2.castShadow = true;
    tree.add(f2);

    const scale = 0.8 + Math.random() * 0.5;
    tree.scale.set(scale, scale, scale);
    tree.position.set(x, 0, z);

    this.environmentGroup.add(tree);
  }

  private createStonePillar(x: number, z: number) {
    const pillar = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xb8ad9c,
      roughness: 0.9,
      flatShading: true
    });

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), pillarMat);
    base.position.y = 0.3;
    base.castShadow = true;
    pillar.add(base);

    // Column
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.5, 8), pillarMat);
    col.position.y = 2.05;
    col.castShadow = true;
    pillar.add(col);

    // Top
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.2), pillarMat);
    top.position.y = 4.05;
    top.castShadow = true;
    pillar.add(top);

    pillar.position.set(x, 0, z);
    this.environmentGroup.add(pillar);
  }
}
