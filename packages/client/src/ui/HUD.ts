import * as THREE from 'three';

export class HUD {
  private playerNameEl: HTMLElement;
  private playerLevelEl: HTMLElement;
  private hpBarEl: HTMLElement;
  private hpTextEl: HTMLElement;
  private spBarEl: HTMLElement;
  private spTextEl: HTMLElement;

  private targetWindowEl: HTMLElement;
  private targetNameEl: HTMLElement;
  private targetHpBarEl: HTMLElement;
  private targetHpTextEl: HTMLElement;

  private avatarCanvas: HTMLCanvasElement;
  private avatarCtx: CanvasRenderingContext2D;

  private minimapCanvas: HTMLCanvasElement;
  private minimapCtx: CanvasRenderingContext2D;

  constructor() {
    this.playerNameEl = document.getElementById('player-name')!;
    this.playerLevelEl = document.getElementById('player-level-badge')!;
    this.hpBarEl = document.getElementById('hp-bar')!;
    this.hpTextEl = document.getElementById('hp-text')!;
    this.spBarEl = document.getElementById('sp-bar')!;
    this.spTextEl = document.getElementById('sp-text')!;

    this.targetWindowEl = document.getElementById('target-window')!;
    this.targetNameEl = document.getElementById('target-name')!;
    this.targetHpBarEl = document.getElementById('target-hp-bar')!;
    this.targetHpTextEl = document.getElementById('target-hp-text')!;

    this.avatarCanvas = document.getElementById('avatar-canvas') as HTMLCanvasElement;
    this.avatarCtx = this.avatarCanvas ? this.avatarCanvas.getContext('2d')! : null!;

    this.minimapCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d')! : null!;

    this.drawAvatarPortrait();
  }

  public updatePlayerInfo(name: string, _job: string, baseLv: number, _jobLv: number) {
    if (this.playerNameEl) this.playerNameEl.textContent = name;
    if (this.playerLevelEl) this.playerLevelEl.textContent = `Lv. ${baseLv}`;
  }

  public updatePlayerStats(hp: number, maxHp: number, sp: number, maxSp: number) {
    const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    const spPct = Math.max(0, Math.min(100, (sp / maxSp) * 100));

    if (this.hpBarEl) this.hpBarEl.style.width = `${hpPct}%`;
    if (this.hpTextEl) this.hpTextEl.textContent = `${hp} / ${maxHp}`;

    if (this.spBarEl) this.spBarEl.style.width = `${spPct}%`;
    if (this.spTextEl) this.spTextEl.textContent = `${sp} / ${maxSp}`;
  }

  public showTarget(name: string, hp: number, maxHp: number) {
    if (!this.targetWindowEl) return;
    this.targetWindowEl.style.display = 'block';
    if (this.targetNameEl) this.targetNameEl.textContent = name;
    this.updateTargetHp(hp, maxHp);
  }

  public updateTargetHp(hp: number, maxHp: number) {
    const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    if (this.targetHpBarEl) this.targetHpBarEl.style.width = `${pct}%`;
    if (this.targetHpTextEl) this.targetHpTextEl.textContent = `${hp} / ${maxHp}`;
  }

  public hideTarget() {
    if (this.targetWindowEl) this.targetWindowEl.style.display = 'none';
  }

  // Draw crisp pixel art character bust in hexagonal frame (Arin style)
  private drawAvatarPortrait() {
    if (!this.avatarCtx) return;
    const ctx = this.avatarCtx;
    ctx.imageSmoothingEnabled = false;

    // Background fill
    ctx.fillStyle = '#1c2838';
    ctx.fillRect(0, 0, 48, 48);

    // Hair (Spiky Brown)
    ctx.fillStyle = '#a05820';
    ctx.fillRect(16, 6, 16, 10);
    ctx.fillRect(12, 10, 24, 8);
    ctx.fillRect(8, 14, 8, 8);
    ctx.fillRect(32, 14, 8, 8);

    // Face
    ctx.fillStyle = '#fce4c8';
    ctx.fillRect(16, 16, 16, 14);

    // Eyes
    ctx.fillStyle = '#1d1208';
    ctx.fillRect(18, 20, 3, 4);
    ctx.fillRect(27, 20, 3, 4);

    // Armor / Cape (Blue & Steel)
    ctx.fillStyle = '#2b64b8';
    ctx.fillRect(10, 30, 28, 18);
    ctx.fillStyle = '#d8e2ed';
    ctx.fillRect(20, 30, 8, 18);
    ctx.fillStyle = '#c5a045';
    ctx.fillRect(12, 36, 6, 6);
    ctx.fillRect(30, 36, 6, 6);
  }

  // Draw real-time circular radar minimap
  public updateMinimap(
    playerPos: THREE.Vector3,
    monsters: Map<string, any>,
    players: Map<string, any>,
    cameraAngle: number
  ) {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const size = 130;
    const center = size / 2;
    const scale = 2.4; // 1 unit in 3D = 2.4px on radar

    ctx.clearRect(0, 0, size, size);

    // Circular radar clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.clip();

    // Dark fantasy topography background
    ctx.fillStyle = '#111822';
    ctx.fillRect(0, 0, size, size);

    // Grid circles
    ctx.strokeStyle = 'rgba(201, 164, 76, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, Math.PI * 2);
    ctx.arc(center, center, 44, 0, Math.PI * 2);
    ctx.stroke();

    // Cross lines
    ctx.beginPath();
    ctx.moveTo(center, 4);
    ctx.lineTo(center, size - 4);
    ctx.moveTo(4, center);
    ctx.lineTo(size - 4, center);
    ctx.stroke();

    // Draw Monsters (Glowing Red / Amber dots)
    monsters.forEach((mob) => {
      if (mob.hp <= 0) return;
      const dx = (mob.group.position.x - playerPos.x) * scale;
      const dz = (mob.group.position.z - playerPos.z) * scale;
      const mx = center + dx;
      const my = center + dz;

      // Draw inside radar circle
      const distSq = dx * dx + dz * dz;
      if (distSq < (center - 6) * (center - 6)) {
        ctx.fillStyle = '#ff4757';
        ctx.shadowColor = '#ff4757';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw Other Players (Cyan dots)
    players.forEach((other) => {
      if (other.group.position.equals(playerPos)) return;
      const dx = (other.group.position.x - playerPos.x) * scale;
      const dz = (other.group.position.z - playerPos.z) * scale;
      const px = center + dx;
      const py = center + dz;

      const distSq = dx * dx + dz * dz;
      if (distSq < (center - 6) * (center - 6)) {
        ctx.fillStyle = '#2ed573';
        ctx.shadowColor = '#2ed573';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw Local Player (Golden Diamond + View Cone)
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-cameraAngle);

    // View FOV Cone
    ctx.fillStyle = 'rgba(255, 222, 138, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 32, -Math.PI / 4, Math.PI / 4);
    ctx.closePath();
    ctx.fill();

    // Player Golden Marker
    ctx.fillStyle = '#ffd152';
    ctx.shadowColor = '#ffd152';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(4, 4);
    ctx.lineTo(0, 2);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();
  }
}
