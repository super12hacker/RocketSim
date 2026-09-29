const canvas = document.getElementById('gameCanvas');
const scoreEl = document.getElementById('score');
const boostEl = document.getElementById('boost');
const statusEl = document.getElementById('status');
const roomInput = document.getElementById('roomInput');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87c1ff);
scene.fog = new THREE.Fog(0x87c1ff, 28, 140);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 15, 28);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const ambient = new THREE.HemisphereLight(0xdfeeff, 0x1d2736, 1.2);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1.1);
sun.position.set(12, 24, 16);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const arena = new THREE.Group();
scene.add(arena);

const field = new THREE.Mesh(
  new THREE.BoxGeometry(30, 1, 18),
  new THREE.MeshStandardMaterial({ color: 0x22b14c, roughness: 0.8 })
);
field.position.y = -0.6;
field.receiveShadow = true;
arena.add(field);

const wallMat = new THREE.MeshStandardMaterial({ color: 0x2d3a5d, roughness: 0.9 });
const wallGeo = new THREE.BoxGeometry(30, 2, 1);
for (const z of [-9.2, 9.2]) {
  const w = new THREE.Mesh(wallGeo, wallMat);
  w.position.set(0, 0.5, z);
  arena.add(w);
}
const wallGeo2 = new THREE.BoxGeometry(1, 2, 18);
for (const x of [-15, 15]) {
  const w = new THREE.Mesh(wallGeo2, wallMat);
  w.position.set(x, 0.5, 0);
  arena.add(w);
}

const goalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
for (const x of [-14.8, 14.8]) {
  const goal = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 6), goalMat);
  goal.position.set(x, 1.1, 0);
  arena.add(goal);
}

const ballGeo = new THREE.SphereGeometry(0.9, 32, 32);
const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.2 });
const ball = new THREE.Mesh(ballGeo, ballMat);
ball.castShadow = true;
ball.position.set(0, 1.2, 0);
scene.add(ball);

const carMaterialA = new THREE.MeshStandardMaterial({ color: 0xff4d4d, metalness: 0.4, roughness: 0.45 });
const carMaterialB = new THREE.MeshStandardMaterial({ color: 0x4da3ff, metalness: 0.4, roughness: 0.45 });

function createCar(color) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 2.8), new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.35 }));
  body.castShadow = true;
  group.add(body);

  const top = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 1.8), new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.25 }));
  top.position.y = 0.7;
  group.add(top);

  group.userData = {
    velocity: new THREE.Vector3(),
    steer: 0,
    boost: 100,
    score: 0,
    target: new THREE.Vector3(),
    radius: 1.6
  };

  return group;
}

const redCar = createCar(0xff4d4d);
const blueCar = createCar(0x4da3ff);
redCar.position.set(-8, 1.2, 0);
blueCar.position.set(8, 1.2, 0);
scene.add(redCar, blueCar);

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

const state = {
  mode: 'local',
  started: false,
  score: { red: 0, blue: 0 },
  peer: null,
  conn: null,
  room: '',
  roomCode: '',
  local: true
};

