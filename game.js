const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

const CAR_WIDTH = 50;
const CAR_HEIGHT = 80;
const CAR_SPEED = 5;

const ANIMAL_WIDTH = 48;
const ANIMAL_HEIGHT = 48;
const ANIMAL_SPEED_MIN = 2;
const ANIMAL_SPEED_MAX = 6;
const ANIMAL_SPAWN_INTERVAL = 70; // frames

let car = {
  x: (CANVAS_WIDTH - CAR_WIDTH) / 2,
  y: CANVAS_HEIGHT - CAR_HEIGHT - 10,
  width: CAR_WIDTH,
  height: CAR_HEIGHT,
};

let animals = [];
let keys = {};
let frameCount = 0;
let gameOver = false;
let win = false;

// Animal types with drawing functions
const animalTypes = [
  {
    name: "Deer",
    color: "#C2B280",
    draw: function(ctx, x, y, w, h) {
      // Body
      ctx.fillStyle = "#C2B280";
      ctx.fillRect(x+10, y+18, w-20, h-26);
      // Head
      ctx.beginPath();
      ctx.arc(x + w/2, y+14, 16, 0, Math.PI*2);
      ctx.fillStyle = "#C2B280";
      ctx.fill();
      // Antlers
      ctx.strokeStyle = "#A88";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x+w/2-8, y+4);
      ctx.lineTo(x+w/2-16, y-8);
      ctx.moveTo(x+w/2+8, y+4);
      ctx.lineTo(x+w/2+16, y-8);
      ctx.stroke();
      // Legs
      ctx.fillStyle = "#A88";
      ctx.fillRect(x+14, y+h-10, 6, 12);
      ctx.fillRect(x+w-20, y+h-10, 6, 12);
    }
  },
  {
    name: "Fox",
    color: "#F60",
    draw: function(ctx, x, y, w, h) {
      // Body
      ctx.fillStyle = "#F60";
      ctx.fillRect(x+10, y+20, w-20, h-30);
      // Head
      ctx.beginPath();
      ctx.arc(x + w/2, y+18, 14, 0, Math.PI*2);
      ctx.fillStyle = "#F60";
      ctx.fill();
      // Ears
      ctx.fillStyle = "#C90";
      ctx.beginPath();
      ctx.moveTo(x+w/2-10, y+7);
      ctx.lineTo(x+w/2-18, y-6);
      ctx.lineTo(x+w/2-2, y+10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x+w/2+10, y+7);
      ctx.lineTo(x+w/2+18, y-6);
      ctx.lineTo(x+w/2+2, y+10);
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.moveTo(x+w-10, y+h-18);
      ctx.quadraticCurveTo(x+w+18, y+h-10, x+w-4, y+h-4);
      ctx.lineTo(x+w-12, y+h-10);
      ctx.closePath();
      ctx.fillStyle = "#FFF";
      ctx.fill();
    }
  },
  {
    name: "Rabbit",
    color: "#FFF",
    draw: function(ctx, x, y, w, h) {
      // Body
      ctx.fillStyle = "#FFF";
      ctx.fillRect(x+14, y+22, w-28, h-32);
      // Head
      ctx.beginPath();
      ctx.arc(x + w/2, y+18, 12, 0, Math.PI*2);
      ctx.fillStyle = "#EEE";
      ctx.fill();
      // Ears
      ctx.fillStyle = "#FFF";
      ctx.fillRect(x+w/2-12, y+2, 6, 18);
      ctx.fillRect(x+w/2+6, y+2, 6, 18);
      // Nose
      ctx.fillStyle = "#F99";
      ctx.beginPath();
      ctx.arc(x+w/2, y+24, 3, 0, Math.PI*2);
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.arc(x+18, y+h-16, 6, 0, Math.PI*2);
      ctx.fillStyle = "#FFF";
      ctx.fill();
    }
  },
  {
    name: "Raccoon",
    color: "#AAA",
    draw: function(ctx, x, y, w, h) {
      // Body
      ctx.fillStyle = "#AAA";
      ctx.fillRect(x+12, y+22, w-24, h-28);
      // Head
      ctx.beginPath();
      ctx.arc(x + w/2, y+16, 14, 0, Math.PI*2);
      ctx.fillStyle = "#AAA";
      ctx.fill();
      // Mask
      ctx.fillStyle = "#333";
      ctx.fillRect(x+w/2-10, y+12, 20, 6);
      // Eyes
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(x+w/2-6, y+16, 3, 0, Math.PI*2);
      ctx.arc(x+w/2+6, y+16, 3, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x+w/2-6, y+16, 1, 0, Math.PI*2);
      ctx.arc(x+w/2+6, y+16, 1, 0, Math.PI*2);
      ctx.fill();
      // Tail stripes
      ctx.fillStyle = "#333";
      ctx.fillRect(x+w-14, y+h-20, 12, 6);
      ctx.fillRect(x+w-14, y+h-10, 12, 6);
    }
  },
  {
    name: "Bear",
    color: "#654321",
    draw: function(ctx, x, y, w, h) {
      // Body
      ctx.fillStyle = "#654321";
      ctx.fillRect(x+10, y+20, w-20, h-34);
      // Head
      ctx.beginPath();
      ctx.arc(x + w/2, y+18, 16, 0, Math.PI*2);
      ctx.fillStyle = "#654321";
      ctx.fill();
      // Ears
      ctx.beginPath();
      ctx.arc(x+w/2-11, y+7, 5, 0, Math.PI*2);
      ctx.arc(x+w/2+11, y+7, 5, 0, Math.PI*2);
      ctx.fillStyle = "#654321";
      ctx.fill();
      // Nose
      ctx.beginPath();
      ctx.arc(x+w/2, y+25, 4, 0, Math.PI*2);
      ctx.fillStyle = "#221";
      ctx.fill();
    }
  }
];

