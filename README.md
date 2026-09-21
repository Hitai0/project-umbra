# Ragnarok HD-2D Online (Cross-Platform MMORPG)

A Web-Native, Code-First cross-platform MMORPG inspired by classic **Ragnarok Online** and rendered in the **HD-2D** aesthetic of *Octopath Traveler* (3D terrain, dynamic lighting, tilt-shift depth of field, and 2D billboard pixel art sprites).

---

## Architecture & Tech Stack

- **Monorepo:** npm Workspaces
- **Packages:**
  - `packages/shared`: Shared TypeScript types, Colyseus schemas, battle damage calculations, and game math.
  - `packages/server`: Authoritative Game Server built with **Node.js + Colyseus + Express + Drizzle ORM**.
  - `packages/client`: Game Client built with **Vite + TypeScript + Three.js** with custom HD-2D Tilt-Shift & lighting shaders.
- **Database & Cache:** PostgreSQL (via Drizzle ORM) + Redis (Docker Compose included).
- **Target Platforms:** Web (Native WebGL), PC (via Tauri), Mobile (via Capacitor).

---

## Quick Start (Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Both Server & Client Concurrently
```bash
npm run dev
```
- **Game Client:** Open [http://localhost:3000](http://localhost:3000)
- **Game Server:** Listening on WebSocket `ws://localhost:2567` (Health check at [http://localhost:2567/health](http://localhost:2567/health))

### 3. Optional: Start Local PostgreSQL & Redis
```bash
docker compose up -d
```

---

## Cross-Platform Builds

### Export to PC (via Tauri)
```bash
# In packages/client:
npm run build
npx @tauri-apps/cli init
npx @tauri-apps/cli build
```

### Export to Mobile (via Capacitor)
```bash
# In packages/client:
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init
npm run build
npx cap add android
npx cap add ios
npx cap open android
```
