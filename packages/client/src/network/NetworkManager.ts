import { Client, Room } from 'colyseus.js';
import { NetworkAction, ChatMessagePayload, DamageEventPayload } from '@mmo/shared';

export interface NetworkCallbacks {
  onPlayerAdd: (player: any, sessionId: string) => void;
  onPlayerRemove: (sessionId: string) => void;
  onPlayerChange: (player: any, sessionId: string) => void;
  onMonsterAdd: (monster: any, id: string) => void;
  onMonsterRemove: (id: string) => void;
  onMonsterChange: (monster: any, id: string) => void;
  onDamageEvent: (data: DamageEventPayload) => void;
  onChatMessage: (data: ChatMessagePayload) => void;
  onConnected: (sessionId: string) => void;
}

export class NetworkManager {
  private client: Client;
  public room: Room | null = null;
  public sessionId: string = '';
  private callbacks: NetworkCallbacks;

  constructor(serverUrl: string, callbacks: NetworkCallbacks) {
    this.client = new Client(serverUrl);
    this.callbacks = callbacks;
  }

  public async connect(playerName: string = 'Novice') {
    try {
      this.room = await this.client.joinOrCreate('world_room', {
        name: playerName,
        jobClass: 'Novice'
      });

      this.sessionId = this.room.sessionId;
      this.callbacks.onConnected(this.sessionId);
      console.log(` Connected to WorldRoom as ${this.sessionId}`);

      // 1. Players Sync
      this.room.state.players.onAdd((player: any, sessionId: string) => {
        this.callbacks.onPlayerAdd(player, sessionId);

        player.onChange(() => {
          this.callbacks.onPlayerChange(player, sessionId);
        });
      });

      this.room.state.players.onRemove((_player: any, sessionId: string) => {
        this.callbacks.onPlayerRemove(sessionId);
      });

      // 2. Monsters Sync
      this.room.state.monsters.onAdd((monster: any, id: string) => {
        this.callbacks.onMonsterAdd(monster, id);

        monster.onChange(() => {
          this.callbacks.onMonsterChange(monster, id);
        });
      });

      this.room.state.monsters.onRemove((_monster: any, id: string) => {
        this.callbacks.onMonsterRemove(id);
      });

      // 3. Custom Messages
      this.room.onMessage('DAMAGE_EVENT', (data: DamageEventPayload) => {
        this.callbacks.onDamageEvent(data);
      });

      this.room.onMessage(NetworkAction.CHAT_MESSAGE, (data: ChatMessagePayload) => {
        this.callbacks.onChatMessage(data);
      });

    } catch (err) {
      console.error('❌ Failed to connect to game server:', err);
    }
  }

  public sendMoveTo(x: number, z: number) {
    if (this.room) {
      this.room.send(NetworkAction.MOVE_TO, { x, z });
    }
  }

  public sendAttackTarget(targetId: string) {
    if (this.room) {
      this.room.send(NetworkAction.ATTACK_TARGET, { targetId });
    }
  }

  public sendChatMessage(text: string) {
    if (this.room) {
      this.room.send(NetworkAction.CHAT_MESSAGE, { text, channel: 'all' });
    }
  }
}
