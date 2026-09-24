const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const birdTray = document.getElementById("birdTray");
const statusPanel = document.getElementById("statusPanel");
const statusTitle = document.getElementById("statusTitle");
const statusMessage = document.getElementById("statusMessage");
const statusButton = document.getElementById("statusButton");
const toast = document.getElementById("toast");

const world = { width: 1200, height: 655, ground: 552, gravity: 0.34 };
const sling = { x: 190, y: 442, maxPull: 108 };
const levels = [
  { name: "SUNSET OUTPOST", pigs: [{ x: 882, y: 495 }, { x: 1032, y: 495 }], blocks: [
    { x: 840, y: 500, w: 20, h: 52, type: "wood" }, { x: 980, y: 500, w: 20, h: 52, type: "wood" },
    { x: 830, y: 452, w: 180, h: 18, type: "stone" }, { x: 900, y: 401, w: 18, h: 51, type: "glass" },
    { x: 1002, y: 401, w: 18, h: 51, type: "glass" }, { x: 890, y: 352, w: 140, h: 17, type: "wood" }
  ] },
  { name: "CANYON CAMP", pigs: [{ x: 820, y: 495 }, { x: 1060, y: 495 }, { x: 944, y: 350 }], blocks: [
    { x: 770, y: 500, w: 20, h: 52, type: "wood" }, { x: 1035, y: 500, w: 20, h: 52, type: "wood" },
    { x: 760, y: 452, w: 270, h: 18, type: "stone" }, { x: 800, y: 399, w: 18, h: 53, type: "glass" },
    { x: 1015, y: 399, w: 18, h: 53, type: "glass" }, { x: 805, y: 350, w: 220, h: 17, type: "wood" },
    { x: 930, y: 299, w: 18, h: 51, type: "glass" }, { x: 990, y: 299, w: 18, h: 51, type: "glass" },
    { x: 920, y: 251, w: 100, h: 17, type: "stone" }
  ] }
];
let levelIndex = 0, score = 0, birds = [], blocks = [], pigs = [], particles = [];
let activeBird = null, dragging = false, started = false, gameOver = false, won = false, lastTime = 0, toastTimer;

function resize() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = rect.width * ratio; canvas.height = rect.height * ratio;
  ctx.setTransform(rect.width / world.width * ratio, 0, 0, rect.height / world.height * ratio, 0, 0);
}
function resetLevel() {
  const level = levels[levelIndex];
  blocks = level.blocks.map((b, i) => ({ ...b, id: i, hp: b.type === "stone" ? 2 : 1, alive: true }));
  pigs = level.pigs.map((p, i) => ({ ...p, id: i, alive: true, vy: 0 }));
  birds = [0, 1, 2].map((_, i) => ({ x: sling.x, y: sling.y, r: 21, used: i > 0 }));
  particles = []; activeBird = null; dragging = false; gameOver = false; won = false;
  started = false; statusPanel.classList.remove("hidden"); statusTitle.textContent = "Take aim.";
  statusMessage.textContent = "Drag the scout back, then release to launch."; statusButton.textContent = "Start siege";
  document.getElementById("levelLabel").innerHTML = `LEVEL ${String(levelIndex + 1).padStart(2, "0")} <span>•</span> ${level.name}`;
  updateBirdTray(); updateScore();
}
function updateBirdTray() {
  birdTray.innerHTML = birds.map((b, i) => `<span class="bird-dot ${b.used ? "used" : ""} ${!b.used && !activeBird ? "current" : ""}">${i === 0 ? "✦" : "•"}</span>`).join("");
}
function updateScore() { scoreEl.textContent = String(score).padStart(6, "0"); }
function showToast(text) {
  toast.textContent = text; toast.classList.add("show"); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1300);
}
function nextBird() {
  const next = birds.find(b => !b.used);
  if (!next) { finish(false); return; }
  activeBird = next; next.used = true; next.x = sling.x; next.y = sling.y; updateBirdTray();
}
function finish(success) {
  gameOver = true; won = success; statusPanel.classList.remove("hidden");
  statusTitle.textContent = success ? "Outpost cleared." : "The siege is over.";
  statusMessage.textContent = success ? `${score} points secured.` : "The defenders held this round. Try a different angle.";
  statusButton.textContent = success && levelIndex < levels.length - 1 ? "Next level" : "Play again";
}
function launch() {
  if (!activeBird || !dragging) return;
  dragging = false; started = true;
  activeBird.vx = (sling.x - activeBird.x) * 0.18; activeBird.vy = (sling.y - activeBird.y) * 0.18;
  activeBird.launched = true; showToast("DIRECT HIT"); updateBirdTray();
}
function pointerPosition(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * world.width / r.width, y: (e.clientY - r.top) * world.height / r.height };
}
canvas.addEventListener("pointerdown", e => {
  if (!started && !gameOver) { started = true; statusPanel.classList.add("hidden"); nextBird(); }
  if (!activeBird || activeBird.launched || gameOver) return;
  const p = pointerPosition(e);
  if (Math.hypot(p.x - activeBird.x, p.y - activeBird.y) < 45) { dragging = true; canvas.setPointerCapture(e.pointerId); }
});
canvas.addEventListener("pointermove", e => {
  if (!dragging || !activeBird) return;
  const p = pointerPosition(e), dx = p.x - sling.x, dy = p.y - sling.y, distance = Math.hypot(dx, dy);
  const scale = distance > sling.maxPull ? sling.maxPull / distance : 1;
  activeBird.x = sling.x + dx * scale; activeBird.y = sling.y + dy * scale;
});
canvas.addEventListener("pointerup", launch);
statusButton.addEventListener("click", () => {
  if (won && levelIndex < levels.length - 1) levelIndex++;
  else if (gameOver) score = 0;
  resetLevel(); statusPanel.classList.add("hidden"); started = true; nextBird();
});
document.getElementById("resetButton").addEventListener("click", resetLevel);
window.addEventListener("keydown", e => { if (e.key.toLowerCase() === "r") resetLevel(); });
window.addEventListener("resize", resize);

