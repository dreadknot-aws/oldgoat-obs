import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let roadMesh;

// --- Configuration ---
const ROAD_SEGMENTS = 100;    // Number of points defining the path
const SEGMENT_LENGTH = 10;    // Approximate length of each segment
const ROAD_WIDTH = 4;         // Width of the road surface
const CURVE_TENSION = 0.5;    // Catmull-Rom curve tension (0=linear, 0.5=default, 1=tighter)
const MAX_TURN_ANGLE = Math.PI / 18; // Max random turn per segment (radians)
const MAX_ELEVATION_CHANGE = 0.5;   // Max random elevation change per segment

// --- Initialization ---
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background
    scene.fog = new THREE.Fog(0x87ceeb, 100, 500); // Add fog for depth

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows
    document.getElementById('container').appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    // Configure shadow properties for better quality
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -150;
    directionalLight.shadow.camera.right = 150;
    directionalLight.shadow.camera.top = 150;
    directionalLight.shadow.camera.bottom = -150;
    scene.add(directionalLight);
    // Optional: Visualize shadow camera
    // const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(shadowHelper);


    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooths camera movement
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false; // Keep panning relative to ground
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't let camera go below ground
    controls.minDistance = 10;
    controls.maxDistance = 500;


    // Ground Plane
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, side: THREE.DoubleSide }); // Forest green
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate flat
    ground.position.y = -0.1; // Slightly below the road start
    ground.receiveShadow = true; // Ground receives shadows
    scene.add(ground);

    // Generate and Add Road
    generateAndAddRoad();

    // Handle Window Resize
    window.addEventListener('resize', onWindowResize, false);

    // Start Animation Loop
    animate();
}

// --- Procedural Road Generation ---
function generateRoadPath() {
    const points = [];
    let currentPoint = new THREE.Vector3(0, 0, 0);
    let direction = new THREE.Vector3(0, 0, 1); // Initial direction (along Z)

    points.push(currentPoint.clone()); // Add starting point

    for (let i = 0; i < ROAD_SEGMENTS; i++) {
        // 1. Apply random turn (rotation around Y axis)
        const turnAngle = (Math.random() - 0.5) * 2 * MAX_TURN_ANGLE;
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), turnAngle);
        direction.normalize(); // Keep direction as a unit vector

        // 2. Calculate next point position
        const nextPoint = currentPoint.clone().addScaledVector(direction, SEGMENT_LENGTH);

        // 3. Add random elevation change
        nextPoint.y += (Math.random() - 0.5) * 2 * MAX_ELEVATION_CHANGE;
        // Optional: Clamp y to be non-negative if desired
        // nextPoint.y = Math.max(0, nextPoint.y);

        points.push(nextPoint);
        currentPoint = nextPoint; // Update current point for next iteration
    }
    console.log(`Generated ${points.length} path points.`);
    return points;
}

function createRoadGeometry(pathPoints) {
    if (pathPoints.length < 2) {
        console.error("Need at least 2 points for a path.");
        return null;
    }

    // 1. Create a smooth curve from the points
    const curve = new THREE.CatmullRomCurve3(
        pathPoints,
        false, // Closed loop? No
        'catmullrom', // Curve type
        CURVE_TENSION // Tension
    );

    // 2. Define the road cross-section shape (a simple rectangle)
    const roadShape = new THREE.Shape();
    const halfWidth = ROAD_WIDTH / 2;
    roadShape.moveTo(-halfWidth, 0); // Bottom-left
    roadShape.lineTo(halfWidth, 0);  // Bottom-right
    roadShape.lineTo(halfWidth, 0.2); // Top-right (slight thickness)
    roadShape.lineTo(-halfWidth, 0.2);// Top-left
    roadShape.closePath();           // Close the shape

    // 3. Extrude the shape along the curve
    const extrudeSettings = {
        steps: Math.max(1, pathPoints.length * 3), // Number of steps along the curve (more = smoother)
        bevelEnabled: false, // No bevel for a simple road
        extrudePath: curve // The path to extrude along
    };

    const geometry = new THREE.ExtrudeGeometry(roadShape, extrudeSettings);
    console.log("Road geometry created.");
    return geometry;
}

function generateAndAddRoad() {
    // Remove existing road if any
    if (roadMesh) {
        scene.remove(roadMesh);
        roadMesh.geometry.dispose();
        roadMesh.material.dispose();
    }

    const pathPoints = generateRoadPath();
    const roadGeometry = createRoadGeometry(pathPoints);

    if (roadGeometry) {
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444, // Dark gray
            roughness: 0.8,
            metalness: 0.1
        });
        roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
        roadMesh.castShadow = true; // Road casts shadows
        roadMesh.receiveShadow = true; // Road can receive shadows (e.g., from future objects)
        scene.add(roadMesh);
        console.log("Road mesh added to scene.");
    }
}

// --- Window Resize Handler ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate); // Queue next frame

    controls.update(); // Update controls (important for damping)
    renderer.render(scene, camera); // Render the scene
}

// --- Start ---
init();

// --- Optional: Add a button to regenerate the road ---
const button = document.createElement('button');
button.textContent = 'Regenerate Road';
button.style.position = 'absolute';
button.style.bottom = '20px';
button.style.left = '20px';
button.style.padding = '10px';
button.style.zIndex = '2'; // Ensure button is clickable
button.onclick = generateAndAddRoad;
document.body.appendChild(button);