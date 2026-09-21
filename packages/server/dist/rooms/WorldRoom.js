import colyseus from 'colyseus';
const { Room } = colyseus;
import { WorldState, PlayerSchema, MonsterSchema } from './schema/WorldState.js';
import { NetworkAction, MONSTER_CONFIGS, calculateDamage, distance2D } from '@mmo/shared';
export class WorldRoom extends Room {
    constructor() {
        super(...arguments);
        this.maxClients = 100;
        this.attackCooldowns = new Map();
        this.monsterLastMove = new Map();
    }
    onCreate(options) {
        this.setState(new WorldState());
        // 20 ticks per second (50ms interval)
        this.setSimulationInterval((deltaTime) => this.update(deltaTime), 50);
        this.setupMessageHandlers();
        this.spawnInitialMonsters();
        console.log('🏰 WorldRoom (Prontera Field) created and ready.');
    }
    setupMessageHandlers() {
        // 1. Move to coordinate (Point-and-click)
        this.onMessage(NetworkAction.MOVE_TO, (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (!player)
                return;
            // Limit bounds (-35 to +35)
            player.targetX = Math.max(-35, Math.min(35, data.x));
            player.targetZ = Math.max(-35, Math.min(35, data.z));
            player.isMoving = true;
            player.targetEntityId = ''; // Moving clears combat target
        });
        // 2. Attack Target Entity
        this.onMessage(NetworkAction.ATTACK_TARGET, (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (!player)
                return;
            const monster = this.state.monsters.get(data.targetId);
            if (monster && !monster.isDead) {
                player.targetEntityId = data.targetId;
            }
        });
        // 3. Chat Message
        this.onMessage(NetworkAction.CHAT_MESSAGE, (client, data) => {
            const player = this.state.players.get(client.sessionId);
            const senderName = player ? player.name : 'Unknown';
            const payload = {
                senderId: client.sessionId,
                senderName: senderName,
                text: data.text.slice(0, 120),
                channel: data.channel || 'all',
                timestamp: Date.now()
            };
            this.broadcast(NetworkAction.CHAT_MESSAGE, payload);
        });
    }
    onJoin(client, options) {
        const player = new PlayerSchema();
        player.id = client.sessionId;
        player.name = options.name || `Novice_${client.sessionId.slice(0, 4)}`;
        player.jobClass = options.jobClass || 'Novice';
        // Random initial spawn location
        player.x = (Math.random() - 0.5) * 8;
        player.y = 0;
        player.z = (Math.random() - 0.5) * 8;
        player.targetX = player.x;
        player.targetZ = player.z;
        this.state.players.set(client.sessionId, player);
        // Announce to chat
        this.broadcast(NetworkAction.CHAT_MESSAGE, {
            senderName: 'System',
            text: `${player.name} entered the field.`,
            channel: 'all',
            timestamp: Date.now()
        });
        console.log(`👤 Player joined: ${player.name} (${client.sessionId})`);
    }
    onLeave(client) {
        const player = this.state.players.get(client.sessionId);
        if (player) {
            this.broadcast(NetworkAction.CHAT_MESSAGE, {
                senderName: 'System',
                text: `${player.name} left the field.`,
                channel: 'all',
                timestamp: Date.now()
            });
            console.log(`👋 Player left: ${player.name} (${client.sessionId})`);
        }
        this.state.players.delete(client.sessionId);
        this.attackCooldowns.delete(client.sessionId);
    }
    spawnInitialMonsters() {
        const initialSpawns = [
            { type: 'Poring', count: 12 },
            { type: 'Lunatic', count: 8 },
            { type: 'Fabre', count: 6 },
            { type: 'BaphometJr', count: 2 }
        ];
        let idCounter = 1;
        for (const group of initialSpawns) {
            const config = MONSTER_CONFIGS[group.type];
            for (let i = 0; i < group.count; i++) {
                const monster = new MonsterSchema();
                monster.id = `mob_${idCounter++}`;
                monster.name = config.name;
                monster.monsterType = config.type;
                monster.hp = config.maxHp;
                monster.maxHp = config.maxHp;
                monster.speed = config.speed;
                // Spread spawn points across field (-30 to 30)
                monster.x = (Math.random() - 0.5) * 55;
                monster.y = 0;
                monster.z = (Math.random() - 0.5) * 55;
                monster.targetX = monster.x;
                monster.targetZ = monster.z;
                this.state.monsters.set(monster.id, monster);
            }
        }
    }
    update(deltaTime) {
        const dtSeconds = deltaTime / 1000;
        const now = Date.now();
        // 1. Update Players
        this.state.players.forEach((player) => {
            // If locked onto a monster target
            if (player.targetEntityId) {
                const monster = this.state.monsters.get(player.targetEntityId);
                if (!monster || monster.isDead) {
                    player.targetEntityId = '';
                }
                else {
                    const dist = distance2D(player.x, player.z, monster.x, monster.z);
                    const attackRange = 1.8;
                    if (dist > attackRange) {
                        // Move toward monster
                        player.targetX = monster.x;
                        player.targetZ = monster.z;
                        player.isMoving = true;
                    }
                    else {
                        // Stop moving, engage in combat
                        player.isMoving = false;
                        const cooldown = this.attackCooldowns.get(player.id) || { lastAttackTime: 0 };
                        const attackInterval = 1000 / player.aspd;
                        if (now - cooldown.lastAttackTime >= attackInterval) {
                            cooldown.lastAttackTime = now;
                            this.attackCooldowns.set(player.id, cooldown);
                            // Perform attack
                            const config = MONSTER_CONFIGS[monster.monsterType];
                            const monsterDef = config ? config.def : 2;
                            const isCrit = Math.random() < 0.15; // 15% crit
                            const hitResult = calculateDamage(player.atk, monsterDef, isCrit);
                            monster.hp = Math.max(0, monster.hp - hitResult.damage);
                            // Retaliate: monster aggros onto this player
                            if (!monster.targetPlayerId) {
                                monster.targetPlayerId = player.id;
                            }
                            // Broadcast damage event for visual numbers & effects
                            const damagePayload = {
                                sourceId: player.id,
                                targetId: monster.id,
                                damage: hitResult.damage,
                                isCritical: hitResult.isCrit,
                                isMiss: hitResult.isMiss,
                                x: monster.x,
                                y: 1.0,
                                z: monster.z
                            };
                            this.broadcast('DAMAGE_EVENT', damagePayload);
                            // Monster death
                            if (monster.hp <= 0) {
                                monster.isDead = true;
                                player.targetEntityId = '';
                                // Level up / EXP bonus
                                this.broadcast(NetworkAction.CHAT_MESSAGE, {
                                    senderName: 'Battle',
                                    text: `${player.name} defeated ${monster.name}! (+${config.exp} EXP)`,
                                    channel: 'all',
                                    timestamp: now
                                });
                                // Respawn monster after cooldown
                                setTimeout(() => {
                                    if (this.state.monsters.has(monster.id)) {
                                        monster.hp = config.maxHp;
                                        monster.isDead = false;
                                        monster.x = (Math.random() - 0.5) * 55;
                                        monster.z = (Math.random() - 0.5) * 55;
                                        monster.targetX = monster.x;
                                        monster.targetZ = monster.z;
                                        monster.targetPlayerId = '';
                                    }
                                }, config.respawnTimeMs);
                            }
                        }
                    }
                }
            }
            // Move player position
            if (player.isMoving) {
                const dist = distance2D(player.x, player.z, player.targetX, player.targetZ);
                const step = player.speed * dtSeconds;
                if (dist <= step) {
                    player.x = player.targetX;
                    player.z = player.targetZ;
                    player.isMoving = false;
                }
                else {
                    const ratio = step / dist;
                    player.x += (player.targetX - player.x) * ratio;
                    player.z += (player.targetZ - player.z) * ratio;
                }
            }
        });
        // 2. Update Monsters
        this.state.monsters.forEach((monster) => {
            if (monster.isDead)
                return;
            const config = MONSTER_CONFIGS[monster.monsterType] || MONSTER_CONFIGS.Poring;
            // Aggro logic
            if (monster.targetPlayerId) {
                const targetPlayer = this.state.players.get(monster.targetPlayerId);
                if (!targetPlayer) {
                    monster.targetPlayerId = '';
                }
                else {
                    const dist = distance2D(monster.x, monster.z, targetPlayer.x, targetPlayer.z);
                    if (dist > 15) {
                        // Lost target
                        monster.targetPlayerId = '';
                    }
                    else if (dist > 1.5) {
                        monster.targetX = targetPlayer.x;
                        monster.targetZ = targetPlayer.z;
                        monster.isMoving = true;
                    }
                    else {
                        monster.isMoving = false;
                        // Monster attack player on interval
                        const lastAttack = this.monsterLastMove.get(monster.id) || 0;
                        if (now - lastAttack >= 1500) {
                            this.monsterLastMove.set(monster.id, now);
                            const hit = calculateDamage(config.atk, targetPlayer.def);
                            targetPlayer.hp = Math.max(1, targetPlayer.hp - hit.damage);
                            const damagePayload = {
                                sourceId: monster.id,
                                targetId: targetPlayer.id,
                                damage: hit.damage,
                                isCritical: hit.isCrit,
                                isMiss: hit.isMiss,
                                x: targetPlayer.x,
                                y: 1.0,
                                z: targetPlayer.z
                            };
                            this.broadcast('DAMAGE_EVENT', damagePayload);
                        }
                    }
                }
            }
            else {
                // Wandering logic
                const lastMove = this.monsterLastMove.get(monster.id) || 0;
                if (now - lastMove > 4000 + Math.random() * 3000) {
                    this.monsterLastMove.set(monster.id, now);
                    if (Math.random() < 0.6) {
                        const wanderDist = 3 + Math.random() * 4;
                        const angle = Math.random() * Math.PI * 2;
                        monster.targetX = Math.max(-35, Math.min(35, monster.x + Math.cos(angle) * wanderDist));
                        monster.targetZ = Math.max(-35, Math.min(35, monster.z + Math.sin(angle) * wanderDist));
                        monster.isMoving = true;
                    }
                }
            }
            // Move monster position
            if (monster.isMoving) {
                const dist = distance2D(monster.x, monster.z, monster.targetX, monster.targetZ);
                const step = monster.speed * dtSeconds;
                if (dist <= step) {
                    monster.x = monster.targetX;
                    monster.z = monster.targetZ;
                    monster.isMoving = false;
                }
                else {
                    const ratio = step / dist;
                    monster.x += (monster.targetX - monster.x) * ratio;
                    monster.z += (monster.targetZ - monster.z) * ratio;
                }
            }
        });
    }
}
