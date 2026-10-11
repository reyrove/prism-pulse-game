(() => {
  // ============================================================
  //  CANVAS SETUP
  // ============================================================
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let W, H, CX, CY, DPR;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    CX = W / 2;
    CY = H / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  // ============================================================
  //  CONSTANTS
  // ============================================================
  const COLORS = [
    { name: 'pink',   hex: '#ff2e97', glow: 'rgba(255,46,151,' },
    { name: 'gold',   hex: '#ffd500', glow: 'rgba(255,213,0,' },
    { name: 'cyan',   hex: '#6ee7ff', glow: 'rgba(110,231,255,' },
    { name: 'purple', hex: '#a855f7', glow: 'rgba(168,85,247,' },
  ];

  const CORE_R = 26;
  const SHIELD_ORBIT = 78;
  const SHIELD_ARC = Math.PI / 3;
  const ORB_R = 12;
  const SPAWN_RADIUS = Math.max(400, Math.min(window.innerWidth, window.innerHeight) * 0.55);

  const STATE = { MENU: 0, PLAYING: 1, DEAD: 2 };
  let state = STATE.MENU;

  // ============================================================
  //  GAME STATE
  // ============================================================
  let score = 0;
  let streak = 0;
  let best = parseInt(localStorage.getItem('prismPulseBest') || '0', 10);
  document.getElementById('best').textContent = best;

  let shieldAngle = 0;
  let targetAngle = 0;
  let useMouse = true;
  let mouseAngle = -Math.PI / 2;
  const KEY_ROTATE_SPEED = 5.2;

  const keys = {};
  window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    keys[e.key] = true;
    if (['arrowleft','arrowright','a','d'].includes(e.key.toLowerCase())) e.preventDefault();
    useMouse = false;
  });
  window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
    keys[e.key] = false;
  });

  window.addEventListener('mousemove', e => {
    mouseAngle = Math.atan2(e.clientY - CY, e.clientX - CX);
    useMouse = true;
  });
  window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    mouseAngle = Math.atan2(t.clientY - CY, t.clientX - CX);
    useMouse = true;
  }, { passive: true });

  // ============================================================
  //  ENTITIES
  // ============================================================
  let orbs = [];
  let particles = [];
  let rings = [];
  let shockwaves = [];

  let elapsed = 0;
  let spawnTimer = 0;
  let spawnInterval = 1.5;
  let shakeAmount = 0;

  // ============================================================
  //  HELPERS
  // ============================================================
  function rand(a, b) { return a + Math.random() * (b - a); }

  function angleDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function spawnOrb() {
    const angle = Math.random() * Math.PI * 2;
    const colorIdx = Math.floor(Math.random() * COLORS.length);
    const speed = 90 + elapsed * 4 + Math.random() * 40;
    orbs.push({
      angle,
      radius: SPAWN_RADIUS,
      colorIdx,
      speed,
      size: ORB_R,
      age: 0,
      trail: [],
    });
  }

  function spawnParticles(x, y, colorHex, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(speed * 0.3, speed);
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.5 + Math.random() * 0.6,
        maxLife: 1,
        r: rand(2, 5),
        color: colorHex,
      });
    }
  }

  function addRing(x, y, colorHex, maxR = 120, duration = 0.5) {
    rings.push({ x, y, r: 0, maxR, life: 0, maxLife: duration, color: colorHex });
  }

  function addShockwave() {
    shockwaves.push({ r: CORE_R, maxR: Math.max(W, H) * 0.7, life: 0, maxLife: 0.9, color: '#ffffff' });
  }

  // ============================================================
  //  RESET
  // ============================================================
  function reset() {
    score = 0;
    streak = 0;
    elapsed = 0;
    spawnTimer = 0.6;
    spawnInterval = 1.5;
    orbs = [];
    particles = [];
    rings = [];
    shockwaves = [];
    shieldAngle = -Math.PI / 2;
    targetAngle = shieldAngle;
    shakeAmount = 0;
    updateHUD();
  }

  // ============================================================
  //  UPDATE
  // ============================================================
  function update(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.93;
      p.vy *= 0.93;
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.life += dt;
      if (r.life > r.maxLife) { rings.splice(i, 1); continue; }
      r.r = (r.life / r.maxLife) * r.maxR;
    }
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const s = shockwaves[i];
      s.life += dt;
      if (s.life > s.maxLife) { shockwaves.splice(i, 1); continue; }
      s.r = CORE_R + (s.life / s.maxLife) * (s.maxR - CORE_R);
    }
    shakeAmount *= Math.pow(0.82, dt * 60);

    if (state !== STATE.PLAYING) return;

    elapsed += dt;
    spawnInterval = Math.max(0.45, 1.5 - elapsed * 0.022);

    if (useMouse) {
      const diff = angleDiff(mouseAngle, shieldAngle);
      shieldAngle += diff * Math.min(1, dt * 18);
    } else {
      let dir = 0;
      if (keys['a'] || keys['arrowleft']) dir -= 1;
      if (keys['d'] || keys['arrowright']) dir += 1;
      shieldAngle += dir * KEY_ROTATE_SPEED * dt;
    }
    while (shieldAngle > Math.PI) shieldAngle -= Math.PI * 2;
    while (shieldAngle < -Math.PI) shieldAngle += Math.PI * 2;

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnOrb();
      if (elapsed > 20 && Math.random() < 0.25) spawnOrb();
      if (elapsed > 45 && Math.random() < 0.2) spawnOrb();
      spawnTimer = spawnInterval * rand(0.8, 1.2);
    }

    const shieldHalf = SHIELD_ARC / 2;

    for (let i = orbs.length - 1; i >= 0; i--) {
      const o = orbs[i];
      o.age += dt;
      o.radius -= o.speed * dt;

      o.trail.push(o.radius);
      if (o.trail.length > 6) o.trail.shift();

      const ox = CX + Math.cos(o.angle) * o.radius;
      const oy = CY + Math.sin(o.angle) * o.radius;

      const diff = Math.abs(angleDiff(o.angle, shieldAngle));

      if (o.radius <= SHIELD_ORBIT + ORB_R && o.radius >= SHIELD_ORBIT - ORB_R) {
        if (diff < shieldHalf) {
          const shieldColorIdx = colorIdxFromAngle(shieldAngle);

          if (o.colorIdx === shieldColorIdx) {
            const gained = 10 + Math.floor(streak / 5) * 2;
            score += gained;
            streak++;
            updateHUD();
            flashStreak();
            shakeAmount = Math.max(shakeAmount, 6);

            spawnParticles(ox, oy, COLORS[o.colorIdx].hex, 22, 380);
            addRing(ox, oy, COLORS[o.colorIdx].hex, 90, 0.5);
            addShockwave();

            orbs.splice(i, 1);
            continue;
          } else {
            die(ox, oy, 'wrong');
            return;
          }
        }
      }

      if (o.radius < CORE_R + ORB_R * 0.5) {
        die(ox, oy, 'missed');
        return;
      }

      if (o.radius < -50) orbs.splice(i, 1);
    }
  }

  function colorIdxFromAngle(a) {
    let a2 = a + Math.PI;
    while (a2 < 0) a2 += Math.PI * 2;
    while (a2 >= Math.PI * 2) a2 -= Math.PI * 2;
    const sector = Math.PI * 2 / COLORS.length;
    return Math.floor(a2 / sector) % COLORS.length;
  }

  function die(x, y, reason) {
    state = STATE.DEAD;
    shakeAmount = 24;

    const colorHex = reason === 'wrong' ? '#ff2e97' : '#ff4444';
    spawnParticles(x, y, colorHex, 45, 600);
    spawnParticles(CX, CY, '#ffffff', 25, 400);
    addRing(x, y, colorHex, 200, 0.8);

    const isNewBest = score > best;
    if (isNewBest) {
      best = score;
      localStorage.setItem('prismPulseBest', best.toString());
      document.getElementById('best').textContent = best;
      document.getElementById('newBest').classList.remove('hidden');
    } else {
      document.getElementById('newBest').classList.add('hidden');
    }

    document.getElementById('finalScore').textContent = score;

    setTimeout(() => {
      document.getElementById('gameOverScreen').classList.remove('hidden');
    }, 600);
  }

  function updateHUD() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
  }

  function flashStreak() {
    const el = document.getElementById('streak');
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
  }

  // ============================================================
  //  RENDER
  // ============================================================
  function render() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    if (shakeAmount > 0.5) {
      ctx.translate(
        (Math.random() - 0.5) * shakeAmount,
        (Math.random() - 0.5) * shakeAmount
      );
    }

    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2);
    const bgGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(W, H) * 0.7);
    bgGrad.addColorStop(0, `rgba(40, 20, 80, ${0.15 + pulse * 0.05})`);
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(CX, CY, SHIELD_ORBIT, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const sector = Math.PI * 2 / COLORS.length;
    for (let i = 0; i < COLORS.length; i++) {
      const a0 = i * sector - Math.PI;
      const a1 = a0 + sector;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, SHIELD_ORBIT + 30, a0, a1);
      ctx.closePath();
      ctx.fillStyle = COLORS[i].glow + '0.035)';
      ctx.fill();
    }

    for (const r of rings) {
      const alpha = 1 - r.life / r.maxLife;
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = alpha * 0.9;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (const s of shockwaves) {
      const alpha = 1 - s.life / s.maxLife;
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = alpha * 0.35;
      ctx.lineWidth = 4 * alpha + 0.5;
      ctx.beginPath();
      ctx.arc(CX, CY, s.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (const o of orbs) {
      const color = COLORS[o.colorIdx];
      const x = CX + Math.cos(o.angle) * o.radius;
      const y = CY + Math.sin(o.angle) * o.radius;

      for (let i = 0; i < o.trail.length; i++) {
        const tr = o.trail[i];
        const tx = CX + Math.cos(o.angle) * tr;
        const ty = CY + Math.sin(o.angle) * tr;
        const a = (i / o.trail.length) * 0.5;
        ctx.fillStyle = color.glow + a + ')';
        ctx.beginPath();
        ctx.arc(tx, ty, o.size * (i / o.trail.length) * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      const grad = ctx.createRadialGradient(x, y, 0, x, y, o.size * 3.5);
      grad.addColorStop(0, color.glow + '0.9)');
      grad.addColorStop(0.4, color.glow + '0.25)');
      grad.addColorStop(1, color.glow + '0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, o.size * 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color.hex;
      ctx.shadowColor = color.hex;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(x, y, o.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x - o.size * 0.35, y - o.size * 0.35, o.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    const shieldColorIdx = colorIdxFromAngle(shieldAngle);
    const shieldColor = COLORS[shieldColorIdx];

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = 12;
    ctx.strokeStyle = shieldColor.hex;
    ctx.shadowColor = shieldColor.hex;
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(CX, CY, SHIELD_ORBIT, shieldAngle - SHIELD_ARC / 2, shieldAngle + SHIELD_ARC / 2);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(CX, CY, SHIELD_ORBIT, shieldAngle - SHIELD_ARC / 2, shieldAngle + SHIELD_ARC / 2);
    ctx.stroke();
    ctx.restore();

    for (const sign of [-1, 1]) {
      const a = shieldAngle + sign * SHIELD_ARC / 2;
      const sx = CX + Math.cos(a) * SHIELD_ORBIT;
      const sy = CY + Math.sin(a) * SHIELD_ORBIT;
      ctx.fillStyle = shieldColor.hex;
      ctx.shadowColor = shieldColor.hex;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    const coreGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, CORE_R * 3.5);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    coreGrad.addColorStop(0.5, shieldColor.glow + '0.25)');
    coreGrad.addColorStop(1, shieldColor.glow + '0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(CX, CY, CORE_R * 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0a0a12';
    ctx.shadowColor = shieldColor.hex;
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(CX, CY, CORE_R, 0, Math.PI * 2);
    ctx.fill();

    const innerGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, CORE_R);
    innerGrad.addColorStop(0, shieldColor.glow + '0.9)');
    innerGrad.addColorStop(1, shieldColor.glow + '0.1)');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(CX, CY, CORE_R * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(CX, CY, 4, 0, Math.PI * 2);
    ctx.fill();

    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // ============================================================
  //  MAIN LOOP
  // ============================================================
  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // ============================================================
  //  UI WIRING
  // ============================================================
  document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    reset();
    state = STATE.PLAYING;
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').classList.add('hidden');
    reset();
    state = STATE.PLAYING;
  });

  reset();
  state = STATE.MENU;
  requestAnimationFrame(loop);
})();