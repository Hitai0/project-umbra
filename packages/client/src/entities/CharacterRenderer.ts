import * as THREE from 'three';
import { BillboardSprite } from './BillboardSprite.js';

export class CharacterRenderer {
  public group: THREE.Group;
  public sprite: BillboardSprite;
  public overheadTag: THREE.Sprite;
  public id: string;
  public name: string;
  public isMonster: boolean;

  // Target coordinates from server
  public targetPosition: THREE.Vector3 = new THREE.Vector3();
  public isMoving: boolean = false;
  public hp: number = 100;
  public maxHp: number = 100;

  // Click Collider for raycasting
  public collider: THREE.Mesh;

  private tagCanvas: HTMLCanvasElement;
  private tagCtx: CanvasRenderingContext2D;
  private tagTexture: THREE.CanvasTexture;

  constructor(
    id: string,
    name: string,
    type: 'Novice' | 'Poring' | 'Lunatic' | 'Fabre' | 'BaphometJr',
    isMonster: boolean = false
  ) {
    this.id = id;
    this.name = name;
    this.isMonster = isMonster;
    this.group = new THREE.Group();

    // 1. Sprite
    this.sprite = new BillboardSprite(type);
    this.group.add(this.sprite.group);

    // 2. Invisible Hit Collider for Raycasting click
    const colGeo = new THREE.SphereGeometry(1.0, 8, 8);
    const colMat = new THREE.MeshBasicMaterial({ visible: false });
    this.collider = new THREE.Mesh(colGeo, colMat);
    this.collider.position.y = 0.8;
    this.collider.userData = { entityId: id, isMonster };
    this.group.add(this.collider);

    // 3. Overhead Name & Mini HP Bar Sprite
    this.tagCanvas = document.createElement('canvas');
    this.tagCanvas.width = 128;
    this.tagCanvas.height = 32;
    this.tagCtx = this.tagCanvas.getContext('2d')!;

    this.tagTexture = new THREE.CanvasTexture(this.tagCanvas);
    this.tagTexture.magFilter = THREE.NearestFilter;
    this.tagTexture.minFilter = THREE.NearestFilter;

    const tagMat = new THREE.SpriteMaterial({
      map: this.tagTexture,
      transparent: true,
      depthTest: false
    });
    this.overheadTag = new THREE.Sprite(tagMat);
    this.overheadTag.position.y = isMonster ? 1.4 : 1.9;
    this.overheadTag.scale.set(2.0, 0.5, 1.0);
    this.group.add(this.overheadTag);

    this.updateOverheadTag();
  }

  public updateHealth(hp: number, maxHp: number) {
    this.hp = hp;
    this.maxHp = maxHp;
    this.updateOverheadTag();
  }

  private updateOverheadTag() {
    const ctx = this.tagCtx;
    ctx.clearRect(0, 0, 128, 32);

    // Name text
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Shadow / outline
    ctx.fillStyle = '#000000';
    ctx.fillText(this.name, 65, 3);
    ctx.fillText(this.name, 63, 1);

    // Fill
    ctx.fillStyle = this.isMonster ? '#ffdd88' : '#ffffff';
    ctx.fillText(this.name, 64, 2);

    // Mini HP Bar (Ragnarok-style green/red bar)
    const barWidth = 60;
    const barHeight = 4;
    const barX = (128 - barWidth) / 2;
    const barY = 20;

    // Background
    ctx.fillStyle = '#111111';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    // Fill
    const pct = Math.max(0, Math.min(1, this.hp / this.maxHp));
    ctx.fillStyle = this.isMonster ? '#e63946' : '#55c500';
    ctx.fillRect(barX, barY, barWidth * pct, barHeight);

    this.tagTexture.needsUpdate = true;
  }

  public update(camera: THREE.Camera, time: number) {
    // Smooth position interpolation
    this.group.position.lerp(this.targetPosition, 0.25);

    // Update sprite billboard & bobbing
    this.sprite.update(camera, this.isMoving, time);
  }
}
