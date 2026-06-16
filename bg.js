/**
 * Gifts Market — Premium Crimson Ribbon & Stardust Ambient Background.
 * Renders smooth moving ribbon waves and floating stardust particles
 * that drift and react organically to page scrolling.
 */
(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const reduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width  = canvas.width  = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
        width  = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width  = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width  = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initStardust();
    }

    // ─── STARDUST PARTICLES SYSTEM ───────────────────────────────────────────
    let stardust = [];
    const MAX_PARTICLES = 45;

    function initStardust() {
        stardust = [];
        for (let i = 0; i < MAX_PARTICLES; i++) {
            stardust.push(createParticle(true));
        }
    }

    function createParticle(randomY = false) {
        return {
            x: Math.random() * width,
            y: randomY ? Math.random() * height : height + 10,
            size: 0.8 + Math.random() * 1.6,
            speedX: (Math.random() - 0.5) * 0.25,
            speedY: -(0.15 + Math.random() * 0.35),
            opacity: randomY ? Math.random() * 0.7 : 0,
            maxOpacity: 0.3 + Math.random() * 0.5,
            fadeSpeed: 0.005 + Math.random() * 0.01
        };
    }

    function updateAndDrawParticles(scrollVel) {
        ctx.save();
        for (let i = 0; i < stardust.length; i++) {
            const p = stardust[i];
            
            // Move particle, influenced slightly by scrolling velocity
            p.y += p.speedY - (scrollVel * 6.0);
            p.x += p.speedX;

            // Fade in/out logic
            if (p.opacity < p.maxOpacity && p.y > 0) {
                p.opacity = Math.min(p.maxOpacity, p.opacity + 0.02);
            }
            if (p.y < 50) {
                p.opacity = Math.max(0, p.opacity - p.fadeSpeed * 3);
            }

            // Draw particle with subtle glow
            ctx.shadowColor = 'rgba(212,17,21,0.6)';
            ctx.shadowBlur = p.size * 3;
            ctx.fillStyle = `rgba(255, 100, 105, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Re-create if off-screen or fully faded
            if (p.y < -10 || p.opacity <= 0 || p.x < -10 || p.x > width + 10) {
                stardust[i] = createParticle(false);
            }
        }
        ctx.restore();
    }

    window.addEventListener('resize', resize, { passive: true });

    // Soft scroll-warp so ribbons/particles feel alive while scrolling the catalog
    let scrollProgress = 0, targetScroll = 0;
    let prevScrollY = window.scrollY;
    let scrollVelocity = 0;

    window.addEventListener('scroll', () => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const currentY = window.scrollY;
        targetScroll = Math.min(1, currentY / max);
        scrollVelocity = (currentY - prevScrollY) / window.innerHeight;
        prevScrollY = currentY;
    }, { passive: true });

    // ─── Draw the translucent glowing crimson ribbons ──────────────
    function drawRibbons() {
        const time = Date.now() * 0.001;
        ctx.save();

        // Crimson glow configuration
        ctx.shadowColor = 'rgba(212,17,21,0.9)';
        ctx.shadowBlur  = 32 + Math.sin(time * 1.2) * 8;
        ctx.strokeStyle = '#d41115';
        ctx.lineCap     = 'round';
        ctx.globalAlpha = 0.095;

        // WAVE 1 — top-left flow
        ctx.lineWidth = 18;
        ctx.beginPath();
        const w1y = (scrollProgress * 70) + Math.sin(time * 0.4) * 20;
        const w1x = Math.cos(time * 0.35) * 15;
        ctx.moveTo(-50, height * 0.06 + w1y);
        ctx.bezierCurveTo(
            width * 0.28 + w1x, height * 0.03 + Math.sin(time * 0.5) * 22 + w1y,
            width * 0.38 + w1x, height * 0.24 + Math.cos(time * 0.4) * 18 + w1y,
            -50, height * 0.36 + w1y
        );
        ctx.stroke();

        // WAVE 2 — main right weaving ribbon
        ctx.lineWidth = 22;
        ctx.beginPath();
        const w2y = (-scrollProgress * 110) + Math.cos(time * 0.3) * 25;
        const w2x = Math.sin(time * 0.45) * 20;
        ctx.moveTo(width + 50, height * 0.22 + w2y);
        ctx.bezierCurveTo(
            width * 0.62 + w2x, height * 0.32 + Math.sin(time * 0.4) * 30 + w2y,
            width * 0.72 + w2x, height * 0.72 + Math.cos(time * 0.3) * 28 + w2y,
            width + 50, height * 0.82 + w2y
        );
        ctx.stroke();

        // WAVE 3 — bottom-left ribbon
        ctx.lineWidth = 16;
        ctx.beginPath();
        const w3y = (scrollProgress * 50) + Math.sin(time * 0.5) * 16;
        const w3x = Math.cos(time * 0.5) * 12;
        ctx.moveTo(-50, height * 0.78 + w3y);
        ctx.bezierCurveTo(
            width * 0.22 + w3x, height * 0.84 + Math.cos(time * 0.6) * 18 + w3y,
            width * 0.32 + w3x, height * 0.94 + Math.sin(time * 0.5) * 22 + w3y,
            width * 0.08 + w3x, height + 50 + w3y
        );
        ctx.stroke();

        ctx.restore();
    }

    function frame() {
        // Friction on scroll velocity
        scrollVelocity *= 0.92;
        scrollProgress += (targetScroll - scrollProgress) * 0.12;
        ctx.clearRect(0, 0, width, height);
        
        drawRibbons();
        updateAndDrawParticles(scrollVelocity);

        if (!reduced) requestAnimationFrame(frame);
    }

    // Trigger initial setup
    resize();

    if (reduced) {
        // Render static pass
        frame();
    } else {
        requestAnimationFrame(frame);
    }
})();
