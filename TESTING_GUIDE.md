# 🎮 Asteroid Miner - Testing Guide

## Quick Test Instructions

Follow this checklist to thoroughly test the game. Check off each item as you test it.

---

## Desktop/Laptop Testing

### Menu Screen
- [ ] Game loads without errors
- [ ] Title "ASTEROID MINER" is visible
- [ ] **Press SPACE** - should start the game
- [ ] **Click "PRESS SPACE TO START" button** - should also start the game

### Keyboard-Only Controls (No Mouse)
- [ ] **WASD keys** - ship moves in all directions
- [ ] **Arrow Keys** - camera rotates (Up/Down/Left/Right)
- [ ] **F key** - fires laser beam
- [ ] **Spacebar** - activates boost (while moving)
- [ ] **U key** - opens upgrade menu
- [ ] **ESC key** - pauses game
- [ ] Camera rotation is smooth with arrow keys
- [ ] Can play entire game without touching mouse

### Mouse + Keyboard Controls
- [ ] **Click canvas** - locks mouse pointer
- [ ] **Move mouse** - camera rotates smoothly
- [ ] **WASD keys** - ship moves
- [ ] **Left click** - fires laser
- [ ] **Spacebar** - activates boost
- [ ] Mouse rotation overrides arrow key rotation when mouse moves
- [ ] Arrow keys work again when mouse stops moving

### Gameplay Mechanics
- [ ] Ship has momentum/inertia (doesn't stop instantly)
- [ ] Boost works when coasting (not just when pressing WASD)
- [ ] Boost energy depletes when used
- [ ] Boost energy recharges when not boosting
- [ ] Laser fires forward from ship
- [ ] Laser destroys asteroids on hit
- [ ] Large asteroids break into medium ones
- [ ] Medium asteroids break into smaller ones or resources
- [ ] Small asteroids drop resources (gold orbs)
- [ ] Resources float and pulse/glow
- [ ] Flying through resources collects them
- [ ] Colliding with asteroids damages health
- [ ] Screen shakes on damage
- [ ] Explosion particles appear when asteroids destroyed
- [ ] Health bar decreases when damaged
- [ ] Game over when health reaches 0

### Wave System
- [ ] Wave 1 starts with small asteroids
- [ ] Wave counter displays correctly
- [ ] Enemy count updates in real-time
- [ ] Wave completes when all asteroids destroyed
- [ ] +100 score bonus on wave completion
- [ ] Next wave spawns after 2 second delay
- [ ] Difficulty increases with wave number
- [ ] Larger asteroids appear in later waves

### Upgrade System
- [ ] **Press U** - opens upgrade menu
- [ ] **Press U again** - closes upgrade menu
- [ ] **Press ESC** - closes upgrade menu
- [ ] Resources display correctly (gold/blue/purple counts)
- [ ] Can purchase Laser Damage upgrade with gold
- [ ] Can purchase Ship Speed upgrade with blue
- [ ] Can purchase Max Health upgrade with purple
- [ ] Can purchase Boost Duration with mixed resources
- [ ] Upgrades grey out when insufficient resources
- [ ] Upgrades show "MAX LEVEL" when maxed
- [ ] Purchasing Max Health upgrade restores health to full
- [ ] Ship speed actually increases after upgrade
- [ ] Laser damage increases (fewer hits to destroy asteroids)

### HUD Display
- [ ] Health bar shows correct percentage
- [ ] Boost bar shows correct percentage
- [ ] Resource counters update correctly
- [ ] Wave number displays correctly
- [ ] Enemy count is accurate
- [ ] Score increases correctly
- [ ] Control hints display for 10 seconds then fade
- [ ] Crosshair is centered on screen

### Game States
- [ ] Pause menu works (ESC key)
- [ ] Can resume from pause (ESC again)
- [ ] Game over screen shows final stats
- [ ] **Press R** restarts game after game over
- [ ] Restart resets: health, score, wave, resources, upgrades
- [ ] Restart resets ship position and rotation
- [ ] Restart clears all asteroids and particles

---

## Mobile/Tablet Testing

### Menu Screen
- [ ] Title scales properly on mobile
- [ ] Button shows "TAP TO START"
- [ ] **Tap anywhere** - starts game
- [ ] Control hints show mobile instructions

### Touch Controls
- [ ] **Drag left side of screen** - ship moves
  - [ ] Drag up → ship moves forward
  - [ ] Drag down → ship moves backward
  - [ ] Drag left → ship moves left
  - [ ] Drag right → ship moves right
- [ ] **Drag right side of screen** - camera rotates
  - [ ] Drag left/right → horizontal rotation
  - [ ] Drag up/down → vertical rotation
- [ ] **Tap right side** - fires laser
- [ ] **Tap center** - activates boost
- [ ] Releasing touch stops movement
- [ ] Touch controls feel responsive

### Mobile HUD
- [ ] Health/Boost bars are smaller on mobile
- [ ] Resource panel is readable
- [ ] Wave info displays correctly
- [ ] Text is not too small to read
- [ ] No UI elements overlap
- [ ] Control hints show mobile controls
- [ ] Control hints fade after 10 seconds

### Mobile Performance
- [ ] Game runs at acceptable FPS (30-60)
- [ ] No significant lag or stuttering
- [ ] Touch input is responsive
- [ ] No crashes on mobile browsers

---

## Cross-Platform Testing

### Browser Compatibility
Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac/iOS)