function drawCarGraphic(ctx, x, y, w, h) {
  ctx.save();

  // Car body (side view)
  ctx.fillStyle = "#1976D2";
  ctx.fillRect(x, y + h * 0.4, w, h * 0.28);

  // Roof (angled)
  ctx.beginPath();
  ctx.moveTo(x + w * 0.18, y + h * 0.4);
  ctx.lineTo(x + w * 0.32, y + h * 0.18);
  ctx.lineTo(x + w * 0.68, y + h * 0.18);
  ctx.lineTo(x + w * 0.82, y + h * 0.4);
  ctx.closePath();
  ctx.fillStyle = "#90CAF9";
  ctx.fill();

  // Windows
  ctx.fillStyle = "#BBDEFB";
  ctx.fillRect(x + w * 0.35, y + h * 0.23, w * 0.3, h * 0.13);

  // Front light
  ctx.fillStyle = "#FFD600";
  ctx.fillRect(x + w - 8, y + h * 0.5, 8, 10);

  // Rear light
  ctx.fillStyle = "#FF5252";
  ctx.fillRect(x, y + h * 0.5, 8, 10);

  // Wheels
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(x + w * 0.22, y + h * 0.75, w * 0.13, 0, Math.PI * 2);
  ctx.arc(x + w * 0.78, y + h * 0.75, w * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // Door line
  ctx.strokeStyle = "#1565C0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + h * 0.4);
  ctx.lineTo(x + w * 0.5, y + h * 0.68);
  ctx.stroke();

  ctx.restore();
}

function drawCar() {
  drawCarGraphic(ctx, car.x, car.y, car.width, car.height);
}

function drawAnimal(animal) {
  animal.draw(ctx, animal.x, animal.y, animal.width, animal.height);
  // Animal name below
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(animal.name, animal.x + animal.width / 2, animal.y + animal.height + 14);
  ctx.restore();
}

function spawnAnimal() {
  // Random lane (y position)
  let laneY = Math.floor(Math.random() * 9) * 60 + 30;
  let direction = Math.random() < 0.5 ? 1 : -1; // left or right
  let x = direction === 1 ? -ANIMAL_WIDTH : CANVAS_WIDTH;
  let speed = Math.random() * (ANIMAL_SPEED_MAX - ANIMAL_SPEED_MIN) + ANIMAL_SPEED_MIN;
  speed *= direction;
  let animalType = Math.floor(Math.random() * animalTypes.length);
  let typeObj = animalTypes[animalType];
  animals.push({
    x: x,
    y: laneY,
    width: ANIMAL_WIDTH,
    height: ANIMAL_HEIGHT,
    speed: speed,
    name: typeObj.name,
    draw: typeObj.draw
  });
}

function moveCar() {
  if (keys["ArrowLeft"] || keys["a"]) car.x -= CAR_SPEED;
  if (keys["ArrowRight"] || keys["d"]) car.x += CAR_SPEED;
  if (keys["ArrowUp"] || keys["w"]) car.y -= CAR_SPEED;
  if (keys["ArrowDown"] || keys["s"]) car.y += CAR_SPEED;

  // Boundaries
  car.x = Math.max(0, Math.min(CANVAS_WIDTH - CAR_WIDTH, car.x));
  car.y = Math.max(0, Math.min(CANVAS_HEIGHT - CAR_HEIGHT, car.y));
}

function moveAnimals() {
  animals.forEach(animal => {
    animal.x += animal.speed;
  });
  animals = animals.filter(animal =>
    animal.x + animal.width > 0 && animal.x < CANVAS_WIDTH
  );
}

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function checkGameOver() {
  for (let animal of animals) {
    if (checkCollision(car, animal)) {
      gameOver = true;
      return;
    }
  }
  if (car.y <= 0) {
    win = true;
    gameOver = true;
  }
}

function drawRoad() {
  ctx.fillStyle = "#666";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Lane lines
  ctx.strokeStyle = "#fff";
  ctx.setLineDash([15, 15]);
  for (let i = 1; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CANVAS_WIDTH / 6, 0);
    ctx.lineTo(i * CANVAS_WIDTH / 6, CANVAS_HEIGHT);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Grass edges
  ctx.fillStyle = "#388E3C";
  ctx.fillRect(0, 0, CANVAS_WIDTH, 24);
  ctx.fillRect(0, CANVAS_HEIGHT-24, CANVAS_WIDTH, 24);
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawRoad();
  drawCar();
  animals.forEach(drawAnimal);
  if (gameOver) {
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1;
    ctx.fillStyle = win ? "#0f0" : "#f00";
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(win ? "You Win!" : "Game Over!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    ctx.restore();
  }
}

function gameLoop() {
  if (!gameOver) {
    moveCar();
    moveAnimals();
    if (frameCount % ANIMAL_SPAWN_INTERVAL === 0) {
      spawnAnimal();
    }
    checkGameOver();
  }
  draw();
  frameCount++;
  requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (gameOver && e.key.toLowerCase() === "r") resetGame();
});
window.addEventListener("keyup", e => {
  keys[e.key] = false;
});

function resetGame() {
  car = {
    x: (CANVAS_WIDTH - CAR_WIDTH) / 2,
    y: CANVAS_HEIGHT - CAR_HEIGHT - 10,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
  };
  animals = [];
  frameCount = 0;
  gameOver = false;
  win = false;
}

gameLoop();