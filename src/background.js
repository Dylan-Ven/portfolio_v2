const container = document.getElementById('animation-container');

// Helper function to generate circle with variation
function createRandomCircle() {
    const size = Math.random() * 100 + 50; // size between 50px and 150px
    const x = Math.random() * (window.innerWidth - size);
    const y = Math.random() * (window.innerHeight - size);

    const circle = document.createElement('div');
    circle.className = 'circle';
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    // Depth feel: larger circles lighter, smaller circles darker
    const opacity = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
    const blur = 15 + Math.random() * 20; // 15px to 35px
    circle.style.backgroundColor = `rgba(51, 51, 51, ${opacity})`;
    circle.style.filter = `blur(${blur}px)`;

    // Random animation duration (depth/motion variation)
    const duration = 3 + Math.random() * 5; // 3s to 8s
    circle.style.animationDuration = `${duration}s`;

    container.appendChild(circle);

    // Remove circle after animation ends
    circle.addEventListener('animationend', () => {
        circle.remove();
    });
}

// Mobile optimization: create fewer circles
function getInterval() {
    return window.innerWidth < 600 ? 1000 : 500;
}

// Create new circles at interval
let circleInterval = setInterval(createRandomCircle, getInterval());

// Adjust on resize
window.addEventListener('resize', () => {
    clearInterval(circleInterval);
    circleInterval = setInterval(createRandomCircle, getInterval());

    // Create a few new circles to fill the new space
    for (let i = 0; i < 5; i++) {
        createRandomCircle();
    }
});