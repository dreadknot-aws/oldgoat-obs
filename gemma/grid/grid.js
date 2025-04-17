const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

// --- Configuration ---
const gridSize = 50; // Number of cells along each side
const cellSize = 10; // Size of each cell in 3D space units
const gridColor = '#666';
const gridLineWidth = 1;

const gridGradientColor = getRandomColor()
const gridGradientColor2 = getRandomColor()

// Camera and Projection Settings
const camera = {
    x: 0,
    y: 100,  // Height above the grid
    z: -300, // Distance back from the origin (negative Z is towards the viewer)
    focalLength: 1500 // Affects perspective intensity (higher = less perspective)
};

let angleX = 0.5; // Initial rotation around X-axis (tilt)
let angleY = 0.5; // Initial rotation around Y-axis

// Mouse Interaction State
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
const rotationSpeed = 0.005;

// --- Setup ---
function setup() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    addEventListeners();
    createGridPoints();
    animate(); // Start the animation loop
}

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
}

// --- Grid Points Generation ---
let gridPoints = [];

function createGridPoints() {
    gridPoints = [];
    const halfGridWorldSize = (gridSize * cellSize) / 2;

    for (let i = 0; i <= gridSize; i++) {
        // Lines along Z-axis (vertical on the grid plane)
        const x = -halfGridWorldSize + i * cellSize;
        gridPoints.push({ x: x, y: 0, z: -halfGridWorldSize }); // Start point
        gridPoints.push({ x: x, y: 0, z: halfGridWorldSize });  // End point

        // Lines along X-axis (horizontal on the grid plane)
        const z = -halfGridWorldSize + i * cellSize;
        gridPoints.push({ x: -halfGridWorldSize, y: 0, z: z }); // Start point
        gridPoints.push({ x: halfGridWorldSize, y: 0, z: z });  // End point
    }
}

// --- 3D Math ---

// Rotate point around X axis
function rotateX(point, angle) {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const y = point.y * cosA - point.z * sinA;
    const z = point.y * sinA + point.z * cosA;
    return { x: point.x, y: y, z: z };
}

// Rotate point around Y axis
function rotateY(point, angle) {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const x = point.x * cosA + point.z * sinA;
    const z = -point.x * sinA + point.z * cosA;
    return { x: x, y: point.y, z: z };
}

// Project 3D point to 2D screen coordinates
function project(point) {
    // Simulate distance from camera - adjust point Z relative to camera Z
    const zRelativeToCamera = point.z - camera.z;

    if (zRelativeToCamera <= 0) { // Avoid division by zero or negative values (point is behind or at the camera)
        return null; // Don't draw points behind the camera
    }

    // Perspective scaling factor
    const scale = camera.focalLength / zRelativeToCamera;

    // Project onto the 2D plane (relative to camera X/Y)
    const projectedX = (point.x - camera.x) * scale;
    const projectedY = (point.y - camera.y) * scale;

    // Translate to canvas coordinates (center of canvas is origin)
    const screenX = canvas.width / 2 + projectedX;
    // Canvas Y is inverted (+Y is down), so subtract projectedY
    const screenY = canvas.height / 2 - projectedY;

    return { x: screenX, y: screenY };
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


// ... (keep the existing code above this point) ...

// --- Drawing ---
function drawGrid() {
    // 1. Clear the canvas (already present)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- START: Add Background Gradient ---
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); // Top to Bottom

    // Add color stops (adjust colors as desired)
    gradient.addColorStop(0, gridGradientColor); // Dark blue/purple top
    gradient.addColorStop(1, gridGradientColor2); // Very dark purple/near black bottom

    // Apply the gradient fill
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas
    // --- END: Add Background Gradient ---


    // 2. Draw the grid lines (existing code)
    const gradientGrid = ctx.createLinearGradient(0, 0, 0, canvas.height); // Top to Bottom
    gradientGrid.addColorStop(0, '#1a1a2e'); // Dark blue/purple top
    gradientGrid.addColorStop(1, '#0f0f1a'); // Very dark purple/near black bottom
    // ctx.strokeStyle = gradientGrid;
    // ctx.strokeStyle = gridColor;
    ctx.lineWidth = gridLineWidth;
    ctx.beginPath();

    // Process points in pairs (start/end of each line)
    for (let i = 0; i < gridPoints.length; i += 2) {
        let p1 = gridPoints[i];
        let p2 = gridPoints[i + 1];

        // Rotate points
        let rotatedP1 = rotateX(p1, angleX);
        rotatedP1 = rotateY(rotatedP1, angleY);

        let rotatedP2 = rotateX(p2, angleX);
        rotatedP2 = rotateY(rotatedP2, angleY);

        // Project points
        const screenP1 = project(rotatedP1);
        const screenP2 = project(rotatedP2);

        // Draw line if both points are projectable
        if (screenP1 && screenP2) {
            ctx.moveTo(screenP1.x, screenP1.y);
            ctx.lineTo(screenP2.x, screenP2.y);
        }
    }

    ctx.stroke();
}

// ... (keep the rest of the existing code: animate, addEventListeners, setup, etc.) ...

// --- Animation Loop ---
function animate() {
    drawGrid();
    requestAnimationFrame(animate); // Loop
}

// --- Event Listeners for Interaction ---
function addEventListeners() {
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;

        // Update angles based on mouse movement
        angleY += dx * rotationSpeed;
        angleX -= dy * rotationSpeed; // Subtract dy because moving mouse up should tilt grid down (positive X rotation)

        // Clamp angleX to prevent flipping upside down easily
         angleX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, angleX));


        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // No need to call drawGrid here, animate loop handles it
    });

    canvas.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            canvas.style.cursor = 'grab';
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            canvas.style.cursor = 'default'; // Or 'grab' if you prefer
        }
    });

    // Initial cursor style
    canvas.style.cursor = 'grab';
}

// --- Start ---
setup();