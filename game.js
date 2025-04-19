let scene, camera, renderer;
let spaceship, asteroids = [], powerUps = [];
let mouseX = 0, mouseY = 0;
let score = 0, health = 100, speed = 0.15;
let isGameOver = false;
let hasStarted = false;  // To track if the game has started

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(0, 0, 10);
  scene.add(light);

  // Spaceship
  const geometry = new THREE.BoxGeometry(1, 0.5, 2);
  const material = new THREE.MeshStandardMaterial({ color: 0x00fffc });
  spaceship = new THREE.Mesh(geometry, material);
  scene.add(spaceship);

  createStarfield();

  // Events
  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onWindowResize);

  // Show instructions modal
  if (!hasStarted) {
    document.getElementById('instructionsModal').style.display = 'block';
  }
}

function startGame() {
  hasStarted = true;
  document.getElementById('instructionsModal').style.display = 'none';  // Hide instructions modal
  animate();
}

function onMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  if (isGameOver) return;

  requestAnimationFrame(animate);

  // Move spaceship
  spaceship.position.x += (mouseX * 5 - spaceship.position.x) * 0.1;
  spaceship.position.y += (mouseY * 3 - spaceship.position.y) * 0.1;

  spawnObjects();
  updateObjects();
  updateUI();

  if (health <= 0) {
    endGame();
  }

  renderer.render(scene, camera);
}

function spawnObjects() {
  // Asteroids (Brown color)
  if (Math.random() < 0.05) {
    const geo = new THREE.IcosahedronGeometry(0.5 + Math.random());
    const mat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });  // Brown color
    const asteroid = new THREE.Mesh(geo, mat);
    asteroid.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6,
      -20
    );
    scene.add(asteroid);
    asteroids.push(asteroid);
  }

  // Power-ups (Yellow color)
  if (Math.random() < 0.01) {
    const geo = new THREE.SphereGeometry(0.3);
    const mat = new THREE.MeshStandardMaterial({ color: 0xFFFF00 });  // Yellow color
    const powerUp = new THREE.Mesh(geo, mat);
    powerUp.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6,
      -20
    );
    scene.add(powerUp);
    powerUps.push(powerUp);
  }
}

function updateObjects() {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    a.position.z += speed;
    if (a.position.z > 5) {
      scene.remove(a);
      asteroids.splice(i, 1);
      continue;
    }

    if (checkCollision(spaceship, a)) {
      health -= 10;
      scene.remove(a);
      asteroids.splice(i, 1);
    }
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    p.position.z += speed;
    if (p.position.z > 5) {
      scene.remove(p);
      powerUps.splice(i, 1);
      continue;
    }

    if (checkCollision(spaceship, p)) {
      score += 50;
      scene.remove(p);
      powerUps.splice(i, 1);
    }
  }

  speed += 0.0001; // Gradually increase difficulty
}

function checkCollision(obj1, obj2) {
  const box1 = new THREE.Box3().setFromObject(obj1);
  const box2 = new THREE.Box3().setFromObject(obj2);
  return box1.intersectsBox(box2);
}

function updateUI() {
  document.getElementById('score').textContent = score;
  document.getElementById('health').textContent = health;
}

function endGame() {
  isGameOver = true;
  document.getElementById("gameOver").style.display = "block";
  document.getElementById("restartBtn").style.display = "inline-block";  // Show the restart button
}

function restartGame() {
  // Reset variables
  score = 0;
  health = 100;
  speed = 0.15;
  isGameOver = false;

  // Reset UI
  document.getElementById("score").textContent = "0";
  document.getElementById("health").textContent = "100";
  document.getElementById("gameOver").style.display = "none";
  document.getElementById("restartBtn").style.display = "none";  // Hide the restart button

  // Remove old objects
  asteroids.forEach(a => scene.remove(a));
  powerUps.forEach(p => scene.remove(p));
  asteroids = [];
  powerUps = [];

  // Reset spaceship
  spaceship.position.set(0, 0, 0);

  animate(); // Restart loop
}

function createStarfield() {
  const stars = new THREE.BufferGeometry();
  const starCount = 1000;
  const positions = [];

  for (let i = 0; i < starCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      -Math.random() * 200
    );
  }

  stars.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  const starField = new THREE.Points(stars, starMaterial);
  scene.add(starField);
}
