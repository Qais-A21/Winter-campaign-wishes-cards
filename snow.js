// Gentle falling snow over the winter campaign page.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.getElementById("snow");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, flakes;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(120, Math.floor(w / 12));
    flakes = Array.from({ length: count }, () => makeFlake(true));
  }

  function makeFlake(randomY) {
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -10,
      r: 1.5 + Math.random() * 3,
      v: 0.5 + Math.random() * 1.2,
      p: Math.random() * Math.PI * 2,
    };
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.shadowColor = "rgba(12,44,128,0.35)";
    ctx.shadowBlur = 3;
    for (const f of flakes) {
      f.p += 0.02;
      f.y += f.v;
      f.x += Math.sin(f.p) * 0.6;
      if (f.y > h + 10) Object.assign(f, makeFlake(false));
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  tick();
})();
