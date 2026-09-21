import * as THREE from 'three';

export class Lighting {
  public sunLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public torches: Array<{ light: THREE.PointLight; mesh: THREE.Mesh; baseIntensity: number }> = [];

  constructor(scene: THREE.Scene) {
    // 1. Warm Ambient Light (Soft sky bounce)
    this.ambientLight = new THREE.AmbientLight(0xd4e2f5, 0.65);
    scene.add(this.ambientLight);

    // 2. Warm Sun Light (Directional with Shadows)
    this.sunLight = new THREE.DirectionalLight(0xfff1d0, 1.4);
    this.sunLight.position.set(25, 40, 20);
    this.sunLight.castShadow = true;

    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 100;

    const shadowDist = 35;
    this.sunLight.shadow.camera.left = -shadowDist;
    this.sunLight.shadow.camera.right = shadowDist;
    this.sunLight.shadow.camera.top = shadowDist;
    this.sunLight.shadow.camera.bottom = -shadowDist;
    this.sunLight.shadow.bias = -0.0005;

    scene.add(this.sunLight);

    // 3. Torches / Lanterns with Warm Point Lights
    this.createTorch(scene, -12, 4.4, -8);
    this.createTorch(scene, 12, 4.4, -8);
    this.createTorch(scene, -12, 4.4, 16);
    this.createTorch(scene, 12, 4.4, 16);
  }

  private createTorch(scene: THREE.Scene, x: number, y: number, z: number) {
    // Glowing Flame mesh
    const flameGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa22 });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.set(x, y, z);
    scene.add(flameMesh);

    // Point Light
    const pointLight = new THREE.PointLight(0xff7711, 2.5, 16, 1.5);
    pointLight.position.set(x, y + 0.1, z);
    pointLight.castShadow = true;
    pointLight.shadow.bias = -0.002;
    scene.add(pointLight);

    this.torches.push({
      light: pointLight,
      mesh: flameMesh,
      baseIntensity: 2.5
    });
  }

  public update(time: number) {
    // Dynamic torch light flicker
    for (let i = 0; i < this.torches.length; i++) {
      const torch = this.torches[i];
      const flicker = Math.sin(time * 8 + i * 2) * 0.25 + Math.cos(time * 15 + i) * 0.15;
      torch.light.intensity = torch.baseIntensity + flicker;
      const scale = 1 + flicker * 0.3;
      torch.mesh.scale.set(scale, scale, scale);
    }
  }
}
