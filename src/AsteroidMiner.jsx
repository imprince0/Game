import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * ASTEROID MINER - A 3D Space Mining Game
 *
 * Controls:
 * - WASD: Move ship
 * - Mouse: Look around
 * - Left Click: Fire laser
 * - Spacebar: Boost
 * - U: Toggle upgrades
 * - ESC: Pause
 * - R: Restart (when game over)
 */

const AsteroidMiner = () => {
  // Canvas ref
  const canvasRef = useRef(null);

  // Game state
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'gameOver'
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [shield, setShield] = useState(100);
  const [boost, setBoost] = useState(100);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [enemiesRemaining, setEnemiesRemaining] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showUpgrades, setShowUpgrades] = useState(false);

  // Resources
  const [resources, setResources] = useState({
    gold: 0,
    blue: 0,
    purple: 0
  });

  // Upgrades
  const [upgrades, setUpgrades] = useState({
    laserDamage: 1,
    shipSpeed: 1,
    maxHealth: 1,
    boostDuration: 1
  });

  // Refs for game logic (not re-render dependent)
  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    ship: null,
    asteroids: [],
    resourceOrbs: [],
    particles: [],
    lasers: [],
    stars: null,
    shipVelocity: new THREE.Vector3(),
    shipRotation: new THREE.Euler(),
    mouseX: 0,
    mouseY: 0,
    keys: {},
    lastTime: 0,
    isBoosting: false,
    lastShot: 0,
    screenShake: 0,
    cameraOffset: new THREE.Vector3(0, 2, 5),
    animationId: null,
    damageCooldown: 0
  });

  // Upgrade costs
  const upgradeCosts = {
    laserDamage: [0, 50, 100, 200, 400],
    shipSpeed: [0, 100, 200, 400],
    maxHealth: [0, 150, 300, 600],
    boostDuration: [0, 100, 200]
  };

  const upgradeResourceType = {
    laserDamage: 'gold',
    shipSpeed: 'blue',
    maxHealth: 'purple',
    boostDuration: 'gold'
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const game = gameRef.current;

    // Initialize Three.js scene
    initScene();

    // Event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('resize', handleResize);
    window.addEventListener('click', handlePointerLock);

    // Hide controls after 10 seconds
    const timer = setTimeout(() => setShowControls(false), 10000);

    // Start animation loop
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handlePointerLock);
      clearTimeout(timer);

      if (game.animationId) {
        cancelAnimationFrame(game.animationId);
      }

      // Cleanup Three.js
      if (game.renderer) {
        game.renderer.dispose();
      }
    };
  }, []);

  // Initialize Three.js scene
  const initScene = () => {
    const game = gameRef.current;

    // Scene
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x000510);
    game.scene.fog = new THREE.Fog(0x000510, 10, 100);

    // Camera
    game.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    game.camera.position.set(0, 2, 5);

    // Renderer
    game.renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    game.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    game.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 50);
    game.scene.add(pointLight);

    // Create starfield
    createStarfield();

    // Create ship
    createShip();
  };

  // Create starfield background
  const createStarfield = () => {
    const game = gameRef.current;
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      sizeAttenuation: true
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    game.stars = new THREE.Points(starsGeometry, starsMaterial);
    game.scene.add(game.stars);
  };

  // Create player ship
  const createShip = () => {
    const game = gameRef.current;
    const shipGroup = new THREE.Group();

    // Main body (cone)
    const bodyGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x4488ff,
      emissive: 0x2244aa,
      shininess: 30
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    shipGroup.add(body);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.4);
    const wingMaterial = new THREE.MeshPhongMaterial({
      color: 0x6699ff,
      emissive: 0x3344aa
    });
    const wing = new THREE.Mesh(wingGeometry, wingMaterial);
    wing.position.z = -0.3;
    shipGroup.add(wing);

    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const cockpitMaterial = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      emissive: 0x4488ff,
      transparent: true,
      opacity: 0.8
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.z = 0.2;
    cockpit.position.y = 0.1;
    shipGroup.add(cockpit);

    // Engine glow
    const engineGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 8);
    const engineMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.8
    });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.rotation.x = Math.PI / 2;
    engine.position.z = -0.8;
    shipGroup.add(engine);

    // Ship light
    const shipLight = new THREE.PointLight(0x4488ff, 1, 10);
    shipLight.position.set(0, 0, 0.5);
    shipGroup.add(shipLight);

    game.ship = shipGroup;
    game.scene.add(shipGroup);
  };

  // Create asteroid
  const createAsteroid = (size, position) => {
    const game = gameRef.current;

    const geometry = new THREE.IcosahedronGeometry(size, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x8b7355,
      flatShading: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);

    // Random rotation
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    const asteroid = {
      mesh,
      size,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      health: size === 0.5 ? 1 : size === 1.0 ? 2 : 3
    };

    game.scene.add(mesh);
    game.asteroids.push(asteroid);

    return asteroid;
  };

  // Create resource orb
  const createResource = (type, position) => {
    const game = gameRef.current;

    const colors = {
      gold: 0xffd700,
      blue: 0x00ffff,
      purple: 0xff00ff
    };

    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: colors[type],
      emissive: colors[type],
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);

    const resource = {
      mesh,
      type,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      ),
      rotation: 0
    };

    game.scene.add(mesh);
    game.resourceOrbs.push(resource);

    return resource;
  };

  // Create explosion particles
  const createExplosion = (position, color = 0xff6600, count = 25) => {
    const game = gameRef.current;

    for (let i = 0; i < count; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 4, 4);
      const material = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);

      const particle = {
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        life: 1.0,
        decay: 0.02
      };

      game.scene.add(mesh);
      game.particles.push(particle);
    }

    // Screen shake
    game.screenShake = 0.3;
  };

  // Fire laser
  const fireLaser = () => {
    const game = gameRef.current;
    const now = Date.now();

    if (now - game.lastShot < 200) return; // Fire rate limit
    game.lastShot = now;

    // Create laser beam
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(game.ship.quaternion);

    const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, 50, 8);
    const laserMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.8
    });
    const laserMesh = new THREE.Mesh(laserGeometry, laserMaterial);

    laserMesh.position.copy(game.ship.position);
    laserMesh.quaternion.copy(game.ship.quaternion);
    laserMesh.rotateX(Math.PI / 2);
    laserMesh.position.add(direction.multiplyScalar(25));

    const laser = {
      mesh: laserMesh,
      direction: direction.clone().normalize(),
      origin: game.ship.position.clone(),
      life: 0.5,
      piercing: upgrades.laserDamage >= 4
    };

    game.scene.add(laserMesh);
    game.lasers.push(laser);

    // Check laser hits
    checkLaserHits(laser);
  };

  // Check laser collision with asteroids
  const checkLaserHits = (laser) => {
    const game = gameRef.current;
    const raycaster = new THREE.Raycaster(laser.origin, laser.direction, 0, 50);

    let hitTargets = [];
    game.asteroids.forEach(asteroid => {
      const distance = raycaster.ray.distanceToPoint(asteroid.mesh.position);
      if (distance < asteroid.size) {
        hitTargets.push(asteroid);
      }
    });

    // Sort by distance
    hitTargets.sort((a, b) => {
      const distA = laser.origin.distanceTo(a.mesh.position);
      const distB = laser.origin.distanceTo(b.mesh.position);
      return distA - distB;
    });

    // Hit asteroids
    const maxHits = laser.piercing ? hitTargets.length : 1;
    for (let i = 0; i < Math.min(maxHits, hitTargets.length); i++) {
      hitAsteroid(hitTargets[i]);
    }
  };

  // Hit asteroid with laser
  const hitAsteroid = (asteroid) => {
    const game = gameRef.current;
    const damage = upgrades.laserDamage;

    asteroid.health -= damage;

    if (asteroid.health <= 0) {
      destroyAsteroid(asteroid);
    }
  };

  // Destroy asteroid
  const destroyAsteroid = (asteroid) => {
    const game = gameRef.current;

    // Remove from array
    const index = game.asteroids.indexOf(asteroid);
    if (index > -1) {
      game.asteroids.splice(index, 1);
    }

    // Remove mesh
    game.scene.remove(asteroid.mesh);

    // Create explosion
    createExplosion(asteroid.mesh.position, 0xff6600, 20);

    // Add score
    const points = asteroid.size === 0.5 ? 10 : asteroid.size === 1.0 ? 25 : 50;
    setScore(s => s + points);

    // Break into smaller or create resources
    if (asteroid.size === 2.0) {
      // Large -> medium asteroids
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        createAsteroid(1.0, asteroid.mesh.position.clone().add(offset));
      }
      // Drop purple resources
      for (let i = 0; i < 3 + Math.floor(Math.random() * 2); i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 1,
          (Math.random() - 0.5) * 1,
          (Math.random() - 0.5) * 1
        );
        createResource('purple', asteroid.mesh.position.clone().add(offset));
      }
    } else if (asteroid.size === 1.0) {
      // Medium -> resources
      for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 1,
          (Math.random() - 0.5) * 1,
          (Math.random() - 0.5) * 1
        );
        createResource('blue', asteroid.mesh.position.clone().add(offset));
      }
    } else {
      // Small -> resources
      for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        );
        createResource('gold', asteroid.mesh.position.clone().add(offset));
      }
    }
  };

  // Spawn wave of asteroids
  const spawnWave = (waveNumber) => {
    const game = gameRef.current;

    let small = 0, medium = 0, large = 0;

    if (waveNumber === 1) {
      small = 5;
    } else if (waveNumber === 2) {
      small = 8;
    } else if (waveNumber === 3) {
      small = 4;
      medium = 6;
    } else if (waveNumber === 4) {
      small = 5;
      medium = 5;
    } else if (waveNumber === 5) {
      medium = 8;
      large = 3;
    } else {
      small = Math.floor(waveNumber * 1.5);
      medium = Math.floor(waveNumber * 1.2);
      large = Math.floor(waveNumber * 0.5);
    }

    const total = small + medium + large;
    setEnemiesRemaining(total);

    // Spawn small asteroids
    for (let i = 0; i < small; i++) {
      spawnAsteroidAtRandomPosition(0.5);
    }

    // Spawn medium asteroids
    for (let i = 0; i < medium; i++) {
      spawnAsteroidAtRandomPosition(1.0);
    }

    // Spawn large asteroids
    for (let i = 0; i < large; i++) {
      spawnAsteroidAtRandomPosition(2.0);
    }
  };

  // Spawn asteroid at random position around player
  const spawnAsteroidAtRandomPosition = (size) => {
    const game = gameRef.current;

    const angle = Math.random() * Math.PI * 2;
    const distance = 15 + Math.random() * 20;
    const height = (Math.random() - 0.5) * 10;

    const position = new THREE.Vector3(
      game.ship.position.x + Math.cos(angle) * distance,
      game.ship.position.y + height,
      game.ship.position.z + Math.sin(angle) * distance
    );

    createAsteroid(size, position);
  };

  // Update game logic
  const updateGame = (deltaTime) => {
    const game = gameRef.current;

    if (gameState !== 'playing') return;

    // Update ship movement
    updateShipMovement(deltaTime);

    // Update asteroids
    updateAsteroids(deltaTime);

    // Update resources
    updateResources(deltaTime);

    // Update particles
    updateParticles(deltaTime);

    // Update lasers
    updateLasers(deltaTime);

    // Update camera
    updateCamera(deltaTime);

    // Update boost
    updateBoost(deltaTime);

    // Check wave completion
    checkWaveCompletion();

    // Update damage cooldown
    if (game.damageCooldown > 0) {
      game.damageCooldown -= deltaTime;
    }
  };

  // Update ship movement
  const updateShipMovement = (deltaTime) => {
    const game = gameRef.current;
    const speedMultiplier = upgrades.shipSpeed;
    const baseSpeed = 0.05 * speedMultiplier;
    const acceleration = 0.3;
    const deceleration = 0.85;

    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    const up = new THREE.Vector3(0, 1, 0);

    forward.applyQuaternion(game.ship.quaternion);
    right.applyQuaternion(game.ship.quaternion);

    // Movement input
    const moveVector = new THREE.Vector3();

    if (game.keys['w'] || game.keys['W']) {
      moveVector.add(forward);
    }
    if (game.keys['s'] || game.keys['S']) {
      moveVector.sub(forward);
    }
    if (game.keys['a'] || game.keys['A']) {
      moveVector.sub(right);
    }
    if (game.keys['d'] || game.keys['D']) {
      moveVector.add(right);
    }

    // Normalize and apply speed
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(baseSpeed);
      game.shipVelocity.add(moveVector.multiplyScalar(acceleration));
    }

    // Boost
    if (game.keys[' '] && boost > 0 && moveVector.length() > 0) {
      game.isBoosting = true;
      game.shipVelocity.multiplyScalar(1.5);
      setBoost(b => Math.max(0, b - 30 * deltaTime));
    } else {
      game.isBoosting = false;
      if (boost < 100) {
        setBoost(b => Math.min(100, b + 10 * deltaTime));
      }
    }

    // Apply deceleration
    game.shipVelocity.multiplyScalar(deceleration);

    // Update position
    game.ship.position.add(game.shipVelocity);

    // Rotate ship based on mouse
    const targetRotationY = -game.mouseX * 0.002;
    const targetRotationX = -game.mouseY * 0.002;

    game.ship.rotation.y += (targetRotationY - game.ship.rotation.y) * 0.1;
    game.ship.rotation.x += (targetRotationX - game.ship.rotation.x) * 0.1;
  };

  // Update asteroids
  const updateAsteroids = (deltaTime) => {
    const game = gameRef.current;

    game.asteroids.forEach(asteroid => {
      // Move toward player slowly
      const direction = new THREE.Vector3()
        .subVectors(game.ship.position, asteroid.mesh.position)
        .normalize()
        .multiplyScalar(0.005 * wave * 0.1);

      asteroid.velocity.add(direction);
      asteroid.mesh.position.add(asteroid.velocity);

      // Rotate
      asteroid.mesh.rotation.x += asteroid.rotationSpeed.x;
      asteroid.mesh.rotation.y += asteroid.rotationSpeed.y;
      asteroid.mesh.rotation.z += asteroid.rotationSpeed.z;

      // Check collision with ship
      const distance = game.ship.position.distanceTo(asteroid.mesh.position);
      if (distance < asteroid.size + 0.5 && game.damageCooldown <= 0) {
        // Damage ship
        const damage = asteroid.size === 0.5 ? 5 : asteroid.size === 1.0 ? 10 : 20;
        setHealth(h => Math.max(0, h - damage));
        game.damageCooldown = 1.0;
        game.screenShake = 0.5;

        // Bounce asteroid
        const bounceDir = new THREE.Vector3()
          .subVectors(asteroid.mesh.position, game.ship.position)
          .normalize()
          .multiplyScalar(0.1);
        asteroid.velocity.add(bounceDir);
      }
    });

    // Update enemy count
    setEnemiesRemaining(game.asteroids.length);
  };

  // Update resources
  const updateResources = (deltaTime) => {
    const game = gameRef.current;

    game.resourceOrbs.forEach((resource, index) => {
      // Float and rotate
      resource.mesh.position.add(resource.velocity);
      resource.rotation += deltaTime * 2;
      resource.mesh.rotation.y = resource.rotation;

      // Pulse effect
      const scale = 1 + Math.sin(resource.rotation * 2) * 0.2;
      resource.mesh.scale.set(scale, scale, scale);

      // Check collection
      const distance = game.ship.position.distanceTo(resource.mesh.position);
      if (distance < 1.0) {
        // Collect resource
        setResources(r => ({
          ...r,
          [resource.type]: r[resource.type] + 1
        }));
        setScore(s => s + 5);

        // Remove resource
        game.scene.remove(resource.mesh);
        game.resourceOrbs.splice(index, 1);

        // Small particle effect
        createExplosion(resource.mesh.position, resource.mesh.material.color, 5);
      }
    });
  };

  // Update particles
  const updateParticles = (deltaTime) => {
    const game = gameRef.current;

    game.particles.forEach((particle, index) => {
      particle.mesh.position.add(particle.velocity);
      particle.life -= particle.decay;

      // Fade out
      particle.mesh.material.opacity = particle.life;
      particle.mesh.scale.multiplyScalar(0.95);

      if (particle.life <= 0) {
        game.scene.remove(particle.mesh);
        game.particles.splice(index, 1);
      }
    });
  };

  // Update lasers
  const updateLasers = (deltaTime) => {
    const game = gameRef.current;

    game.lasers.forEach((laser, index) => {
      laser.life -= deltaTime;

      if (laser.life <= 0) {
        game.scene.remove(laser.mesh);
        game.lasers.splice(index, 1);
      } else {
        laser.mesh.material.opacity = laser.life * 2;
      }
    });
  };

  // Update camera
  const updateCamera = (deltaTime) => {
    const game = gameRef.current;

    // Follow ship
    const targetPosition = game.ship.position.clone();
    const offset = game.cameraOffset.clone();
    offset.applyQuaternion(game.ship.quaternion);
    targetPosition.add(offset);

    // Smooth camera movement
    game.camera.position.lerp(targetPosition, 0.1);

    // Look at ship
    const lookTarget = game.ship.position.clone();
    lookTarget.y += 0.5;
    game.camera.lookAt(lookTarget);

    // Screen shake
    if (game.screenShake > 0) {
      game.camera.position.x += (Math.random() - 0.5) * game.screenShake;
      game.camera.position.y += (Math.random() - 0.5) * game.screenShake;
      game.screenShake *= 0.9;
    }
  };

  // Update boost
  const updateBoost = (deltaTime) => {
    // Handled in updateShipMovement
  };

  // Check wave completion
  const checkWaveCompletion = () => {
    const game = gameRef.current;

    if (game.asteroids.length === 0 && gameState === 'playing') {
      // Wave complete!
      setScore(s => s + 100);
      setWave(w => {
        const nextWave = w + 1;
        setTimeout(() => {
          spawnWave(nextWave);
        }, 2000);
        return nextWave;
      });
    }
  };

  // Animation loop
  const animate = () => {
    const game = gameRef.current;
    const now = performance.now();
    const deltaTime = Math.min((now - game.lastTime) / 1000, 0.1);
    game.lastTime = now;

    updateGame(deltaTime);

    if (game.renderer && game.scene && game.camera) {
      game.renderer.render(game.scene, game.camera);
    }

    game.animationId = requestAnimationFrame(animate);
  };

  // Event handlers
  const handleKeyDown = (e) => {
    const game = gameRef.current;
    game.keys[e.key] = true;

    if (e.key === 'Escape') {
      if (gameState === 'playing') {
        setGameState('paused');
      } else if (gameState === 'paused') {
        setGameState('playing');
      }
    }

    if (e.key === 'u' || e.key === 'U') {
      setShowUpgrades(u => !u);
      if (gameState === 'playing') {
        setGameState('paused');
      } else if (gameState === 'paused' && showUpgrades) {
        setGameState('playing');
      }
    }

    if (e.key === 'r' || e.key === 'R') {
      if (gameState === 'gameOver') {
        restartGame();
      }
    }
  };

  const handleKeyUp = (e) => {
    const game = gameRef.current;
    game.keys[e.key] = false;
  };

  const handleMouseMove = (e) => {
    const game = gameRef.current;

    if (document.pointerLockElement === canvasRef.current) {
      game.mouseX += e.movementX;
      game.mouseY += e.movementY;

      // Clamp
      game.mouseX = Math.max(-500, Math.min(500, game.mouseX));
      game.mouseY = Math.max(-500, Math.min(500, game.mouseY));
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0 && gameState === 'playing') {
      fireLaser();
    }
  };

  const handleResize = () => {
    const game = gameRef.current;

    if (game.camera && game.renderer) {
      game.camera.aspect = window.innerWidth / window.innerHeight;
      game.camera.updateProjectionMatrix();
      game.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  const handlePointerLock = () => {
    if (gameState === 'playing') {
      canvasRef.current?.requestPointerLock();
    }
  };

  // Start game
  const startGame = () => {
    setGameState('playing');
    spawnWave(1);
  };

  // Restart game
  const restartGame = () => {
    const game = gameRef.current;

    // Clear all game objects
    game.asteroids.forEach(a => game.scene.remove(a.mesh));
    game.resourceOrbs.forEach(r => game.scene.remove(r.mesh));
    game.particles.forEach(p => game.scene.remove(p.mesh));
    game.lasers.forEach(l => game.scene.remove(l.mesh));

    game.asteroids = [];
    game.resourceOrbs = [];
    game.particles = [];
    game.lasers = [];

    // Reset state
    setHealth(100);
    setMaxHealth(100);
    setShield(100);
    setBoost(100);
    setScore(0);
    setWave(1);
    setResources({ gold: 0, blue: 0, purple: 0 });
    setUpgrades({
      laserDamage: 1,
      shipSpeed: 1,
      maxHealth: 1,
      boostDuration: 1
    });

    // Reset ship position
    game.ship.position.set(0, 0, 0);
    game.shipVelocity.set(0, 0, 0);
    game.mouseX = 0;
    game.mouseY = 0;

    setGameState('playing');
    spawnWave(1);
  };

  // Purchase upgrade
  const purchaseUpgrade = (upgradeType) => {
    const currentLevel = upgrades[upgradeType];
    const cost = upgradeCosts[upgradeType][currentLevel];
    const resourceType = upgradeResourceType[upgradeType];

    if (!cost) return; // Max level

    // Check if can afford
    let canAfford = false;
    if (upgradeType === 'boostDuration') {
      canAfford = resources.gold >= cost / 2 && resources.blue >= cost / 2;
    } else {
      canAfford = resources[resourceType] >= cost;
    }

    if (!canAfford) return;

    // Deduct resources
    if (upgradeType === 'boostDuration') {
      setResources(r => ({
        ...r,
        gold: r.gold - cost / 2,
        blue: r.blue - cost / 2
      }));
    } else {
      setResources(r => ({
        ...r,
        [resourceType]: r[resourceType] - cost
      }));
    }

    // Apply upgrade
    setUpgrades(u => ({
      ...u,
      [upgradeType]: currentLevel + 1
    }));

    // Special effects
    if (upgradeType === 'maxHealth') {
      const newMax = [100, 150, 200][currentLevel];
      setMaxHealth(newMax);
      setHealth(newMax);
    }
  };

  // Check game over
  useEffect(() => {
    if (health <= 0 && gameState === 'playing') {
      setGameState('gameOver');
    }
  }, [health, gameState]);

  // Render upgrade button
  const UpgradeButton = ({ type, name, icon, description }) => {
    const currentLevel = upgrades[type];
    const cost = upgradeCosts[type][currentLevel];
    const resourceType = upgradeResourceType[type];
    const maxLevel = !cost;

    let canAfford = false;
    if (type === 'boostDuration') {
      canAfford = resources.gold >= cost / 2 && resources.blue >= cost / 2;
    } else if (!maxLevel) {
      canAfford = resources[resourceType] >= cost;
    }

    const resourceColors = {
      gold: 'text-yellow-400',
      blue: 'text-cyan-400',
      purple: 'text-purple-400'
    };

    return (
      <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg mb-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-white font-bold">{icon} {name}</div>
            <div className="text-gray-400 text-sm">{description}</div>
          </div>
          <div className="text-white text-sm">Lv {currentLevel}</div>
        </div>
        {!maxLevel ? (
          <button
            onClick={() => purchaseUpgrade(type)}
            disabled={!canAfford}
            className={`w-full py-2 px-4 rounded ${
              canAfford
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {type === 'boostDuration' ? (
              <span>
                Upgrade: <span className={resourceColors.gold}>{cost / 2}G</span> + <span className={resourceColors.blue}>{cost / 2}B</span>
              </span>
            ) : (
              <span>
                Upgrade: <span className={resourceColors[resourceType]}>{cost} {resourceType.charAt(0).toUpperCase()}</span>
              </span>
            )}
          </button>
        ) : (
          <div className="text-center text-green-400 font-bold">MAX LEVEL</div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* HUD */}
      {gameState === 'playing' && (
        <>
          {/* Top Left - Status Bars */}
          <div className="absolute top-4 left-4 space-y-2">
            {/* Health */}
            <div>
              <div className="text-red-400 text-sm font-bold mb-1">HEALTH</div>
              <div className="w-64 h-6 bg-gray-800 bg-opacity-80 rounded-full overflow-hidden border-2 border-red-900">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                  style={{ width: `${(health / maxHealth) * 100}%` }}
                />
              </div>
            </div>

            {/* Boost */}
            <div>
              <div className="text-yellow-400 text-sm font-bold mb-1">BOOST</div>
              <div className="w-64 h-4 bg-gray-800 bg-opacity-80 rounded-full overflow-hidden border-2 border-yellow-900">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-300"
                  style={{ width: `${boost}%` }}
                />
              </div>
            </div>
          </div>

          {/* Top Right - Resources */}
          <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-80 p-4 rounded-lg border-2 border-gray-700">
            <div className="text-white font-bold mb-2">RESOURCES</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between space-x-4">
                <span className="text-yellow-400">◆ Gold:</span>
                <span className="text-white font-bold">{resources.gold}</span>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <span className="text-cyan-400">◆ Blue:</span>
                <span className="text-white font-bold">{resources.blue}</span>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <span className="text-purple-400">◆ Purple:</span>
                <span className="text-white font-bold">{resources.purple}</span>
              </div>
            </div>
          </div>

          {/* Top Center - Wave Info */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-80 px-6 py-3 rounded-lg border-2 border-blue-700">
            <div className="text-center">
              <div className="text-blue-400 text-sm font-bold">WAVE {wave}</div>
              <div className="text-white text-lg font-bold">{enemiesRemaining} ENEMIES</div>
              <div className="text-yellow-400 text-sm">SCORE: {score}</div>
            </div>
          </div>

          {/* Center - Crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-8 h-8">
              <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-cyan-400 transform -translate-x-1/2"></div>
              <div className="absolute bottom-0 left-1/2 w-0.5 h-3 bg-cyan-400 transform -translate-x-1/2"></div>
              <div className="absolute left-0 top-1/2 h-0.5 w-3 bg-cyan-400 transform -translate-y-1/2"></div>
              <div className="absolute right-0 top-1/2 h-0.5 w-3 bg-cyan-400 transform -translate-y-1/2"></div>
            </div>
          </div>

          {/* Controls Helper */}
          {showControls && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-90 px-6 py-4 rounded-lg border-2 border-gray-700">
              <div className="text-white text-sm space-y-1">
                <div><span className="text-cyan-400 font-bold">WASD:</span> Move Ship</div>
                <div><span className="text-cyan-400 font-bold">MOUSE:</span> Look Around</div>
                <div><span className="text-cyan-400 font-bold">LEFT CLICK:</span> Fire Laser</div>
                <div><span className="text-cyan-400 font-bold">SPACE:</span> Boost</div>
                <div><span className="text-cyan-400 font-bold">U:</span> Upgrades</div>
                <div><span className="text-cyan-400 font-bold">ESC:</span> Pause</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-cyan-400 mb-4 tracking-wider">
              ASTEROID MINER
            </h1>
            <p className="text-white text-xl mb-8">Survive the waves. Collect resources. Upgrade your ship.</p>
            <button
              onClick={startGame}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-8 rounded-lg text-2xl transition-colors"
            >
              PRESS SPACE TO START
            </button>
            <div className="mt-8 text-gray-400 text-sm space-y-1">
              <div>WASD: Move | Mouse: Look | Left Click: Fire</div>
              <div>Space: Boost | U: Upgrades | ESC: Pause</div>
            </div>
          </div>
        </div>
      )}

      {/* Pause Screen */}
      {gameState === 'paused' && !showUpgrades && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">PAUSED</h2>
            <p className="text-gray-400">Press ESC to resume</p>
          </div>
        </div>
      )}

      {/* Upgrade Menu */}
      {showUpgrades && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-gray-900 p-8 rounded-lg border-2 border-cyan-700 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">UPGRADES</h2>

            <div className="mb-6 text-center">
              <div className="text-white">
                <span className="text-yellow-400 font-bold">{resources.gold}</span> Gold |
                <span className="text-cyan-400 font-bold"> {resources.blue}</span> Blue |
                <span className="text-purple-400 font-bold"> {resources.purple}</span> Purple
              </div>
            </div>

            <div className="space-y-3">
              <UpgradeButton
                type="laserDamage"
                name="Laser Damage"
                icon="⚡"
                description="Increase laser power and unlock piercing"
              />

              <UpgradeButton
                type="shipSpeed"
                name="Ship Speed"
                icon="🚀"
                description="Boost your ship's movement speed"
              />

              <UpgradeButton
                type="maxHealth"
                name="Max Health"
                icon="❤️"
                description="Increase maximum health and restore to full"
              />

              <UpgradeButton
                type="boostDuration"
                name="Boost Duration"
                icon="⚡"
                description="Extend boost duration before recharge"
              />
            </div>

            <button
              onClick={() => {
                setShowUpgrades(false);
                setGameState('playing');
              }}
              className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              CLOSE (U or ESC)
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-red-500 mb-6">GAME OVER</h2>
            <div className="bg-gray-900 bg-opacity-90 p-8 rounded-lg border-2 border-red-700 mb-6">
              <div className="text-white text-2xl mb-4">Final Statistics</div>
              <div className="space-y-2 text-lg">
                <div className="text-yellow-400">Score: <span className="text-white font-bold">{score}</span></div>
                <div className="text-cyan-400">Waves Completed: <span className="text-white font-bold">{wave - 1}</span></div>
                <div className="text-white">Resources Collected:</div>
                <div className="text-yellow-400">◆ Gold: {resources.gold}</div>
                <div className="text-cyan-400">◆ Blue: {resources.blue}</div>
                <div className="text-purple-400">◆ Purple: {resources.purple}</div>
              </div>
            </div>
            <button
              onClick={restartGame}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-2xl transition-colors"
            >
              PRESS R TO RESTART
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsteroidMiner;
