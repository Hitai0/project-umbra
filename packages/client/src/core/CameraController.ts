import * as THREE from 'three';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // Camera Orbit & Zoom parameters
  public distance: number = 22;
  public minDistance: number = 10;
  public maxDistance: number = 38;

  public elevationAngle: number = 0.85; // ~48 degrees
  public azimuthAngle: number = 0.0;    // rotation around Y

  private isDragging: boolean = false;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;

  constructor(domElement: HTMLElement) {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 200);

    this.setupControls(domElement);
    this.updatePosition();
  }

  private setupControls(domElement: HTMLElement) {
    domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    domElement.addEventListener('mousedown', (e) => {
      if (e.button === 2) { // Right click to rotate
        this.isDragging = true;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;

      this.azimuthAngle -= dx * 0.006;
      this.elevationAngle = Math.max(0.4, Math.min(1.3, this.elevationAngle + dy * 0.005));

      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isDragging = false;
      }
    });

    domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance + e.deltaY * 0.02));
    }, { passive: false });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  public followTarget(targetPos: THREE.Vector3, lerpFactor: number = 0.1) {
    this.target.lerp(targetPos, lerpFactor);
    this.updatePosition();
  }

  private updatePosition() {
    const x = this.target.x + this.distance * Math.sin(this.azimuthAngle) * Math.cos(this.elevationAngle);
    const y = this.target.y + this.distance * Math.sin(this.elevationAngle);
    const z = this.target.z + this.distance * Math.cos(this.azimuthAngle) * Math.cos(this.elevationAngle);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target.x, this.target.y + 0.8, this.target.z);
  }
}
