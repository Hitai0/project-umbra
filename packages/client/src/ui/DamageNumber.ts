import * as THREE from 'three';

export class DamageNumberManager {
  private container: HTMLElement;
  private camera: THREE.Camera;

  constructor(container: HTMLElement, camera: THREE.Camera) {
    this.container = container;
    this.camera = camera;
  }

  public showDamage(
    x: number,
    y: number,
    z: number,
    damage: number,
    isCrit: boolean = false,
    isPlayerHurt: boolean = false
  ) {
    const screenPos = this.worldToScreen(x, y, z);
    if (!screenPos) return;

    // Randomize initial offset slightly
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 15;

    const el = document.createElement('div');
    el.className = `damage-number ${isCrit ? 'crit' : ''} ${isPlayerHurt ? 'player-hurt' : ''}`;
    el.textContent = isCrit ? `${damage}!` : `${damage}`;
    el.style.left = `${screenPos.x + offsetX}px`;
    el.style.top = `${screenPos.y + offsetY}px`;

    this.container.appendChild(el);

    // Remove element after animation ends
    setTimeout(() => {
      if (el.parentNode === this.container) {
        this.container.removeChild(el);
      }
    }, 850);
  }

  private worldToScreen(x: number, y: number, z: number): { x: number; y: number } | null {
    const vector = new THREE.Vector3(x, y, z);
    vector.project(this.camera);

    // Check if behind camera
    if (vector.z > 1) return null;

    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;

    return {
      x: vector.x * widthHalf + widthHalf,
      y: -(vector.y * heightHalf) + heightHalf
    };
  }
}
