const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const maxWidth = 60;
const maxHeight = 15;
const maxDepth = 25;

// Randomize grid dimensions
const gridWidth = Math.floor(Math.random() * (maxWidth - 50)) + 50;
const gridHeight = Math.floor(Math.random() * (maxHeight - 10)) + 10;
const gridDepth = Math.floor(Math.random() * (maxDepth - 15)) + 15;

// Define grid parameters
let segmentLength = 10; // Length of each segment
let zoomFactor = 1.0; // Initial zoom factor

let isDragging = false;
let startX, startY;

// Set random initial rotations between 10 and 80 degrees
let rotationX = (Math.random() * 70 + 10) * (Math.PI / 180);
let rotationY = (Math.random() * 70 + 10) * (Math.PI / 180);

let prevRotationX = rotationX;
let prevRotationY = rotationY;

// Function to project 3D coordinates to 2D screen
function project(x, y, z) {
  const sinX = Math.sin(rotationX);
  const cosX = Math.cos(rotationX);
  const sinY = Math.sin(rotationY);
  const cosY = Math.cos(rotationY);

  // Rotate around X axis
  let dy = y * cosX - z * sinX;
  let dz = y * sinX + z * cosX;

  // Rotate around Y axis
  let dx = x * cosY - dz * sinY;
  dz = x * sinY + dz * cosY;

  const perspective = 1 / (1 + dz * 0.01 * zoomFactor);
  const screenX = canvas.width / 2 + dx * segmentLength * perspective;
  const screenY = canvas.height / 2 + dy * segmentLength * perspective;

  return { x: screenX, y: screenY, size: segmentLength * perspective, perspective };
}

// Function to draw a line between two points
function drawLine(x1, y1, x2, y2, alpha) {
  ctx.globalAlpha = alpha; // Set transparency
  ctx.strokeStyle = '#ffffff'; // Set color to white
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Function to check if a point should be highlighted for text
function isInTextRegion(x, y, z) {
  const centerX = Math.floor(gridWidth / 2);
  const centerY = Math.floor(gridHeight / 2);
  const centerZ = Math.floor(gridDepth / 2);

  // Define the grid coordinates for "THE INTERNET" within the center plane (z = centerZ)
  const textMap = [
    "  TTT H H EEE   III N   N TTT EEE RRR  N   N EEE TTT  ",
    "   T  H H E      I  NN  N  T  E   R  R NN  N E    T   ",
    "   T  HHH EE     I  N N N  T  EE  RRR  N N N EE   T   ",
    "   T  H H E      I  N  NN  T  E   R R  N  NN E    T   ",
    "   T  H H EEE   III N   N  T  EEE R  R N   N EEE  T   ",
  ];

  if (z !== centerZ && z !== centerZ - 1) return false;

  const textRow = textMap[y - centerY + Math.floor(textMap.length / 2)];
  if (!textRow) return false;

  const char = textRow[x - centerX + Math.floor(textRow.length / 2)];
  return char !== ' ' && char !== undefined;
}

// Function to draw the 3D grid
function draw3DGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let z = 0; z < gridDepth; z++) {
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const current = project(x - gridWidth / 2, y - gridHeight / 2, z - gridDepth / 2);
        const alpha = isInTextRegion(x, y, z) ? 1.0 : 0.1;

        if (x + 1 < gridWidth) {
          const right = project(x + 1 - gridWidth / 2, y - gridHeight / 2, z - gridDepth / 2);
          drawLine(current.x, current.y, right.x, right.y, alpha);
        }

        if (y + 1 < gridHeight) {
          const down = project(x - gridWidth / 2, y + 1 - gridHeight / 2, z - gridDepth / 2);
          drawLine(current.x, current.y, down.x, down.y, alpha);
        }

        if (z + 1 < gridDepth) {
          const forward = project(x - gridWidth / 2, y - gridHeight / 2, z + 1 - gridDepth / 2);
          drawLine(current.x, current.y, forward.x, forward.y, alpha);
        }
      }
    }
  }
}

draw3DGrid();

// Mouse events for dragging
canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    rotationX = prevRotationX + dy * 0.01;
    rotationY = prevRotationY + dx * 0.01;

    draw3DGrid();
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  prevRotationX = rotationX;
  prevRotationY = rotationY;
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
  prevRotationX = rotationX;
  prevRotationY = rotationY;
});

// Keyboard events for zooming
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    zoomFactor = Math.min(zoomFactor + 0.1, 200.0); // Zoom in
    draw3DGrid();
  } else if (e.key === 'ArrowDown') {
    zoomFactor = Math.max(zoomFactor - 0.1, 0.5); // Zoom out
    draw3DGrid();
  }
});

// Adjust canvas on resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw3DGrid();
});