function circleRect(cx, cy, r, b) {
  const x = Math.max(b.x, Math.min(cx, b.x + b.w)), y = Math.max(b.y, Math.min(cy, b.y + b.h));
  return Math.hypot(cx - x, cy - y) < r;
}
function physics(dt) {
  if (!started || gameOver) return;
  if (activeBird?.launched) {
    activeBird.vy += world.gravity * dt; activeBird.x += activeBird.vx * dt; activeBird.y += activeBird.vy * dt;
    if (activeBird.y + activeBird.r > world.ground) { activeBird.y = world.ground - activeBird.r; activeBird.vy *= -.35; activeBird.vx *= .72; }
    blocks.forEach(block => {
      if (block.alive && circleRect(activeBird.x, activeBird.y, activeBird.r, block)) {
        block.hp--; block.alive = block.hp > 0; activeBird.vx *= -.38; activeBird.vy *= -.38;
        score += block.alive ? 50 : 100; burst(block.x + block.w / 2, block.y + block.h / 2, block.type === "glass" ? "#a9f4dd" : "#d89a65", 9);
      }
    });
    pigs.forEach(pig => {
      if (pig.alive && Math.hypot(activeBird.x - pig.x, activeBird.y - pig.y) < activeBird.r + 20) {
        pig.alive = false; score += 500; burst(pig.x, pig.y, "#74c88c", 18); showToast("+500 TARGET DOWN");
      }
    });
    if (activeBird.x > world.width + 50 || activeBird.y > world.height + 80 || (Math.abs(activeBird.vx) < .12 && Math.abs(activeBird.vy) < .12 && activeBird.y > 520)) {
      activeBird = null; setTimeout(() => { if (!pigs.some(p => p.alive)) finish(true); else nextBird(); }, 500);
    }
  }
  pigs.forEach(p => { if (!p.alive) return; p.vy += world.gravity * dt; p.y += p.vy * dt; if (p.y > 500) p.y = 500; });
  particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .1 * dt; p.life -= dt; });
  particles = particles.filter(p => p.life > 0); updateScore();
}
function burst(x, y, color, amount) {
  for (let i = 0; i < amount; i++) particles.push({ x, y, color, r: 2 + Math.random() * 3, vx: (Math.random() - .5) * 7, vy: (Math.random() - .8) * 7, life: 38 + Math.random() * 25 });
}
function draw() {
  const g = ctx.createLinearGradient(0, 0, 0, world.height); g.addColorStop(0, "#b8ddd4"); g.addColorStop(.66, "#dce0bf"); g.addColorStop(1, "#e5bf84"); ctx.fillStyle = g; ctx.fillRect(0, 0, world.width, world.height);
  ctx.fillStyle = "rgba(255,246,199,.35)"; ctx.beginPath(); ctx.arc(975, 125, 72, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d89e6a"; ctx.beginPath(); ctx.moveTo(0, 475); ctx.quadraticCurveTo(150, 395, 335, 492); ctx.lineTo(335, world.ground); ctx.lineTo(0, world.ground); ctx.fill();
  ctx.fillStyle = "#87ad82"; ctx.fillRect(0, world.ground, world.width, world.height - world.ground);
  ctx.fillStyle = "#5b876a"; ctx.fillRect(0, world.ground, world.width, 7);
  drawSling(); blocks.filter(b => b.alive).forEach(drawBlock); pigs.filter(p => p.alive).forEach(drawPig);
  if (activeBird && !activeBird.launched) drawBird(activeBird.x, activeBird.y, activeBird.r);
  particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / 50); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1;
}
function drawSling() {
  ctx.strokeStyle = "#51382f"; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(sling.x - 17, 500); ctx.lineTo(sling.x - 10, sling.y - 28); ctx.moveTo(sling.x + 17, 500); ctx.lineTo(sling.x + 10, sling.y - 28); ctx.stroke();
  if (activeBird && !activeBird.launched) { ctx.strokeStyle = "#614034"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sling.x - 10, sling.y - 26); ctx.lineTo(activeBird.x, activeBird.y); ctx.lineTo(sling.x + 10, sling.y - 26); ctx.stroke(); }
}
function drawBird(x, y, r) {
  ctx.fillStyle = "#e56d52"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f4f0d9"; ctx.beginPath(); ctx.arc(x + 7, y - 7, 7, 0, Math.PI * 2); ctx.arc(x - 5, y - 7, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#172b2c"; ctx.beginPath(); ctx.arc(x + 8, y - 7, 2.5, 0, Math.PI * 2); ctx.arc(x - 4, y - 7, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e7a65b"; ctx.beginPath(); ctx.moveTo(x + 18, y + 1); ctx.lineTo(x + 31, y + 6); ctx.lineTo(x + 18, y + 11); ctx.fill();
  ctx.strokeStyle = "#172b2c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 13, y - 17); ctx.lineTo(x + 1, y - 13); ctx.moveTo(x + 1, y - 13); ctx.lineTo(x + 13, y - 17); ctx.stroke();
}
function drawBlock(b) {
  const colors = { wood: "#b8794c", stone: "#768b8b", glass: "#83c7bc" }; ctx.fillStyle = colors[b.type]; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = "rgba(20,51,52,.5)"; ctx.lineWidth = 2; ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
  if (b.type === "wood") { ctx.strokeStyle = "rgba(255,220,170,.28)"; ctx.beginPath(); ctx.moveTo(b.x + 3, b.y + b.h * .25); ctx.lineTo(b.x + b.w - 3, b.y + b.h * .7); ctx.stroke(); }
}
function drawPig(p) {
  ctx.fillStyle = "#76b983"; ctx.beginPath(); ctx.arc(p.x, p.y, 21, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#a6d49a"; ctx.beginPath(); ctx.ellipse(p.x, p.y + 6, 11, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#163a39"; ctx.beginPath(); ctx.arc(p.x - 7, p.y - 6, 2.5, 0, Math.PI * 2); ctx.arc(p.x + 7, p.y - 6, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4d896c"; ctx.fillRect(p.x - 5, p.y + 3, 3, 3); ctx.fillRect(p.x + 3, p.y + 3, 3, 3);
}
function loop(time) { const dt = Math.min(2, (time - lastTime) / 16.67 || 1); lastTime = time; physics(dt); draw(); requestAnimationFrame(loop); }
resize(); resetLevel(); requestAnimationFrame(loop);