### Responsive Design
Test at different window sizes:
- [ ] 1920x1080 (Desktop)
- [ ] 1366x768 (Laptop)
- [ ] 768x1024 (Tablet portrait)
- [ ] 375x667 (Mobile)

### Window Resize
- [ ] Game canvas resizes correctly
- [ ] Camera aspect ratio updates
- [ ] HUD elements remain visible
- [ ] No visual glitches

---

## Bug Checklist

### Known Issues to Verify Fixed
- [x] Space key starts game from menu (FIXED)
- [x] Arrow keys rotate camera (FIXED)
- [x] F key fires laser (FIXED)
- [x] Touch controls work on mobile (FIXED)
- [x] Restart resets camera rotation (FIXED)
- [x] Boost works while coasting (FIXED)

### Potential Edge Cases
- [ ] Spamming laser doesn't break game
- [ ] Dying during boost doesn't cause issues
- [ ] Opening upgrade menu during explosion works
- [ ] Multiple touches on mobile don't confuse controls
- [ ] Rapidly switching between mouse and keyboard works
- [ ] Game recovers from tab switching (pause/resume)
- [ ] No asteroids spawn inside player
- [ ] Resources don't fly off into infinity
- [ ] Score doesn't overflow (very high scores)

---

## Performance Testing

### Frame Rate
- [ ] Desktop: 60 FPS consistently
- [ ] Mobile: 30-60 FPS acceptable
- [ ] No stuttering during explosions
- [ ] No lag when many particles on screen

### Memory
- [ ] No memory leaks during long play sessions
- [ ] Game doesn't slow down after many waves
- [ ] Particles get cleaned up properly

---

## Accessibility

- [ ] Game works without mouse (keyboard-only)
- [ ] Game works on mobile (touch-only)
- [ ] Control hints explain all inputs clearly
- [ ] UI text is readable at all sizes
- [ ] Game states are clearly communicated

---

## How to Report Issues

If you find any bugs, note:
1. **What happened?** (description of the bug)
2. **What were you doing?** (steps to reproduce)
3. **Platform?** (desktop/mobile, browser, OS)
4. **Expected behavior?** (what should have happened)

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
# Game will auto-open at http://localhost:3000

# Test on mobile
# Use ngrok or similar to expose localhost to mobile device
```

---

## Test Priority

**High Priority (Must Test):**
1. Space key starts game
2. Arrow keys rotate camera
3. Boost works while coasting
4. Mobile touch controls
5. Game restart clears rotation

**Medium Priority (Should Test):**
1. All upgrade purchases
2. Wave progression
3. Resource collection
4. Collision detection

**Low Priority (Nice to Test):**
1. Multiple browsers
2. Window resize
3. Long play sessions
4. Edge cases

---

**Happy Testing! 🚀**

Report any issues and I'll fix them immediately!