const controls = {
  red: { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright', boost: ' ' },
  blue: { up: 'w', down: 's', left: 'a', right: 'd', boost: 'shift' }
};

function resetBall() {
  ball.position.set(0, 1.2, 0);
  ball.userData.velocity = new THREE.Vector3();
}

function scoreGoal(team) {
  state.score[team] += 1;
  scoreEl.textContent = `${state.score.red} - ${state.score.blue}`;
  resetBall();
}

function handleInput(car, team, dt) {
  const c = controls[team];
  const v = car.userData.velocity;
  const move = new THREE.Vector3(
    (keys[c.right] ? 1 : 0) - (keys[c.left] ? 1 : 0),
    0,
    (keys[c.down] ? 1 : 0) - (keys[c.up] ? 1 : 0)
  );

  if (move.lengthSq() > 0) {
    move.normalize();
    const speed = keys[c.boost] ? 18 : 10;
    const add = move.multiplyScalar(speed * dt);
    v.x += add.x;
    v.z += add.z;
  }

  v.multiplyScalar(0.96);
  const maxSpeed = 20;
  if (v.length() > maxSpeed) v.setLength(maxSpeed);

  car.position.addScaledVector(v, dt);
  car.rotation.y = Math.atan2(v.x, v.z);

  const boost = car.userData.boost;
  if (keys[c.boost] && boost > 0) {
    car.position.addScaledVector(v.clone().normalize(), 7 * dt);
    car.userData.boost = Math.max(0, boost - 18 * dt);
  } else {
    car.userData.boost = Math.min(100, boost + 12 * dt);
  }

  boostEl.textContent = `${Math.round(car.userData.boost)}%`;

  car.position.x = THREE.MathUtils.clamp(car.position.x, -13.5, 13.5);
  car.position.z = THREE.MathUtils.clamp(car.position.z, -8.2, 8.2);
}

function updateBall(dt) {
  ball.userData.velocity = ball.userData.velocity || new THREE.Vector3();
  ball.userData.velocity.y -= 3.4 * dt;
  ball.position.addScaledVector(ball.userData.velocity, dt);

  const radius = 0.9;
  if (ball.position.x > 14.2 - radius) {
    ball.position.x = 14.2 - radius;
    ball.userData.velocity.x *= -0.75;
  }
  if (ball.position.x < -14.2 + radius) {
    ball.position.x = -14.2 + radius;
    ball.userData.velocity.x *= -0.75;
  }
  if (ball.position.z > 8.5 - radius) {
    ball.position.z = 8.5 - radius;
    ball.userData.velocity.z *= -0.8;
  }
  if (ball.position.z < -8.5 + radius) {
    ball.position.z = -8.5 + radius;
    ball.userData.velocity.z *= -0.8;
  }

  const cars = [redCar, blueCar];
  for (const car of cars) {
    const offset = ball.position.clone().sub(car.position);
    const distance = offset.length();
    const minDist = 1.9 + radius;
    if (distance < minDist) {
      const normal = offset.normalize();
      const hitStrength = 8;
      const push = normal.multiplyScalar((minDist - distance) * 0.7);
      ball.position.add(push);
      const carVel = car.userData.velocity.clone();
      const impact = normal.multiplyScalar(Math.max(0, carVel.length() * 0.8 + hitStrength));
      ball.userData.velocity.add(impact);
    }
  }

  if (ball.position.x > 15) scoreGoal('red');
  if (ball.position.x < -15) scoreGoal('blue');

  ball.userData.velocity.multiplyScalar(0.998);
  ball.position.y = Math.max(1.2, ball.position.y);
}

function animate() {
  requestAnimationFrame(animate);
  const dt = 1 / 60;

  if (state.started) {
    handleInput(redCar, 'red', dt);
    handleInput(blueCar, 'blue', dt);
    updateBall(dt);
  }

  const target = new THREE.Vector3(
    (redCar.position.x + blueCar.position.x) * 0.5,
    10,
    26
  );
  camera.position.lerp(target, 0.06);
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

function setMode(mode) {
  state.mode = mode;
  document.getElementById('localBtn').classList.toggle('active', mode === 'local');
  document.getElementById('multiBtn').classList.toggle('active', mode === 'multi');
  document.getElementById('roomBox').classList.toggle('hidden', mode !== 'multi');
  statusEl.textContent = mode === 'local' ? 'Local mode ready' : 'Multiplayer mode ready';
}

document.getElementById('localBtn').addEventListener('click', () => setMode('local'));
document.getElementById('multiBtn').addEventListener('click', () => setMode('multi'));

function startMatch() {
  state.started = true;
  statusEl.textContent = 'Match running';
  resetBall();
  redCar.position.set(-8, 1.2, 0);
  blueCar.position.set(8, 1.2, 0);
  redCar.userData.velocity.set(0, 0, 0);
  blueCar.userData.velocity.set(0, 0, 0);
}

document.getElementById('startBtn').addEventListener('click', startMatch);

document.getElementById('hostBtn').addEventListener('click', () => {
  if (!state.peer) state.peer = new Peer();
  state.peer.on('open', (id) => {
    state.room = id.slice(0, 8).toUpperCase();
    roomInput.value = state.room;
    statusEl.textContent = `Hosting room ${state.room}`;
  });
  state.peer.on('connection', (conn) => {
    state.conn = conn;
    statusEl.textContent = 'Connected to guest';
  });
});

document.getElementById('joinBtn').addEventListener('click', () => {
  if (!state.peer) state.peer = new Peer();
  const room = roomInput.value.trim().toUpperCase();
  if (!room) {
    statusEl.textContent = 'Enter room code';
    return;
  }
  state.conn = state.peer.connect(room);
  state.conn.on('open', () => {
    statusEl.textContent = `Joined room ${room}`;
    startMatch();
  });
  state.conn.on('error', (err) => {
    statusEl.textContent = `Connection error: ${err}`;
  });
});

setMode('local');
resize();
animate();

window.addEventListener('resize', resize);
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
