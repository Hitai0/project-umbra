import * as THREE from 'three';
import { CameraController } from './CameraController.js';
import { Lighting } from '../world/Lighting.js';
import { Terrain } from '../world/Terrain.js';
import { HD2DPostProcessing } from './PostProcessing.js';
import { CharacterRenderer } from '../entities/CharacterRenderer.js';
import { NetworkManager } from '../network/NetworkManager.js';
import { HUD } from '../ui/HUD.js';
import { ChatBox } from '../ui/ChatBox.js';
import { DamageNumberManager } from '../ui/DamageNumber.js';
import { DamageEventPayload } from '@mmo/shared';

export class Game {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public cameraController: CameraController;
  public lighting: Lighting;
  public terrain: Terrain;
  public postProcessing: HD2DPostProcessing;

  public hud: HUD;
  public chatBox: ChatBox;
  public damageManager: DamageNumberManager;
  public network: NetworkManager;

  // Entities
  public players = new Map<string, CharacterRenderer>();
  public monsters = new Map<string, CharacterRenderer>();
  public currentTargetId: string = '';

  // Raycaster & Input
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private clickRing: THREE.Mesh;
  private ringAnimation: { active: boolean; scale: number; opacity: number } = { active: false, scale: 1, opacity: 0 };

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c141f);
    this.scene.fog = new THREE.FogExp2(0x0c141f, 0.015);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 3. Camera, Terrain, Lighting, PostProcessing
    this.cameraController = new CameraController(this.renderer.domElement);
    this.terrain = new Terrain(this.scene);
    this.lighting = new Lighting(this.scene);
    this.postProcessing = new HD2DPostProcessing(this.renderer, this.scene, this.cameraController.camera);

    // 4. UI Systems
    this.hud = new HUD();
    this.damageManager = new DamageNumberManager(
      document.getElementById('damage-container')!,
      this.cameraController.camera
    );
    this.chatBox = new ChatBox((text) => this.network.sendChatMessage(text));

    // 5. Ragnarok Click Marker Ring
    const ringGeo = new THREE.RingGeometry(0.3, 0.45, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x66ff66,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    this.clickRing = new THREE.Mesh(ringGeo, ringMat);
    this.clickRing.rotation.x = -Math.PI / 2;
    this.clickRing.position.y = 0.03;
    this.scene.add(this.clickRing);

    // 6. Network Manager setup
    const defaultHost = window.location.hostname || 'localhost';
    const defaultServerUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${defaultHost}:2567`;
    const serverUrl = (import.meta.env.VITE_SERVER_URL as string) || defaultServerUrl;

    this.network = new NetworkManager(serverUrl, {
      onConnected: (sessionId) => {
        console.log(`Connected with session ID: ${sessionId}`);
      },
      onPlayerAdd: (player, sessionId) => {
        this.addPlayer(sessionId, player);
      },
      onPlayerRemove: (sessionId) => {
        this.removePlayer(sessionId);
      },
      onPlayerChange: (player, sessionId) => {
        this.updatePlayer(sessionId, player);
      },
      onMonsterAdd: (monster, id) => {
        this.addMonster(id, monster);
      },
      onMonsterRemove: (id) => {
        this.removeMonster(id);
      },
      onMonsterChange: (monster, id) => {
        this.updateMonster(id, monster);
      },
      onDamageEvent: (data) => {
        this.handleDamageEvent(data);
      },
      onChatMessage: (data) => {
        this.chatBox.addMessage(data);
      }
    });

    // 7. Event Listeners
    this.setupInteractions();
    window.addEventListener('resize', () => this.onResize());

    // 8. Spawn local player representation immediately for 0-latency experience
    this.spawnLocalPlayer();

    // 9. Start Loop
    this.animate(0);

    // 10. Connect to server
    const randomNum = Math.floor(100 + Math.random() * 900);
    this.network.connect(`Arin_${randomNum}`);
  }

  private spawnLocalPlayer() {
    const defaultId = 'local_player';
    if (!this.players.has(defaultId)) {
      const char = new CharacterRenderer(defaultId, 'Arin', 'Novice', false);
      char.group.position.set(0, 0, 0);
      char.targetPosition.set(0, 0, 0);
      char.updateHealth(458, 458);
      this.scene.add(char.group);
      this.players.set(defaultId, char);
      this.hud.updatePlayerInfo('Arin', 'Novice', 12, 1);
      this.hud.updatePlayerStats(458, 458, 72, 72);
      this.cameraController.target.set(0, 0, 0);
    }
  }

  private setupInteractions() {
    this.renderer.domElement.addEventListener('pointerdown', (e) => {
      // Only handle Left Click for gameplay
      if (e.button !== 0) return;

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.cameraController.camera);

      // Check if clicking on any monster collider
      const colliders: THREE.Mesh[] = [];
      this.monsters.forEach((mob) => colliders.push(mob.collider));

      const mobHits = this.raycaster.intersectObjects(colliders, false);
      if (mobHits.length > 0) {
        const hit = mobHits[0];
        const mobId = hit.object.userData.entityId;
        const monster = this.monsters.get(mobId);

        if (monster && monster.hp > 0) {
          this.currentTargetId = mobId;
          this.hud.showTarget(monster.name, monster.hp, monster.maxHp);
          this.network.sendAttackTarget(mobId);
          return;
        }
      }

      // Check if clicking on ground plane
      const groundHits = this.raycaster.intersectObject(this.terrain.mesh, false);
      if (groundHits.length > 0) {
        const point = groundHits[0].point;

        // Show click marker ring
        this.clickRing.position.x = point.x;
        this.clickRing.position.z = point.z;
        this.ringAnimation = { active: true, scale: 0.5, opacity: 1.0 };

        // Clear target if clicking elsewhere
        this.currentTargetId = '';
        this.hud.hideTarget();

        // Send move to server or move local directly
        if (this.network.room) {
          this.network.sendMoveTo(point.x, point.z);
        } else {
          const local = this.players.get('local_player');
          if (local) {
            local.targetPosition.set(point.x, 0, point.z);
            local.isMoving = true;
          }
        }
      }
    });

    // Action Bar buttons
    document.getElementById('btn-attack')?.addEventListener('click', () => {
      if (this.currentTargetId) {
        this.network.sendAttackTarget(this.currentTargetId);
      }
    });

    document.getElementById('btn-emote')?.addEventListener('click', () => {
      this.network.sendChatMessage('/lv ❤️');
    });
  }

  private addPlayer(sessionId: string, player: any) {
    const isLocal = sessionId === this.network.sessionId;

    // Remove placeholder local player if real network session arrives
    if (isLocal) {
      const preview = this.players.get('local_player');
      if (preview) {
        this.scene.remove(preview.group);
        this.players.delete('local_player');
      }
    }

    const char = new CharacterRenderer(sessionId, player.name, 'Novice', false);
    char.group.position.set(player.x, player.y, player.z);
    char.targetPosition.set(player.x, player.y, player.z);
    char.updateHealth(player.hp, player.maxHp);

    this.scene.add(char.group);
    this.players.set(sessionId, char);

    if (isLocal) {
      this.hud.updatePlayerInfo(player.name, player.jobClass, player.baseLevel, player.jobLevel);
      this.hud.updatePlayerStats(player.hp, player.maxHp, player.sp, player.maxSp);
      this.cameraController.target.set(player.x, player.y, player.z);
    }
  }

  private updatePlayer(sessionId: string, player: any) {
    const char = this.players.get(sessionId);
    if (!char) return;

    char.targetPosition.set(player.x, player.y, player.z);
    char.isMoving = player.isMoving;
    char.updateHealth(player.hp, player.maxHp);

    if (sessionId === this.network.sessionId) {
      this.hud.updatePlayerStats(player.hp, player.maxHp, player.sp, player.maxSp);
    }
  }

  private removePlayer(sessionId: string) {
    const char = this.players.get(sessionId);
    if (char) {
      this.scene.remove(char.group);
      this.players.delete(sessionId);
    }
  }

  private addMonster(id: string, monster: any) {
    const char = new CharacterRenderer(id, monster.name, monster.monsterType, true);
    char.group.position.set(monster.x, monster.y, monster.z);
    char.targetPosition.set(monster.x, monster.y, monster.z);
    char.updateHealth(monster.hp, monster.maxHp);

    this.scene.add(char.group);
    this.monsters.set(id, char);
  }

  private updateMonster(id: string, monster: any) {
    const char = this.monsters.get(id);
    if (!char) return;

    char.targetPosition.set(monster.x, monster.y, monster.z);
    char.isMoving = monster.isMoving;
    char.updateHealth(monster.hp, monster.maxHp);

    // Hide or dim dead monster
    if (monster.isDead) {
      char.group.visible = false;
      if (this.currentTargetId === id) {
        this.hud.hideTarget();
        this.currentTargetId = '';
      }
    } else {
      char.group.visible = true;
    }

    if (this.currentTargetId === id) {
      this.hud.updateTargetHp(monster.hp, monster.maxHp);
    }
  }

  private removeMonster(id: string) {
    const char = this.monsters.get(id);
    if (char) {
      this.scene.remove(char.group);
      this.monsters.delete(id);
    }
  }

  private handleDamageEvent(data: DamageEventPayload) {
    const isLocalHurt = data.targetId === this.network.sessionId;
    this.damageManager.showDamage(data.x, data.y, data.z, data.damage, data.isCritical, isLocalHurt);
  }

  private onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.cameraController.camera.aspect = window.innerWidth / window.innerHeight;
    this.cameraController.camera.updateProjectionMatrix();
  }

  private animate(timeMs: number) {
    requestAnimationFrame((t) => this.animate(t));
    const timeSec = timeMs / 1000;

    // 1. Follow Local Player with Camera & Update Minimap
    const localPlayer = this.players.get(this.network.sessionId) || this.players.get('local_player');
    if (localPlayer) {
      this.cameraController.followTarget(localPlayer.group.position, 0.1);
      this.hud.updateMinimap(
        localPlayer.group.position,
        this.monsters,
        this.players,
        this.cameraController.azimuthAngle
      );
    }

    // 2. Animate Dynamic Lighting
    this.lighting.update(timeSec);

    // 3. Update Entities
    this.players.forEach((p) => p.update(this.cameraController.camera, timeSec));
    this.monsters.forEach((m) => m.update(this.cameraController.camera, timeSec));

    // 4. Animate Click Marker Ring
    if (this.ringAnimation.active) {
      this.ringAnimation.scale += 0.05;
      this.ringAnimation.opacity -= 0.04;
      this.clickRing.scale.set(this.ringAnimation.scale, this.ringAnimation.scale, 1);
      (this.clickRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, this.ringAnimation.opacity);

      if (this.ringAnimation.opacity <= 0) {
        this.ringAnimation.active = false;
      }
    }

    // 5. Render Scene with HD-2D PostProcessing (with fallback)
    this.postProcessing.render(this.renderer, this.scene, this.cameraController.camera);
  }
}
