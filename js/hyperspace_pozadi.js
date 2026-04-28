// tohle jsem ani nevzal odněkud z internetu, to mi prostě udělal chatgpt haha

const canvas = document.getElementById("hyperspace");
const ctx = canvas.getContext("2d");

let width, height, centerX, centerY;
const STAR_COUNT = 300;
const SPEED = 1.5;
const stars = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
}

window.addEventListener("resize", resize);
resize();

function createStar() {
    return {
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * width
    };
}

for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(createStar());
}

async function update() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    for (let star of stars) {
        const prevZ = star.z;
        star.z -= SPEED;

        if (star.z <= 0) {
            Object.assign(star, createStar());
            star.z = width;
            continue;
        }

        const sx = centerX + (star.x / star.z) * width;
        const sy = centerY + (star.y / star.z) * width;

        const px = centerX + (star.x / prevZ) * width;
        const py = centerY + (star.y / prevZ) * width;

        const brightness = 1 - star.z / width + Math.random() * 0.3;
        ctx.strokeStyle = `rgba(255,255,255,${brightness})`;
        ctx.lineWidth = brightness * 2;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
    }

    requestAnimationFrame(update);
}

update();