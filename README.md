# 🚀 Asteroid Miner

A fully-featured 3D space asteroid mining game built with React and Three.js. Pilot your spaceship through waves of asteroids, mine resources, upgrade your ship, and survive as long as you can!

![Asteroid Miner](https://img.shields.io/badge/Game-Asteroid%20Miner-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Three.js](https://img.shields.io/badge/Three.js-0.128.0-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.2-38bdf8)

## 🌐 Play Online

**[Play Asteroid Miner Now!](https://imprince0.github.io/Game/)**

The game is deployed and playable online via GitHub Pages. No installation required - just click and play!

## 🎮 Features

### Core Gameplay
- **3D Space Flight**: Pilot your ship in full 3D space with realistic physics
- **Mining Laser**: Fire powerful laser beams to destroy asteroids
- **Resource Collection**: Collect three types of resources (Gold, Blue Crystals, Purple Gems)
- **Wave System**: Face increasingly difficult waves of asteroids
- **Upgrade System**: Spend resources to upgrade your ship's capabilities

### Game Mechanics
- **Asteroid Physics**: Asteroids drift toward you with realistic rotation
- **Smart Destruction**: Large asteroids break into medium ones, medium into resources
- **Boost System**: Limited boost for quick escapes or positioning
- **Health System**: Take damage from collisions, game over at zero health
- **Scoring**: Earn points for destroying asteroids and collecting resources

### Visual Effects
- **Starfield Background**: Beautiful space environment
- **Particle Explosions**: Satisfying destruction effects
- **Screen Shake**: Impact feedback on damage
- **Glowing Resources**: Emissive resource orbs with pulse effects
- **Smooth Camera**: Third-person follow camera with smooth transitions

### Upgrades Available
1. **Laser Damage** (Gold) - Increase power, unlock piercing
2. **Ship Speed** (Blue) - Move faster through space
3. **Max Health** (Purple) - Increase survivability
4. **Boost Duration** (Mixed) - Extend boost time

## 🎯 Controls

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move ship (forward/left/back/right) |
| **Mouse** | Look around (requires pointer lock) |
| **Left Click** | Fire mining laser |
| **Spacebar** | Boost (limited energy) |
| **U** | Toggle upgrade menu |
| **ESC** | Pause game |
| **R** | Restart (after game over) |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The game will automatically open in your browser at `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## 🎨 Tech Stack

- **React 18** - UI framework
- **Three.js r128** - 3D graphics engine
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## 📖 How to Play

### Getting Started
1. Click "PRESS SPACE TO START" on the menu screen
2. Click on the game to lock your mouse cursor
3. Use WASD to move and mouse to look around
4. Left-click to fire your laser at asteroids

### Survival Tips
- **Destroy asteroids before they hit you** - Collisions damage your ship
- **Collect resources** - Fly through glowing orbs to collect them
- **Use boost wisely** - Boost energy is limited and recharges slowly
- **Upgrade strategically** - Press U to access upgrades between waves
- **Watch your health** - The red bar in top-left is your lifeline

### Wave Progression
- **Wave 1-2**: Small asteroids, learn the controls
- **Wave 3-4**: Mixed sizes, practice your aim
- **Wave 5+**: Large asteroids appear, upgrade your laser!
- **Wave 6+**: Increasing difficulty, all asteroid types

### Resource Strategy
- **Gold** (from small asteroids) → Laser Damage upgrades
- **Blue** (from medium asteroids) → Ship Speed upgrades
- **Purple** (from large asteroids) → Max Health upgrades

### Scoring
- Small asteroid destroyed: **10 points**
- Medium asteroid: **25 points**
- Large asteroid: **50 points**
- Resource collected: **5 points**
- Wave completed: **100 points bonus**

## 🎮 Gameplay Tips

1. **Keep Moving** - A moving target is harder to hit
2. **Prioritize Large Asteroids** - They break into multiple smaller ones
3. **Upgrade Laser First** - Level 4 laser pierces through asteroids
4. **Don't Chase Resources** - They float, let them come to you
5. **Use Terrain** - Destroyed asteroids create temporary shields
6. **Boost in Emergencies** - Save boost energy for dangerous situations

## 🏗️ Project Structure

```
asteroid-miner/
├── src/
│   ├── AsteroidMiner.jsx    # Main game component (single file)
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind styles
├── index.html                # HTML template
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
└── README.md                 # This file
```

## 🔧 Configuration

### Performance Tuning
The game targets 60 FPS. If you experience lag:
- Close other browser tabs
- Reduce browser window size
- Check browser hardware acceleration is enabled

### Graphics Settings
Located in `src/AsteroidMiner.jsx`:
- `renderer.setPixelRatio()` - Adjust for performance (line ~283)
- Particle count in `createExplosion()` - Reduce for better FPS (line ~481)
- Starfield star count - Reduce for better FPS (line ~305)

## 🐛 Troubleshooting

**Mouse not working?**
- Click on the game canvas to lock the mouse pointer
- The game requires pointer lock for mouse controls

**Game feels laggy?**
- Reduce browser window size
- Close other applications
- Check if hardware acceleration is enabled in your browser

**Upgrades not working?**
- Make sure you have enough resources of the correct type
- Check resource requirements in the upgrade menu

**Can't restart after game over?**
- Press the 'R' key or click the restart button

## 📝 License

MIT License - Feel free to use this code for learning or your own projects!

## 🙏 Credits

Created with:
- React for UI framework
- Three.js for 3D graphics
- Tailwind CSS for styling
- Vite for blazing-fast development

---

**Enjoy mining those asteroids! 🚀💎**