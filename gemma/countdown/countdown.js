const canvas = document.getElementById('countdownCanvas');
const ctx = canvas.getContext('2d');

// --- Configuration ---
const startNumber = 10;
const durationPerNumber = 1000; // milliseconds (1 second per number)
const canvasSize = Math.min(window.innerWidth, window.innerHeight) * 0.8; // Responsive size
const circleColor = 'rgba(220, 220, 200, 0.9)'; // Off-white, slightly transparent
const numberColor = 'rgba(240, 240, 230, 1)'; // Brighter off-white
const finalMessage = "START"; // Or "" for blank screen
const jitterAmount = 1.5; // Max pixels to jitter
const flickerMinAlpha = 0.85; // Minimum global alpha for flicker
const flickerMaxAlpha = 1.0;  // Maximum global alpha for flicker
const lineWidth = 5;

// --- Canvas Setup ---
canvas.width = canvasSize;
canvas.height = canvasSize;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = Math.min(centerX, centerY) * 0.75; // Make circle smaller than canvas

// --- Animation State ---
let startTime = null;
let currentNumber = startNumber;
let animationRunning = true;

// --- Drawing Functions ---

function drawBackground() {
    // Clear canvas with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCircle(offsetX = 0, offsetY = 0) {
    ctx.strokeStyle = circleColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(centerX + offsetX, centerY + offsetY, radius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawNumber(number, offsetX = 0, offsetY = 0) {
    const fontSize = radius * 1.1; // Make font size relative to circle
    ctx.font = `bold ${fontSize}px 'Arial Black', Gadget, sans-serif`; // Bold, blocky font
    ctx.fillStyle = numberColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), centerX + offsetX, centerY + offsetY + (fontSize * 0.05)); // Slight vertical adjustment for some fonts
}

function drawFinalMessage(offsetX = 0, offsetY = 0) {
    if (!finalMessage) return; // Don't draw if no message defined
    const fontSize = radius * 0.5; // Smaller font for message
    ctx.font = `bold ${fontSize}px 'Arial Black', Gadget, sans-serif`;
    ctx.fillStyle = numberColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(finalMessage, centerX + offsetX, centerY + offsetY);
}

// --- Animation Loop ---

function animate(timestamp) {
    if (!startTime) {
        startTime = timestamp;
    }

    const elapsedTime = timestamp - startTime;
    const numberIndex = Math.floor(elapsedTime / durationPerNumber);
    currentNumber = startNumber - numberIndex;

    // --- Calculate Effects ---
    const jitterX = (Math.random() - 0.5) * jitterAmount * 2;
    const jitterY = (Math.random() - 0.5) * jitterAmount * 2;
    const flickerAlpha = flickerMinAlpha + Math.random() * (flickerMaxAlpha - flickerMinAlpha);

    // --- Drawing ---
    drawBackground(); // Clear first

    ctx.globalAlpha = flickerAlpha; // Apply flicker

    if (currentNumber > 0) {
        drawCircle(jitterX, jitterY);
        drawNumber(currentNumber, jitterX, jitterY);
    } else {
        // Countdown finished
        drawCircle(jitterX, jitterY); // Optionally keep circle
        drawFinalMessage(jitterX, jitterY); // Draw final message
        animationRunning = false; // Prepare to stop (or let it run blank)
        // Optional: Stop loop completely after a short delay showing the final frame/message
        // setTimeout(() => { console.log("Animation Complete."); }, 500); // Example delay
        // return; // Uncomment this line to stop the loop immediately after final frame draw
    }

    ctx.globalAlpha = 1.0; // Reset global alpha

    // --- Request Next Frame ---
    // Only request next frame if animation is meant to continue OR
    // if we want the final frame to keep flickering/jittering
    // If you uncommented the 'return;' above, this won't be reached on the last frame.
    if (animationRunning || currentNumber <= 0) { // Keep animating final frame if needed
         requestAnimationFrame(animate);
    } else {
        console.log("Countdown Finished.");
    }

}

// --- Start Animation ---
requestAnimationFrame(animate);

// --- Optional: Handle window resize ---
window.addEventListener('resize', () => {
    // Basic resize - recalculate size and redraw immediately (can cause jumpiness)
    // A more sophisticated approach would debounce this.
    canvasSize = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    // Recalculate dependent values
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    radius = Math.min(centerX, centerY) * 0.75;
    // No need to restart animation, the next frame will use new values
    // If animation finished, you might want to redraw the final static frame:
    if (!animationRunning) {
         drawBackground();
         ctx.globalAlpha = 1.0; // Ensure no flicker if stopped
         drawCircle();
         drawFinalMessage();
    }
});