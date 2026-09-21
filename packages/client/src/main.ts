import { Game } from './core/Game.js';

function bootstrap() {
  const container = document.getElementById('game-container');
  if (container && !(window as any).game) {
    try {
      console.log('⚔️ Bootstrapping Project Umbra Game Client...');
      (window as any).game = new Game(container);
    } catch (err) {
      console.error('CRITICAL ERROR INITIALIZING GAME:', err);
      const errBox = document.createElement('div');
      errBox.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(20,10,10,0.95);border:2px solid #e74c3c;color:#fff;padding:24px;border-radius:8px;z-index:999999;font-family:sans-serif;max-width:80%;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.8);';
      errBox.innerHTML = `<h3 style="color:#ff6b6b;margin-bottom:10px;">⚠️ Initialization Failed</h3><p style="font-size:12px;color:#ccc;">${(err as Error).message}</p><p style="font-size:11px;color:#888;margin-top:12px;">Check WebGL2 support or browser console.</p>`;
      document.body.appendChild(errBox);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
