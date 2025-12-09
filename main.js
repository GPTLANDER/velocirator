import './style.css';
import { createIcons, Triangle, ChevronDown } from 'lucide';

// --- 1. SETUP & UTILS ---
createIcons({
    icons: {
        Triangle,
        ChevronDown
    }
});

const canvas = document.getElementById('warp-canvas');

if (canvas) {
    const ctx = canvas.getContext('2d');

    let width, height;
    let stars = [];
    const STAR_COUNT = 1500;
    let warpSpeed = 0; // The current speed logic
    let baseSpeed = 2; // Cruising speed
    let targetSpeed = 2; // Where we want to be

    // --- 2. RESIZE HANDLER ---
    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        // Re-center coordinate system to middle of screen
        ctx.translate(width / 2, height / 2);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // --- 3. STAR CLASS ---
    class Star {
        constructor() {
            this.reset(true);
        }

        reset(randomZ = false) {
            this.x = (Math.random() - 0.5) * width * 2; // Spread wider than screen
            this.y = (Math.random() - 0.5) * height * 2;
            this.z = randomZ ? Math.random() * width : width; // Start far away
            this.pz = this.z; // Previous Z (for trail calculation)

            // Color variations
            const colors = ["#ffffff", "#00f3ff", "#bc13fe", "#aaaaaa"];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.size = Math.random();
        }

        update() {
            // Move star towards camera (z decreases)
            // Speed depends on z (parallax) + global warpSpeed
            this.z -= (baseSpeed + warpSpeed) * (2000 / (this.z + 100)); // Non-linear acceleration feels deeper

            // Respawn if behind camera or out of bounds
            if (this.z <= 1) {
                this.reset();
                this.z = width;
                this.pz = this.z;
            }
        }

        draw() {
            // Project 3D coordinates to 2D screen
            const sx = (this.x / this.z) * width;
            const sy = (this.y / this.z) * height;

            // Previous position for trail effect
            const px = (this.x / this.pz) * width;
            const py = (this.y / this.pz) * height;

            // Calculate fade based on depth
            const alpha = 1 - (this.z / width);

            ctx.beginPath();
            ctx.strokeStyle = this.color;

            // If moving fast, draw a line (trail). If slow, draw a dot.
            const speedFactor = (baseSpeed + warpSpeed);

            if (speedFactor > 10) {
                // Warp lines
                ctx.lineWidth = this.size * (speedFactor / 20);
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.globalAlpha = alpha * 0.8;
                ctx.stroke();
            } else {
                // Standard stars
                const r = this.size * (1000 / this.z);
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = alpha;
                ctx.fill();
            }

            // Update previous Z for next frame
            this.pz = this.z;
            ctx.globalAlpha = 1; // Reset alpha
        }
    }

    // Initialize Stars
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
    }

    // --- 4. ANIMATION LOOP ---
    const animate = () => {
        // Create "trails" effect by not clearing completely
        ctx.fillStyle = `rgba(3, 3, 5, ${warpSpeed > 10 ? 0.3 : 1})`;
        ctx.fillRect(-width / 2, -height / 2, width, height); // Clear screen relative to center

        // Smoothly interpolate current speed to target speed
        warpSpeed += (targetSpeed - warpSpeed) * 0.05;

        stars.forEach(star => {
            star.update();
            star.draw();
        });

        requestAnimationFrame(animate);
    };
    animate();

    // --- 5. INTERACTION LOGIC ---

    // A. Scroll-based acceleration
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        targetSpeed = 50; // Boost speed on scroll

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            targetSpeed = baseSpeed; // Return to cruise
        }, 100);
    });

    // B. Hyperdrive Button
    const warpBtn = document.getElementById('warp-btn');

    if (warpBtn) {
        warpBtn.addEventListener('mousedown', () => {
            targetSpeed = 200; // Massive speed
            baseSpeed = 100; // Hold high base speed
            document.body.classList.add('shaking'); // Optional CSS shake could be added
        });

        warpBtn.addEventListener('mouseup', () => {
            baseSpeed = 2; // Reset
            targetSpeed = 2;
        });

        warpBtn.addEventListener('mouseleave', () => {
            baseSpeed = 2;
            targetSpeed = 2;
        });
    }
}

// C. Custom Cursor Logic
const cursor = document.getElementById('cursor');
const triggers = document.querySelectorAll('.hover-trigger');

document.addEventListener('mousemove', (e) => {
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

triggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => cursor?.classList.add('hovered'));
    trigger.addEventListener('mouseleave', () => cursor?.classList.remove('hovered'));
});

// D. Intersection Observer for Reveal Animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
