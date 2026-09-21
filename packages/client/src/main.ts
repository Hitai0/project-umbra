import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  if (container) {
    (window as any).game = new Game(container);
    console.log('⚔️ Ragnarok HD-2D Game Client Initialized!');
  }
});
