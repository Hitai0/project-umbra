import * as THREE from 'three';

export type SpriteAnimation = 'idle' | 'walk' | 'attack' | 'dead';

export class BillboardSprite {
  public group: THREE.Group;
  public mesh: THREE.Mesh;
  public shadowMesh: THREE.Mesh;
  private material: THREE.MeshStandardMaterial;

  constructor(type: 'Novice' | 'Poring' | 'Lunatic' | 'Fabre' | 'BaphometJr') {
    this.group = new THREE.Group();

    // 1. Generate Procedural Pixel Art & Normal Map
    const { diffuseTex, normalTex, width, height } = this.generateSpriteTextures(type);

    // 2. 3D Plane Mesh for 2D Sprite
    const geo = new THREE.PlaneGeometry(width, height);
    this.material = new THREE.MeshStandardMaterial({
      map: diffuseTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(0.8, 0.8),
      transparent: true,
      alphaTest: 0.1,
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.y = height / 2;
    this.mesh.castShadow = true;
    this.group.add(this.mesh);

    // 3. RO-Style Elliptical Floor Shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(32, 32, 4, 32, 32, 28);
    grad.addColorStop(0, 'rgba(0,0,0,0.5)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(width * 0.9, width * 0.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });

    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);
  }

  public update(camera: THREE.Camera, isMoving: boolean = false, time: number = 0) {
    // Face the camera (Billboard behavior)
    this.mesh.quaternion.copy(camera.quaternion);

    // Subtle bobbing animation (RO-style walk / idle breathing)
    if (isMoving) {
      const bob = Math.abs(Math.sin(time * 12)) * 0.12;
      this.mesh.position.y = (this.mesh.geometry as THREE.PlaneGeometry).parameters.height / 2 + bob;
    } else {
      const breathe = Math.sin(time * 3) * 0.03;
      this.mesh.position.y = (this.mesh.geometry as THREE.PlaneGeometry).parameters.height / 2 + breathe;
    }
  }

  private generateSpriteTextures(type: string): {
    diffuseTex: THREE.CanvasTexture;
    normalTex: THREE.CanvasTexture;
    width: number;
    height: number;
  } {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    let width = 1.4;
    let height = 1.6;

    if (type === 'Poring') {
      width = 1.2;
      height = 1.1;
      this.drawPoring(ctx);
    } else if (type === 'Lunatic') {
      width = 1.2;
      height = 1.3;
      this.drawLunatic(ctx);
    } else if (type === 'BaphometJr') {
      width = 2.0;
      height = 2.2;
      this.drawBaphomet(ctx);
    } else {
      // Default: Novice Swordsman
      this.drawNovice(ctx);
    }

    const diffuseTex = new THREE.CanvasTexture(canvas);
    diffuseTex.magFilter = THREE.NearestFilter;
    diffuseTex.minFilter = THREE.NearestFilter;

    // Generate Normal Map from sprite alpha and luminance
    const normalCanvas = this.generateNormalMap(canvas);
    const normalTex = new THREE.CanvasTexture(normalCanvas);
    normalTex.magFilter = THREE.NearestFilter;
    normalTex.minFilter = THREE.NearestFilter;

    return { diffuseTex, normalTex, width, height };
  }

  // Draw Ragnarok Novice Swordsman Pixel Art
  private drawNovice(ctx: CanvasRenderingContext2D) {
    // Hair (Spiky Brown)
    ctx.fillStyle = '#b86a24';
    ctx.fillRect(24, 8, 16, 8);
    ctx.fillRect(20, 12, 24, 6);

    // Face / Skin
    ctx.fillStyle = '#fce2c4';
    ctx.fillRect(24, 16, 16, 12);
    // Eyes
    ctx.fillStyle = '#211306';
    ctx.fillRect(26, 20, 3, 4);
    ctx.fillRect(35, 20, 3, 4);

    // Shirt (Novice blue & white cloth)
    ctx.fillStyle = '#2d68c4';
    ctx.fillRect(22, 28, 20, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(28, 28, 8, 16);

    // Leather Belt & Sheath
    ctx.fillStyle = '#6e451b';
    ctx.fillRect(22, 42, 20, 4);

    // Pants / Boots
    ctx.fillStyle = '#3a3328';
    ctx.fillRect(24, 46, 7, 10);
    ctx.fillRect(33, 46, 7, 10);

    // Dagger / Sword at side
    ctx.fillStyle = '#d6d6d6';
    ctx.fillRect(16, 32, 4, 18);
    ctx.fillStyle = '#b38827';
    ctx.fillRect(14, 32, 8, 3);
  }

  // Draw Ragnarok Poring Pixel Art
  private drawPoring(ctx: CanvasRenderingContext2D) {
    // Cute Pink Slime Body
    ctx.fillStyle = '#ff7597';
    ctx.beginPath();
    ctx.arc(32, 38, 20, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#ffaec0';
    ctx.beginPath();
    ctx.arc(26, 28, 6, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#220810';
    ctx.beginPath();
    ctx.arc(25, 36, 3.5, 0, Math.PI * 2);
    ctx.arc(39, 36, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(24, 34, 2, 2);
    ctx.fillRect(38, 34, 2, 2);

    // Cute blush
    ctx.fillStyle = '#e8486f';
    ctx.fillRect(20, 41, 5, 2);
    ctx.fillRect(39, 41, 5, 2);
  }

  // Draw Lunatic (White Bunny)
  private drawLunatic(ctx: CanvasRenderingContext2D) {
    // Long Ears
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(22, 6, 6, 16);
    ctx.fillRect(36, 6, 6, 16);
    ctx.fillStyle = '#ffb3c1';
    ctx.fillRect(24, 8, 2, 12);
    ctx.fillRect(38, 8, 2, 12);

    // Body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(32, 36, 18, 0, Math.PI * 2);
    ctx.fill();

    // Red Eyes
    ctx.fillStyle = '#cc0029';
    ctx.fillRect(25, 30, 4, 4);
    ctx.fillRect(35, 30, 4, 4);
  }

  // Draw Baphomet Jr (Small Demon with Horns)
  private drawBaphomet(ctx: CanvasRenderingContext2D) {
    // Horns
    ctx.fillStyle = '#8b2500';
    ctx.fillRect(16, 8, 8, 12);
    ctx.fillRect(40, 8, 8, 12);

    // Dark Body
    ctx.fillStyle = '#382b3d';
    ctx.beginPath();
    ctx.arc(32, 34, 18, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Yellow Eyes
    ctx.fillStyle = '#ffe600';
    ctx.fillRect(24, 28, 5, 4);
    ctx.fillRect(35, 28, 5, 4);

    // Small Wings
    ctx.fillStyle = '#1e1424';
    ctx.fillRect(8, 24, 10, 14);
    ctx.fillRect(46, 24, 10, 14);
  }

  private generateNormalMap(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const srcCtx = sourceCanvas.getContext('2d')!;
    const srcData = srcCtx.getImageData(0, 0, width, height).data;

    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = width;
    normalCanvas.height = height;
    const nCtx = normalCanvas.getContext('2d')!;
    const nImgData = nCtx.createImageData(width, height);
    const nData = nImgData.data;

    // Sobel-like filter for bump to normal map
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const alpha = srcData[idx + 3];

        if (alpha < 20) {
          // Transparent
          nData[idx] = 128;
          nData[idx + 1] = 128;
          nData[idx + 2] = 255;
          nData[idx + 3] = 0;
          continue;
        }

        // Height based on luminance
        const getH = (px: number, py: number) => {
          const i = (py * width + px) * 4;
          return (srcData[i] + srcData[i + 1] + srcData[i + 2]) / 765;
        };

        const dx = (getH(x + 1, y) - getH(x - 1, y)) * 1.5;
        const dy = (getH(x, y + 1) - getH(x, y - 1)) * 1.5;

        // Normal vector (dx, dy, 1.0) normalized
        const len = Math.sqrt(dx * dx + dy * dy + 1.0);
        const nx = (-dx / len) * 0.5 + 0.5;
        const ny = (-dy / len) * 0.5 + 0.5;
        const nz = (1.0 / len) * 0.5 + 0.5;

        nData[idx] = Math.floor(nx * 255);
        nData[idx + 1] = Math.floor(ny * 255);
        nData[idx + 2] = Math.floor(nz * 255);
        nData[idx + 3] = alpha;
      }
    }

    nCtx.putImageData(nImgData, 0, 0);
    return normalCanvas;
  }
}
