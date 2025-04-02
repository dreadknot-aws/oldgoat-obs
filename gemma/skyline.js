window.onload = function() {
    const canvas = document.getElementById('skylineCanvas');
    if (!canvas.getContext) {
        console.error("Canvas not supported!");
        return;
    }
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // --- Configuration ---
    const MIN_BUILDING_WIDTH = 30;
    const MAX_BUILDING_WIDTH = 80;
    const MIN_BUILDING_HEIGHT_FACTOR = 0.1; // Min height as fraction of canvas height
    const MAX_BUILDING_HEIGHT_FACTOR = 0.85; // Max height as fraction of canvas height
    const SKY_COLOR_TOP = '#001';    // Dark blue/black
    const SKY_COLOR_BOTTOM = '#349'; // Lighter blue towards horizon
    const HORIZON_LINE = height * 0.7; // Where the sky gradient ends
    const STAR_COUNT = 150;
    const WINDOW_COLOR_ON = '#FFFF99'; // Light yellow
    const WINDOW_COLOR_ON_ALT = '#FFA500'; // Orange variation
    const WINDOW_PROBABILITY = 0.6; // % chance a window is lit
    const WINDOW_WIDTH = 4;
    const WINDOW_HEIGHT = 6;
    const WINDOW_SPACING_X = 8;
    const WINDOW_SPACING_Y = 10;
    const WINDOW_MARGIN = 5; // Margin from building edge

    // --- Helper: Random Number between min/max ---
    function randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // --- Drawing Functions ---

    function drawSky() {
        const skyGradient = ctx.createLinearGradient(0, 0, 0, HORIZON_LINE);
        skyGradient.addColorStop(0, SKY_COLOR_TOP);
        skyGradient.addColorStop(1, SKY_COLOR_BOTTOM);

        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, height); // Fill entire canvas initially

        // Optional: Darker ground area if desired
        // ctx.fillStyle = '#111';
        // ctx.fillRect(0, HORIZON_LINE, width, height - HORIZON_LINE);
    }

    function drawStars() {
        ctx.fillStyle = 'white';
        for (let i = 0; i < STAR_COUNT; i++) {
            const x = Math.random() * width;
            const y = Math.random() * HORIZON_LINE; // Only in the sky area
            const radius = Math.random() * 1.2;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

     function drawMoon() {
        const moonX = width * randomRange(0.6, 0.9); // Randomize horizontal position a bit
        const moonY = height * randomRange(0.1, 0.25); // Randomize vertical position a bit
        const moonRadius = randomRange(15, 25);

        ctx.fillStyle = '#f0f0d0'; // Pale yellow/white
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.shadowColor = 'rgba(255, 255, 200, 0.5)'; // Add a subtle glow
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowColor = 'transparent'; // Reset shadow for other elements
        ctx.shadowBlur = 0;
    }

    function drawWindows(buildingX, buildingY, buildingW, buildingH) {
         const numCols = Math.floor((buildingW - 2 * WINDOW_MARGIN) / WINDOW_SPACING_X);
         const numRows = Math.floor((buildingH - 2 * WINDOW_MARGIN) / WINDOW_SPACING_Y);

         // Calculate starting point to center windows slightly
         const startX = buildingX + (buildingW - numCols * WINDOW_SPACING_X + (WINDOW_SPACING_X - WINDOW_WIDTH)) / 2;
         const startY = buildingY + WINDOW_MARGIN;

         for (let r = 0; r < numRows; r++) {
             for (let c = 0; c < numCols; c++) {
                 if (Math.random() < WINDOW_PROBABILITY) { // Chance to draw window
                     ctx.fillStyle = Math.random() < 0.15 ? WINDOW_COLOR_ON_ALT : WINDOW_COLOR_ON; // Occasionally orange
                     const winX = startX + c * WINDOW_SPACING_X;
                     const winY = startY + r * WINDOW_SPACING_Y;
                     // Ensure window doesn't draw below building base (important for short buildings)
                     if (winY + WINDOW_HEIGHT <= height) {
                        ctx.fillRect(winX, winY, WINDOW_WIDTH, WINDOW_HEIGHT);
                     }
                 }
             }
         }
    }

    function drawBuildings() {
        let currentX = 0;

        while (currentX < width) {
            // --- Generate Building Properties ---
            const buildingWidth = randomRange(MIN_BUILDING_WIDTH, MAX_BUILDING_WIDTH);
            // Ensure height is calculated correctly from the bottom
            const buildingHeight = randomRange(height * MIN_BUILDING_HEIGHT_FACTOR, height * MAX_BUILDING_HEIGHT_FACTOR);
            const buildingY = height - buildingHeight; // Y position is from the top-left corner

            // Random dark color (shades of gray/blue)
            const grayTone = randomRange(30, 90);
            const blueTone = randomRange(0, 0.3); // Add slight blue tint sometimes
            ctx.fillStyle = `rgb(${grayTone}, ${grayTone}, ${grayTone + (grayTone * blueTone)})`;

            // --- Draw Building ---
            // Use strokeRect first for a subtle outline (optional)
            // ctx.strokeStyle = '#000';
            // ctx.lineWidth = 1;
            // ctx.strokeRect(currentX, buildingY, buildingWidth, buildingHeight);
            ctx.fillRect(currentX, buildingY, buildingWidth, buildingHeight);


             // --- Draw Windows ---
            if (buildingWidth > WINDOW_MARGIN * 2 && buildingHeight > WINDOW_MARGIN * 2) { // Only draw if space allows
                drawWindows(currentX, buildingY, buildingWidth, buildingHeight);
            }

            // --- Move to Next Building ---
            // Add a small random gap or slight overlap
            currentX += buildingWidth + randomRange(-5, 3);
        }
    }

    // --- Main Drawing Execution ---
    function drawScene() {
        // Clear canvas (optional, but good practice if redrawing)
        ctx.clearRect(0, 0, width, height);

        drawSky();
        drawStars();
        drawMoon();
        drawBuildings();
    }

    // Initial draw
    drawScene();

    // Optional: Redraw on click or resize
    canvas.addEventListener('click', drawScene); // Redraw when canvas is clicked
    // Add resize listener if you want it to adapt (more complex canvas resizing needed)

};