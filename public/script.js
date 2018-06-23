// Set up canvas
function setup() {
	createCanvas(windowWidth, windowHeight - 50);
}

// Draw content
function draw() {
	background(0); // black

	fill(255,0,0);
	ellipse(50, 50, 10); // circle(x, y, diameter)
}

// Resize canvas with window
window.addEventListener('resize', function(event) {
	resizeCanvas(windowWidth, windowHeight - 50);
})