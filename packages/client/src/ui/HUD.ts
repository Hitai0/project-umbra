export class HUD {
  private playerNameEl: HTMLElement;
  private playerJobEl: HTMLElement;
  private baseLevelEl: HTMLElement;
  private jobLevelEl: HTMLElement;
  private hpBarEl: HTMLElement;
  private hpTextEl: HTMLElement;
  private spBarEl: HTMLElement;
  private spTextEl: HTMLElement;

  private targetWindowEl: HTMLElement;
  private targetNameEl: HTMLElement;
  private targetHpBarEl: HTMLElement;
  private targetHpTextEl: HTMLElement;

  private pingTextEl: HTMLElement;

  constructor() {
    this.playerNameEl = document.getElementById('player-name')!;
    this.playerJobEl = document.getElementById('player-job')!;
    this.baseLevelEl = document.getElementById('base-level')!;
    this.jobLevelEl = document.getElementById('job-level')!;
    this.hpBarEl = document.getElementById('hp-bar')!;
    this.hpTextEl = document.getElementById('hp-text')!;
    this.spBarEl = document.getElementById('sp-bar')!;
    this.spTextEl = document.getElementById('sp-text')!;

    this.targetWindowEl = document.getElementById('target-window')!;
    this.targetNameEl = document.getElementById('target-name')!;
    this.targetHpBarEl = document.getElementById('target-hp-bar')!;
    this.targetHpTextEl = document.getElementById('target-hp-text')!;

    this.pingTextEl = document.getElementById('ping-text')!;
  }

  public updatePlayerInfo(name: string, job: string, baseLv: number, jobLv: number) {
    if (this.playerNameEl) this.playerNameEl.textContent = name;
    if (this.playerJobEl) this.playerJobEl.textContent = `[${job}]`;
    if (this.baseLevelEl) this.baseLevelEl.textContent = `${baseLv}`;
    if (this.jobLevelEl) this.jobLevelEl.textContent = `${jobLv}`;
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

  public updatePing(ms: number) {
    if (this.pingTextEl) this.pingTextEl.textContent = `Ping: ${ms} ms`;
  }
}
