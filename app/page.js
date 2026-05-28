'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    let oceanAnimId = null;
    let gameAnimId = null;
    let confAnimId = null;
    let introAnimId = null;
    let introPrgIv = null;
    let spawnIv = null;
    let timerIv = null;
    let typeIv = null;
    let loadIv = null;
    let toastTimeout = null;
    let toastIv = null;

    // ── INTRO CINEMATIC SEQUENCE ──
    const introOverlay  = document.getElementById('intro-overlay');
    const introCanvas   = document.getElementById('intro-canvas');
    const introSkip     = document.getElementById('intro-skip');
    const introBar      = document.getElementById('intro-bar');
    const introBarTop   = document.getElementById('intro-bar-top');
    const introBarBot   = document.getElementById('intro-bar-bot');
    const introScene1   = document.getElementById('intro-scene-1');
    const introScene2   = document.getElementById('intro-scene-2');
    const introScene3   = document.getElementById('intro-scene-3');
    const introReveal   = document.getElementById('intro-logo-reveal');

    const INTRO_MS = 10800;
    const introT0  = performance.now();

    // Particles for intro bg
    const iParticles = Array.from({ length: 55 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.8 + Math.random() * 2.4,
      vy: 0.0014 + Math.random() * 0.0022,
      alpha: 0.07 + Math.random() * 0.22,
      wobble: Math.random() * Math.PI * 2,
      wSpd: 0.014 + Math.random() * 0.022,
    }));

    function resizeIntroCanvas() {
      if (introCanvas) { introCanvas.width = window.innerWidth; introCanvas.height = window.innerHeight; }
    }
    resizeIntroCanvas();
    window.addEventListener('resize', resizeIntroCanvas);

    function drawIntroFrame(ts) {
      if (!introCanvas) return;
      const ctx = introCanvas.getContext('2d');
      const W = introCanvas.width, H = introCanvas.height;
      const elapsed = ts - introT0, sec = elapsed / 1000;
      const fadeIn = Math.min(elapsed / 700, 1);

      ctx.clearRect(0, 0, W, H);

      // Deep ocean gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#000810'); bg.addColorStop(0.3, '#001020');
      bg.addColorStop(0.65, '#001c35'); bg.addColorStop(1, '#002848');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Light rays
      for (let i = 0; i < 7; i++) {
        const rx = W * (0.06 + i * 0.145);
        const ra = (0.011 + 0.007 * Math.sin(sec * 0.35 + i * 1.1)) * fadeIn;
        const rw = 18 + Math.sin(sec * 0.28 + i) * 13;
        const rg = ctx.createLinearGradient(rx, 0, rx, H * 0.9);
        rg.addColorStop(0, `rgba(0,229,255,${ra})`);
        rg.addColorStop(0.55, `rgba(0,160,220,${ra * 0.35})`);
        rg.addColorStop(1, 'rgba(0,40,100,0)');
        ctx.save(); ctx.beginPath();
        ctx.moveTo(rx - rw, 0); ctx.lineTo(rx + rw, 0);
        ctx.lineTo(rx + rw + 28, H); ctx.lineTo(rx - rw + 28, H);
        ctx.closePath(); ctx.fillStyle = rg; ctx.fill(); ctx.restore();
      }

      // Rising bubble particles
      iParticles.forEach(p => {
        p.wobble += p.wSpd; p.y -= p.vy;
        p.x += Math.sin(p.wobble) * 0.00028;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        ctx.save(); ctx.globalAlpha = p.alpha * fadeIn;
        ctx.strokeStyle = 'rgba(0,229,255,0.75)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(0,229,255,0.04)'; ctx.fill(); ctx.restore();
      });

      // Wave layers
      for (let w = 0; w < 4; w++) {
        ctx.beginPath(); ctx.moveTo(0, H * 0.63 + w * 15);
        for (let x = 0; x <= W; x += 4) {
          ctx.lineTo(x, H * 0.63 + w * 15 + Math.sin(x * 0.005 + sec * (0.65 + w * 0.22)) * (13 - w * 2.5));
        }
        ctx.strokeStyle = `rgba(0,229,255,${(0.07 - w * 0.014) * fadeIn})`;
        ctx.lineWidth = 1.5; ctx.stroke();
      }

      introAnimId = requestAnimationFrame(drawIntroFrame);
    }

    function dismissIntro() {
      if (!introOverlay || introOverlay.classList.contains('out')) return;
      introOverlay.classList.add('out');
      cancelAnimationFrame(introAnimId);
      clearInterval(introPrgIv);
      setTimeout(() => { if (introOverlay) introOverlay.style.display = 'none'; }, 960);
    }

    introAnimId = requestAnimationFrame(drawIntroFrame);

    introPrgIv = setInterval(() => {
      const frac = (performance.now() - introT0) / INTRO_MS;
      if (introBar) introBar.style.width = Math.min(frac * 100, 100) + '%';
      if (frac >= 1) clearInterval(introPrgIv);
    }, 50);

    // Cinematic scene timeline
    setTimeout(() => introScene1?.classList.add('show'),   350);
    setTimeout(() => introScene1?.classList.remove('show'), 3700);
    setTimeout(() => introScene2?.classList.add('show'),   4200);
    setTimeout(() => introScene2?.classList.remove('show'), 6600);
    setTimeout(() => introScene3?.classList.add('show'),   7000);
    setTimeout(() => {
      introScene3?.classList.remove('show');
      introBarTop?.classList.add('out'); introBarBot?.classList.add('out');
    }, 8000);
    setTimeout(() => introReveal?.classList.add('show'), 8400);
    setTimeout(dismissIntro, INTRO_MS);

    if (introSkip) introSkip.addEventListener('click', dismissIntro);

    // ── REEL MODAL (30s) ──
    const videoModal = document.getElementById('video-modal');
    const modalVideo = document.getElementById('modal-video');
    const modalClose = document.getElementById('modal-close');
    const watchReelBtn = document.getElementById('watch-reel-btn');

    function openModal() {
      if (!videoModal) return;
      videoModal.classList.add('open');
      if (modalVideo) { modalVideo.currentTime = 0; modalVideo.play().catch(() => {}); }
    }
    function closeModal() {
      if (!videoModal) return;
      videoModal.classList.remove('open');
      if (modalVideo) modalVideo.pause();
    }

    if (watchReelBtn) watchReelBtn.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (videoModal) videoModal.addEventListener('click', e => { if (e.target === videoModal) closeModal(); });

    // ── LOADING SCREEN ──
    const bar = document.getElementById('loader-bar');
    const pct = document.getElementById('loader-pct');
    let p = 0;
    loadIv = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 100) { p = 100; clearInterval(loadIv); setTimeout(hideLoader, 300); }
      if (bar) bar.style.width = p + '%';
      if (pct) pct.textContent = Math.floor(p) + '%';
    }, 80);

    function hideLoader() {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('out');
      startTyping();
    }

    // ── CURSOR GLOW ──
    const glowEl = document.getElementById('cursor-glow');
    const onMouseMove = e => {
      if (glowEl) { glowEl.style.left = e.clientX + 'px'; glowEl.style.top = e.clientY + 'px'; }
    };
    document.addEventListener('mousemove', onMouseMove);

    // ── SCROLL PROGRESS + BACK TO TOP ──
    const progressBarEl = document.getElementById('progress-bar');
    const backTop = document.getElementById('back-top');
    const onScroll = () => {
      const s = document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (progressBarEl) progressBarEl.style.width = (s / h * 100) + '%';
      if (backTop) backTop.classList.toggle('show', s > 400);
    };
    window.addEventListener('scroll', onScroll);

    if (backTop) {
      backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    const logoClick = document.getElementById('logo-click');
    if (logoClick) {
      logoClick.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // ── TYPING EFFECT ──
    const typingLines = [
      'Cleaning oceans. Clothing communities.',
      'One pound at a time.',
      'We clean to make the Earth green. 💚',
      'Every item saved is a step forward. 🌊',
    ];
    function startTyping() {
      const el = document.getElementById('typed-text');
      if (!el) return;
      let li = 0, ci = 0, deleting = false, pausing = false;
      typeIv = setInterval(() => {
        if (pausing) return;
        const line = typingLines[li];
        if (!deleting) {
          ci++;
          el.textContent = line.slice(0, ci);
          if (ci === line.length) { pausing = true; setTimeout(() => { deleting = true; pausing = false; }, 1800); }
        } else {
          ci--;
          el.textContent = line.slice(0, ci);
          if (ci === 0) { deleting = false; li = (li + 1) % typingLines.length; }
        }
      }, 65);
    }

    // ── OCEAN CANVAS ──
    const canvas = document.getElementById('ocean-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let W, H, fish = [], bubbles = [], rays = [], oceanRipples = [];

      function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        initScene();
      }

      function initScene() {
        fish = Array.from({ length: 14 }, () => ({
          x: Math.random() * W, y: 80 + Math.random() * (H * 0.5),
          size: 8 + Math.random() * 14, speed: 0.4 + Math.random() * 0.8,
          dir: Math.random() > 0.5 ? 1 : -1,
          col: `hsl(${185 + Math.random() * 30},80%,${55 + Math.random() * 20}%)`,
          wave: Math.random() * Math.PI * 2, waveSpeed: 0.015 + Math.random() * 0.02
        }));
        bubbles = Array.from({ length: 35 }, () => ({
          x: Math.random() * W, y: H * 0.3 + Math.random() * H * 0.7,
          r: 1.5 + Math.random() * 5.5, speed: 0.3 + Math.random() * 0.7,
          alpha: 0.15 + Math.random() * 0.45,
          wobble: Math.random() * Math.PI * 2, wobbleSpeed: 0.02 + Math.random() * 0.03
        }));
        rays = Array.from({ length: 7 }, () => ({
          x: Math.random() * W, angle: -0.15 + Math.random() * 0.3,
          width: 25 + Math.random() * 55, alpha: 0.015 + Math.random() * 0.035,
          speed: 0.002 + Math.random() * 0.003, phase: Math.random() * Math.PI * 2
        }));
      }

      function drawFish(f) {
        ctx.save(); ctx.translate(f.x, f.y);
        if (f.dir < 0) ctx.scale(-1, 1);
        ctx.fillStyle = f.col; ctx.shadowColor = f.col; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.ellipse(0, 0, f.size, f.size * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-f.size * 0.9, 0); ctx.lineTo(-f.size * 1.6, -f.size * 0.6); ctx.lineTo(-f.size * 1.6, f.size * 0.6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.arc(f.size * 0.5, -f.size * 0.1, f.size * 0.14, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      let t = 0;
      canvas.addEventListener('click', e => {
        oceanRipples.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 0.6 });
      });

      function drawOcean() {
        t += 0.01; ctx.clearRect(0, 0, W, H);
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#001020'); grad.addColorStop(0.3, '#001f3f');
        grad.addColorStop(0.65, '#003d6b'); grad.addColorStop(1, '#004e7c');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

        rays.forEach(r => {
          r.phase += r.speed;
          const a = r.alpha * (0.6 + 0.4 * Math.sin(r.phase));
          const g = ctx.createLinearGradient(r.x, 0, r.x + Math.tan(r.angle) * H, H);
          g.addColorStop(0, `rgba(100,220,255,${a})`); g.addColorStop(1, 'rgba(100,220,255,0)');
          ctx.save(); ctx.beginPath();
          ctx.moveTo(r.x - r.width / 2, 0); ctx.lineTo(r.x + r.width / 2, 0);
          ctx.lineTo(r.x + r.width / 2 + Math.tan(r.angle) * H, H);
          ctx.lineTo(r.x - r.width / 2 + Math.tan(r.angle) * H, H);
          ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.restore();
        });

        bubbles.forEach(b => {
          b.wobble += b.wobbleSpeed; b.y -= b.speed; b.x += Math.sin(b.wobble) * 0.5;
          if (b.y < -10) { b.y = H + 10; b.x = Math.random() * W; }
          ctx.save(); ctx.globalAlpha = b.alpha;
          ctx.strokeStyle = 'rgba(100,220,255,0.8)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = 'rgba(100,220,255,0.07)'; ctx.fill(); ctx.restore();
        });

        fish.forEach(f => {
          f.wave += f.waveSpeed; f.x += f.speed * f.dir; f.y += Math.sin(f.wave) * 0.35;
          if (f.x > W + 60) { f.x = -60; f.dir = 1; }
          if (f.x < -60) { f.x = W + 60; f.dir = -1; }
          drawFish(f);
        });

        oceanRipples = oceanRipples.filter(r => {
          r.r += 3; r.alpha -= 0.018;
          ctx.save(); ctx.globalAlpha = Math.max(0, r.alpha);
          ctx.strokeStyle = 'rgba(100,220,255,0.8)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
          return r.alpha > 0;
        });

        for (let i = 0; i < 3; i++) {
          ctx.beginPath(); ctx.moveTo(0, H * 0.28 + i * 8);
          for (let x = 0; x < W; x += 4) {
            ctx.lineTo(x, H * 0.28 + i * 8 + Math.sin(x * 0.008 + t * (1 + i * 0.3)) * (10 - i * 3));
          }
          ctx.strokeStyle = `rgba(100,220,255,${0.07 - i * 0.02})`; ctx.lineWidth = 1.5; ctx.stroke();
        }

        ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) {
          ctx.lineTo(x, H * 0.75 + Math.sin(x * 0.006 + t * 0.8) * 15 + Math.sin(x * 0.012 - t) * 8);
        }
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        const sg = ctx.createLinearGradient(0, H * 0.7, 0, H);
        sg.addColorStop(0, 'rgba(0,50,90,0)'); sg.addColorStop(1, 'rgba(0,20,40,0.8)');
        ctx.fillStyle = sg; ctx.fill();

        oceanAnimId = requestAnimationFrame(drawOcean);
      }

      resize();
      const onOceanResize = () => resize();
      window.addEventListener('resize', onOceanResize);
      drawOcean();
    }

    // ── SCROLL REVEAL + COUNTER ANIMATE ──
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          const num = e.target.querySelector('[data-target]');
          if (num && !num.dataset.counted) { num.dataset.counted = '1'; animateCount(num); }
          if (!e.target.dataset.chimed) { e.target.dataset.chimed = '1'; playRevealChime(); }
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    document.querySelectorAll('nav a, .hero-btn, .contact-btn, #back-top, #start-btn').forEach(el => {
      el.addEventListener('click', playUiClick);
    });

    function animateCount(el) {
      const target = +el.dataset.target, prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
      const start = performance.now();
      (function tick(now) {
        const t2 = Math.min((now - start) / 1400, 1), ease = 1 - Math.pow(1 - t2, 3);
        el.textContent = prefix + Math.round(ease * target).toLocaleString() + suffix;
        if (t2 < 1) requestAnimationFrame(tick);
      })(performance.now());
    }

    // ── 3D CARD TILT ──
    document.querySelectorAll('.glass').forEach(card => {
      const mm = e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
      };
      const ml = () => { card.style.transform = ''; };
      card.addEventListener('mousemove', mm);
      card.addEventListener('mouseleave', ml);
    });

    // ── CLICK RIPPLE ──
    const onClickRipple = e => {
      const r = document.createElement('div');
      Object.assign(r.style, {
        position: 'fixed', left: e.clientX - 20 + 'px', top: e.clientY - 20 + 'px',
        width: '40px', height: '40px', borderRadius: '50%',
        border: '2px solid rgba(0,229,255,0.6)', pointerEvents: 'none',
        zIndex: '9997', transform: 'scale(0)', opacity: '1',
        transition: 'transform 0.5s ease,opacity 0.5s ease'
      });
      document.body.appendChild(r);
      requestAnimationFrame(() => { r.style.transform = 'scale(4)'; r.style.opacity = '0'; });
      setTimeout(() => r.remove(), 600);
    };
    document.addEventListener('click', onClickRipple);

    // ── LOGO EASTER EGG ──
    let logoClickCount = 0;
    const heroLogo = document.getElementById('hero-logo');
    if (heroLogo) {
      heroLogo.addEventListener('click', () => {
        logoClickCount++;
        if (logoClickCount >= 5) {
          logoClickCount = 0;
          launchConfettiBurst();
          showToast('🎉', 'You found the Easter egg!');
        }
      });
    }

    // ── IMPACT CALCULATOR ──
    function calcImpact(lbs) {
      const micro = document.getElementById('c-micro');
      const items = document.getElementById('c-items');
      const water = document.getElementById('c-water');
      const co2 = document.getElementById('c-co2');
      const rev = document.getElementById('c-revenue');
      if (micro) micro.textContent = (lbs * 0.35).toFixed(0) + ' g';
      if (items) items.textContent = '~' + (lbs * 5).toLocaleString();
      if (water) water.textContent = (lbs * 100).toLocaleString() + ' L';
      if (co2) co2.textContent = (lbs * 1.0).toFixed(0) + ' kg';
      if (rev) rev.textContent = '$' + (lbs * 1.5).toFixed(0);
    }
    const calcInp = document.getElementById('calc-lbs');
    const calcSld = document.getElementById('calc-slider');
    if (calcInp) calcInp.addEventListener('input', () => { if (calcSld) calcSld.value = calcInp.value; calcImpact(+calcInp.value); });
    if (calcSld) calcSld.addEventListener('input', () => { if (calcInp) calcInp.value = calcSld.value; calcImpact(+calcSld.value); });
    calcImpact(440);

    // ── WEB AUDIO ──
    let audioCtx = null, soundOn = false, oceanGain = null;
    let ambientGain = null, ambientScheduler = null;
    const soundBtn = document.getElementById('sound-btn');

    function initAudio() {
      if (audioCtx) return;
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ }
    }

    function createOceanSound() {
      initAudio();
      if (!audioCtx) return;
      const size = audioCtx.sampleRate * 4;
      const buf = audioCtx.createBuffer(2, size, audioCtx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for (let i = 0; i < size; i++) {
          const w = Math.random() * 2 - 1;
          b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
          b2=0.969*b2+w*0.153852; b3=0.8665*b3+w*0.3104856;
          b4=0.55*b4+w*0.5329522; b5=-0.7616*b5-w*0.016898;
          d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)/7*0.25;
          b6=w*0.115926;
        }
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const filt = audioCtx.createBiquadFilter();
      filt.type = 'lowpass'; filt.frequency.value = 350; filt.Q.value = 0.5;
      oceanGain = audioCtx.createGain(); oceanGain.gain.value = 0;
      src.connect(filt); filt.connect(oceanGain); oceanGain.connect(audioCtx.destination);
      src.start();
      oceanGain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 1.5);
    }

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundOn = !soundOn;
        soundBtn.textContent = soundOn ? '🔊' : '🔇';
        soundBtn.classList.toggle('on', soundOn);
        if (soundOn) {
          if (!audioCtx) { createOceanSound(); startAmbientMusic(); }
          else {
            if (oceanGain) { oceanGain.gain.cancelScheduledValues(audioCtx.currentTime); oceanGain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.5); }
            startAmbientMusic();
          }
        } else {
          if (oceanGain) oceanGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
          stopAmbientMusic();
        }
        playUiClick();
      });
    }

    // ── UI + AMBIENT SOUNDS ──
    function playUiClick() {
      if (!audioCtx) return;
      try {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sine'; o.frequency.value = 1100;
        g.gain.setValueAtTime(0.05, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);
        o.start(); o.stop(audioCtx.currentTime + 0.07);
      } catch(e) {}
    }

    function playRevealChime() {
      if (!audioCtx) return;
      try {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sine'; o.frequency.value = 880;
        g.gain.setValueAtTime(0, audioCtx.currentTime);
        g.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.65);
        o.start(); o.stop(audioCtx.currentTime + 0.65);
      } catch(e) {}
    }

    function startAmbientMusic() {
      initAudio();
      if (!audioCtx || ambientGain) return;
      ambientGain = audioCtx.createGain();
      ambientGain.gain.value = 0;
      ambientGain.connect(audioCtx.destination);
      const reverbBuf = audioCtx.createBuffer(2, audioCtx.sampleRate * 3, audioCtx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = reverbBuf.getChannelData(c);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.2);
      }
      const reverb = audioCtx.createConvolver();
      reverb.buffer = reverbBuf; reverb.connect(ambientGain);
      const notes = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];
      function scheduleNote() {
        if (!soundOn || !audioCtx) return;
        const freq = notes[Math.floor(Math.random() * notes.length)];
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(0, audioCtx.currentTime);
        g.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.4);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 4);
        o.connect(g); g.connect(reverb);
        o.start(); o.stop(audioCtx.currentTime + 4);
        ambientScheduler = setTimeout(scheduleNote, 1800 + Math.random() * 2800);
      }
      ambientGain.gain.linearRampToValueAtTime(0.65, audioCtx.currentTime + 2);
      scheduleNote();
    }

    function stopAmbientMusic() {
      clearTimeout(ambientScheduler);
      if (ambientGain && audioCtx) ambientGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    }

    // ── GAME SOUNDS ──
    function playSound(type) {
      initAudio();
      if (!audioCtx) return;
      try {
        switch (type) {
          case 'catch': {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(660, audioCtx.currentTime);
            o.frequency.exponentialRampToValueAtTime(1100, audioCtx.currentTime + 0.08);
            g.gain.setValueAtTime(0.25, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
            o.start(); o.stop(audioCtx.currentTime + 0.12);
            break;
          }
          case 'trash': {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(220, audioCtx.currentTime);
            o.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.15);
            g.gain.setValueAtTime(0.18, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            o.start(); o.stop(audioCtx.currentTime + 0.15);
            break;
          }
          case 'miss': {
            const size = Math.floor(audioCtx.sampleRate * 0.22);
            const buf = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < size; i++) d[i] = Math.random() * 2 - 1;
            const src = audioCtx.createBufferSource(); src.buffer = buf;
            const filt = audioCtx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 500;
            const g = audioCtx.createGain();
            g.gain.setValueAtTime(0.15, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
            src.connect(filt); filt.connect(g); g.connect(audioCtx.destination);
            src.start(); src.stop(audioCtx.currentTime + 0.22);
            break;
          }
          case 'combo': {
            [523, 659, 784, 1047].forEach((freq, i) => {
              const o = audioCtx.createOscillator(), g = audioCtx.createGain();
              o.connect(g); g.connect(audioCtx.destination);
              o.type = 'sine'; o.frequency.value = freq;
              const st = audioCtx.currentTime + i * 0.07;
              g.gain.setValueAtTime(0.2, st); g.gain.exponentialRampToValueAtTime(0.001, st + 0.18);
              o.start(st); o.stop(st + 0.18);
            });
            break;
          }
          case 'gameover': {
            [660, 550, 440, 330, 220].forEach((freq, i) => {
              const o = audioCtx.createOscillator(), g = audioCtx.createGain();
              o.connect(g); g.connect(audioCtx.destination);
              o.type = 'triangle'; o.frequency.value = freq;
              const st = audioCtx.currentTime + i * 0.18;
              g.gain.setValueAtTime(0.2, st); g.gain.exponentialRampToValueAtTime(0.001, st + 0.25);
              o.start(st); o.stop(st + 0.25);
            });
            break;
          }
          case 'highscore': {
            [523, 659, 784, 880, 1047, 1175, 1319, 1568].forEach((freq, i) => {
              const o = audioCtx.createOscillator(), g = audioCtx.createGain();
              o.connect(g); g.connect(audioCtx.destination);
              o.type = 'sine'; o.frequency.value = freq;
              const st = audioCtx.currentTime + i * 0.075;
              g.gain.setValueAtTime(0.22, st); g.gain.exponentialRampToValueAtTime(0.001, st + 0.22);
              o.start(st); o.stop(st + 0.22);
            });
            break;
          }
          case 'start': {
            [330, 440, 550, 660].forEach((freq, i) => {
              const o = audioCtx.createOscillator(), g = audioCtx.createGain();
              o.connect(g); g.connect(audioCtx.destination);
              o.type = 'sine'; o.frequency.value = freq;
              const st = audioCtx.currentTime + i * 0.06;
              g.gain.setValueAtTime(0.15, st); g.gain.exponentialRampToValueAtTime(0.001, st + 0.15);
              o.start(st); o.stop(st + 0.15);
            });
            break;
          }
        }
      } catch (e) { /* audio error */ }
    }

    // ── SDG FACT TOASTS ──
    const toastContainer = document.getElementById('toast-container');

    function showToast(icon, text) {
      if (!toastContainer) return;
      const t = document.createElement('div');
      t.className = 'toast';
      t.innerHTML = `<span class="toast-icon">${icon}</span>${text}`;
      toastContainer.appendChild(t);
      requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
      setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 500); }, 5000);
    }

    function showTrivia(text) {
      if (!toastContainer) return;
      const t = document.createElement('div');
      t.className = 'toast trivia-toast';
      t.innerHTML = `<span class="toast-icon">🧠</span><strong style="color:var(--neon);display:block;margin-bottom:3px">Did you know?</strong>${text}`;
      toastContainer.appendChild(t);
      requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
      setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 500); }, 7000);
    }

    const sdgFacts = [
      '🎯 SDG 12.5: Substantially reduce waste generation through prevention, reuse and recycling by 2030.',
      '♻️ Fact: Only 1% of all clothing is recycled into new garments globally.',
      '🌊 Fact: 35% of ocean microplastics come from washing synthetic textiles.',
      '👕 Fact: The average person buys 60% more clothing than 15 years ago.',
      '💧 Fact: Producing one cotton t-shirt uses up to 2,700 liters of fresh water.',
      '🌍 Fact: The fashion industry produces 10% of all global carbon emissions.',
      '♻️ SDG 12.8: Ensure everyone has information to make sustainable lifestyle choices.',
      '🐟 Fact: Microfibres from synthetic clothing have been found inside fish and marine life.',
    ];
    let factIdx = 0;
    toastTimeout = setTimeout(() => {
      showToast('🎯', sdgFacts[factIdx++ % sdgFacts.length]);
      toastIv = setInterval(() => {
        showToast('🎯', sdgFacts[factIdx++ % sdgFacts.length]);
      }, 30000);
    }, 7000);

    // ── CONFETTI ──
    const confCanvas = document.getElementById('confetti-canvas');
    let confPieces = [];

    function resizeConf() {
      if (confCanvas) { confCanvas.width = confCanvas.offsetWidth; confCanvas.height = confCanvas.offsetHeight; }
    }
    resizeConf();

    function launchConfettiBurst() {
      if (!confCanvas) return;
      resizeConf();
      const cctx = confCanvas.getContext('2d');
      const colors = ['#00e5ff','#0077b6','#7df9ff','#ffffff','#ffd700','#00ff88','#ff6b9d'];
      for (let i = 0; i < 130; i++) {
        confPieces.push({
          x: confCanvas.width / 2, y: confCanvas.height / 2,
          vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 13 - 4,
          size: 4 + Math.random() * 7,
          color: colors[Math.floor(Math.random() * colors.length)],
          rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 9,
          alpha: 1, shape: Math.random() > 0.5 ? 'rect' : 'circle'
        });
      }
      animConf();

      function animConf() {
        if (!confCanvas) return;
        const cctx2 = confCanvas.getContext('2d');
        cctx2.clearRect(0, 0, confCanvas.width, confCanvas.height);
        confPieces = confPieces.filter(piece => {
          piece.x += piece.vx; piece.y += piece.vy; piece.vy += 0.25;
          piece.rot += piece.rotV; piece.alpha -= 0.012;
          cctx2.save(); cctx2.globalAlpha = Math.max(0, piece.alpha);
          cctx2.fillStyle = piece.color;
          cctx2.translate(piece.x, piece.y); cctx2.rotate(piece.rot * Math.PI / 180);
          if (piece.shape === 'rect') cctx2.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size / 2);
          else { cctx2.beginPath(); cctx2.arc(0, 0, piece.size / 2, 0, Math.PI * 2); cctx2.fill(); }
          cctx2.restore();
          return piece.alpha > 0;
        });
        if (confPieces.length > 0) confAnimId = requestAnimationFrame(animConf);
        else cctx2.clearRect(0, 0, confCanvas.width, confCanvas.height);
      }
    }

    // ── IMPROVED CANVAS GAME ──
    const gameTriviaFacts = [
      'One clothes wash releases up to 700,000 microplastic fibres!',
      'Only 1% of all clothing worldwide is recycled into new garments.',
      'Fast fashion causes 10% of global carbon emissions — more than all flights combined!',
      'Making one cotton t-shirt uses 2,700 litres of water.',
      'Microplastics have been found in 73% of fish in the open ocean.',
      'Polyester keeps shedding microfibres for 100+ years in the ocean.',
      'The average person buys 60% more clothes than 15 years ago.',
      '11 million tonnes of plastic enter the ocean every single year.',
      '70% of ocean microplastics come from clothing and textiles.',
      'The fashion industry uses 79 trillion litres of water annually.',
    ];

    const CLOTHES = ['👕','👗','👖','🧥','👔','🧣','🧤','👒','🩱','🧦'];
    const TRASH_ITEMS = ['🗑️','💀','🐟','🪨'];
    let gScore = 0, gMissed = 0, gTime = 30, gRunning = false, gCombo = 0;
    let gameItems = [], gameParticles = [], gameSplashes = [];
    let hiScore = parseInt(localStorage.getItem('pt_hi') || '0');

    const scoreEl = document.getElementById('score');
    const missedEl = document.getElementById('missed');
    const timerEl = document.getElementById('timer');
    const msgEl = document.getElementById('game-msg');
    const startBtn = document.getElementById('start-btn');
    const gc = document.getElementById('game-canvas');
    const hiScoreEl = document.getElementById('hi-score-val');
    if (hiScoreEl) hiScoreEl.textContent = hiScore;

    function resizeGC() {
      if (gc) { gc.width = gc.offsetWidth; gc.height = gc.offsetHeight; }
    }
    resizeGC();
    const onGameResize = () => resizeGC();
    window.addEventListener('resize', onGameResize);

    function showMsg(txt, dur = 1200) {
      if (!msgEl) return;
      msgEl.innerHTML = txt; msgEl.classList.add('show');
      setTimeout(() => msgEl.classList.remove('show'), dur);
    }

    function spawnItem() {
      if (!gc || !gRunning) return;
      const isCloth = Math.random() > 0.28;
      const arr = isCloth ? CLOTHES : TRASH_ITEMS;
      const emoji = arr[Math.floor(Math.random() * arr.length)];
      const speedFactor = 1 + Math.max(0, (30 - gTime) * 0.045);
      gameItems.push({
        x: 44 + Math.random() * (gc.width - 88),
        y: -44, emoji, isCloth,
        speed: (1.9 + Math.random() * 2.2) * speedFactor,
        hitR: 32,
        rot: (Math.random() - 0.5) * 0.4,
        rotV: (Math.random() - 0.5) * 0.045,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.03
      });
    }

    function addParticles(x, y, color, count) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2, spd = 2.5 + Math.random() * 7;
        gameParticles.push({
          x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
          color, size: 3 + Math.random() * 6, alpha: 1,
          rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 14
        });
      }
    }

    function addSplash(x) {
      if (!gc) return;
      for (let i = 0; i < 12; i++) {
        gameSplashes.push({
          x: x + (Math.random() - 0.5) * 35, y: gc.height - 52,
          vy: -3 - Math.random() * 5.5, vx: (Math.random() - 0.5) * 4,
          alpha: 0.9, r: 2 + Math.random() * 4.5
        });
      }
    }

    let gameT = 0;
    function drawGame() {
      if (!gc) return;
      const gctx = gc.getContext('2d');
      gameT += 0.022;
      gctx.clearRect(0, 0, gc.width, gc.height);

      // Animated ocean background
      const bg = gctx.createLinearGradient(0, 0, 0, gc.height);
      bg.addColorStop(0, '#001f3f'); bg.addColorStop(0.55, '#003d6b'); bg.addColorStop(1, '#005f8e');
      gctx.fillStyle = bg; gctx.fillRect(0, 0, gc.width, gc.height);

      // Wave lines
      for (let w = 0; w < 3; w++) {
        gctx.beginPath(); gctx.moveTo(0, gc.height * 0.3 + w * 14);
        for (let x = 0; x <= gc.width; x += 4) {
          gctx.lineTo(x, gc.height * 0.3 + w * 14 + Math.sin(x * 0.012 + gameT * (1 + w * 0.4)) * (8 - w * 2));
        }
        gctx.strokeStyle = `rgba(100,220,255,${0.09 - w * 0.025})`; gctx.lineWidth = 1.5; gctx.stroke();
      }

      // Ocean floor
      gctx.fillStyle = 'rgba(0,22,48,0.88)';
      gctx.fillRect(0, gc.height - 52, gc.width, 52);
      gctx.strokeStyle = 'rgba(0,229,255,0.4)'; gctx.lineWidth = 1.5;
      gctx.beginPath(); gctx.moveTo(0, gc.height - 52); gctx.lineTo(gc.width, gc.height - 52); gctx.stroke();
      gctx.fillStyle = 'rgba(0,229,255,0.15)'; gctx.font = '0.75rem sans-serif'; gctx.textAlign = 'center'; gctx.textBaseline = 'middle';
      gctx.fillText('🌊  OCEAN FLOOR  —  CATCH CLOTHES BEFORE THEY SINK  🌊', gc.width / 2, gc.height - 24);

      // Draw items
      const fontSize = gc.height > 280 ? 36 : 28;
      gctx.font = `${fontSize}px serif`;
      gctx.textAlign = 'center'; gctx.textBaseline = 'middle';

      gameItems = gameItems.filter(item => {
        item.wobble += item.wobbleSpeed;
        item.y += item.speed;
        item.x += Math.sin(item.wobble) * 0.65;
        item.rot += item.rotV;

        gctx.save();
        gctx.translate(item.x, item.y); gctx.rotate(item.rot);
        gctx.beginPath(); gctx.arc(0, 0, item.hitR * 0.92, 0, Math.PI * 2);
        gctx.fillStyle = item.isCloth ? 'rgba(0,229,255,0.13)' : 'rgba(255,80,80,0.13)';
        gctx.fill();
        gctx.strokeStyle = item.isCloth ? 'rgba(0,229,255,0.5)' : 'rgba(255,80,80,0.45)';
        gctx.lineWidth = 1.5; gctx.stroke();
        gctx.shadowColor = item.isCloth ? 'rgba(0,229,255,0.9)' : 'rgba(255,80,80,0.8)';
        gctx.shadowBlur = item.isCloth ? 16 : 12;
        gctx.fillText(item.emoji, 0, 0);
        gctx.restore();

        if (item.y > gc.height - 44) {
          if (item.isCloth && gRunning) {
            gMissed++;
            if (missedEl) missedEl.textContent = gMissed;
            gCombo = 0;
            addSplash(item.x);
            playSound('miss');
            showMsg('🌊 Missed! Combo reset.', 600);
            if (gMissed >= 5) endGame();
          }
          return false;
        }
        return true;
      });

      // Particles
      gameParticles = gameParticles.filter(piece => {
        piece.x += piece.vx; piece.y += piece.vy; piece.vy += 0.2;
        piece.alpha -= 0.022; piece.rot += piece.rotV;
        if (piece.alpha <= 0) return false;
        gctx.save(); gctx.globalAlpha = piece.alpha; gctx.fillStyle = piece.color;
        gctx.translate(piece.x, piece.y); gctx.rotate(piece.rot * Math.PI / 180);
        gctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size / 2);
        gctx.restore();
        return true;
      });

      // Water splashes
      gameSplashes = gameSplashes.filter(s => {
        s.x += s.vx; s.y += s.vy; s.vy += 0.22; s.alpha -= 0.042;
        if (s.alpha <= 0) return false;
        gctx.save(); gctx.globalAlpha = s.alpha;
        gctx.fillStyle = 'rgba(0,229,255,0.85)';
        gctx.beginPath(); gctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); gctx.fill();
        gctx.restore();
        return true;
      });

      // Combo display
      if (gCombo >= 3 && gRunning) {
        const pulse = 0.75 + 0.25 * Math.sin(gameT * 6);
        gctx.save();
        gctx.font = `bold ${14 + Math.min(gCombo, 12)}px 'Segoe UI',sans-serif`;
        gctx.textAlign = 'center'; gctx.textBaseline = 'top';
        gctx.fillStyle = `rgba(255,215,0,${pulse})`;
        gctx.shadowColor = 'rgba(255,215,0,0.9)'; gctx.shadowBlur = 14;
        gctx.fillText(`🔥 ${gCombo}x COMBO!`, gc.width / 2, 10);
        gctx.restore();
      }

      gameAnimId = requestAnimationFrame(drawGame);
    }

    // Touch + click input for game
    function handleGameInput(clientX, clientY) {
      if (!gRunning || !gc) return;
      const rect = gc.getBoundingClientRect();
      const mx = clientX - rect.left, my = clientY - rect.top;

      for (let i = gameItems.length - 1; i >= 0; i--) {
        const item = gameItems[i];
        const dx = mx - item.x, dy = my - item.y;
        if (dx * dx + dy * dy < item.hitR * item.hitR) {
          if (item.isCloth) {
            gCombo++;
            const bonus = Math.max(1, Math.floor(gCombo / 3));
            const prevScore = gScore;
            gScore += bonus;
            if (scoreEl) scoreEl.textContent = gScore;
            if (Math.floor(gScore / 5) > Math.floor(prevScore / 5)) {
              showTrivia(gameTriviaFacts[(Math.floor(gScore / 5) - 1) % gameTriviaFacts.length]);
            }
            const colors = ['#00e5ff','#7df9ff','#ffffff','#00ff88','#ffd700'];
            addParticles(item.x, item.y, colors[Math.floor(Math.random() * colors.length)], 18);
            if (gCombo > 0 && gCombo % 3 === 0) {
              playSound('combo');
              showMsg(`🔥 ${gCombo}x COMBO! +${bonus}`, 800);
            } else {
              playSound('catch');
              showMsg(`♻️ Saved! +${bonus}`, 380);
            }
          } else {
            gCombo = 0;
            playSound('trash');
            showMsg("❌ That's trash!", 480);
            addParticles(item.x, item.y, '#ff4444', 10);
          }
          gameItems.splice(i, 1);
          break;
        }
      }
    }

    if (gc) {
      gc.addEventListener('click', e => handleGameInput(e.clientX, e.clientY));
      gc.addEventListener('touchstart', e => {
        e.preventDefault();
        const touch = e.touches[0];
        handleGameInput(touch.clientX, touch.clientY);
      }, { passive: false });
    }

    function startGame() {
      gScore = gMissed = gCombo = 0; gTime = 30; gRunning = true;
      gameItems = []; gameParticles = []; gameSplashes = [];
      if (scoreEl) scoreEl.textContent = 0;
      if (missedEl) missedEl.textContent = 0;
      if (timerEl) timerEl.textContent = 30;
      if (startBtn) { startBtn.textContent = '⏹ Running...'; startBtn.disabled = true; }
      if (msgEl) msgEl.classList.remove('show');

      initAudio();
      playSound('start');

      clearInterval(spawnIv);
      spawnIv = setInterval(spawnItem, 860);
      clearInterval(timerIv);
      timerIv = setInterval(() => {
        gTime--;
        if (timerEl) timerEl.textContent = gTime;
        if (gTime === 20 || gTime === 10) showMsg(`⚡ ${gTime}s left!`, 650);
        if (gTime <= 0) endGame();
      }, 1000);

      cancelAnimationFrame(gameAnimId);
      drawGame();
    }

    function endGame() {
      gRunning = false;
      clearInterval(spawnIv); clearInterval(timerIv);
      if (startBtn) { startBtn.disabled = false; startBtn.textContent = '▶ Play Again'; }

      playSound(gScore > hiScore ? 'highscore' : 'gameover');

      if (gScore > hiScore) {
        hiScore = gScore;
        localStorage.setItem('pt_hi', hiScore);
        if (hiScoreEl) hiScoreEl.textContent = hiScore;
        showMsg(`🏆 NEW HIGH SCORE: ${gScore}! Amazing!`, 4200);
        launchConfettiBurst();
        showToast('🏆', `New high score: ${gScore} clothes rescued from the ocean!`);
      } else {
        const msg = gScore >= 20 ? `🎉 ${gScore} rescued! Can you beat ${hiScore}?`
          : gScore >= 10 ? `🌊 ${gScore} clothes saved!`
          : `♻️ Score: ${gScore} — try again!`;
        showMsg(msg, 3500);
      }
    }

    if (startBtn) startBtn.addEventListener('click', startGame);
    showMsg('Click Start to Play! 👕', 99999);

    // Draw idle background on game canvas
    if (gc) {
      resizeGC();
      const gctxIdle = gc.getContext('2d');
      const idleBg = gctxIdle.createLinearGradient(0, 0, 0, gc.height);
      idleBg.addColorStop(0, '#001f3f'); idleBg.addColorStop(1, '#005f8e');
      gctxIdle.fillStyle = idleBg; gctxIdle.fillRect(0, 0, gc.width, gc.height);
    }

    return () => {
      cancelAnimationFrame(introAnimId);
      cancelAnimationFrame(oceanAnimId);
      cancelAnimationFrame(gameAnimId);
      cancelAnimationFrame(confAnimId);
      clearInterval(introPrgIv);
      clearInterval(spawnIv);
      clearInterval(timerIv);
      clearInterval(typeIv);
      clearInterval(loadIv);
      clearTimeout(toastTimeout);
      clearInterval(toastIv);
      clearTimeout(ambientScheduler);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('click', onClickRipple);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      {/* Cinematic Intro Sequence */}
      <div id="intro-overlay">
        <canvas id="intro-canvas"></canvas>

        {/* Letterbox bars */}
        <div id="intro-bar-top"></div>
        <div id="intro-bar-bot"></div>

        {/* Scene 1 — The problem */}
        <div id="intro-scene-1" className="intro-scene">
          <div className="intro-eyebrow">Every year</div>
          <div className="intro-headline">11 million tonnes of plastic</div>
          <div className="intro-sub">enter our oceans.</div>
        </div>

        {/* Scene 2 — The cause */}
        <div id="intro-scene-2" className="intro-scene">
          <div className="intro-eyebrow">Where does it come from?</div>
          <div className="intro-headline">35% from the clothes we wear.</div>
          <div className="intro-sub">Washing one garment releases 700,000 microfibres.</div>
        </div>

        {/* Scene 3 — The solution */}
        <div id="intro-scene-3" className="intro-scene">
          <div className="intro-headline intro-green">We&apos;re changing that.</div>
        </div>

        {/* Logo reveal */}
        <div id="intro-logo-reveal">
          <div className="intro-ring ir1"></div>
          <div className="intro-ring ir2"></div>
          <div className="intro-ring ir3"></div>
          <img src="/logo.png" alt="PikaThrift" id="intro-logo-img"/>
          <div id="intro-brand">PikaThrift</div>
          <div id="intro-tagline">Cleaning oceans. Clothing communities.</div>
        </div>

        <div id="intro-controls">
          <button id="intro-skip">Skip →</button>
        </div>
        <div id="intro-bar"></div>
      </div>

      {/* Video Modal (30s reel) */}
      <div id="video-modal">
        <div id="video-modal-inner">
          <video id="modal-video" src="/reel-30s.mp4" controls playsInline preload="none" />
          <button id="modal-close">✕</button>
        </div>
      </div>

      {/* Loading Screen */}
      <div id="loader">
        <div className="loader-pct" id="loader-pct">0%</div>
        <img src="/logo.png" className="loader-logo" alt="PikaThrift"/>
        <div className="loader-bar-wrap"><div className="loader-bar" id="loader-bar"></div></div>
        <div className="loader-text">LOADING PIKATHRIFT</div>
      </div>

      {/* Scroll Progress */}
      <div id="progress-bar"></div>

      {/* Stats Bar */}
      <div id="stats-bar">
        <span>🎯 SDG 12: Responsible Consumption and Production</span>
        <span>🌊 Student-Run Non-Profit Beach Cleanup</span>
        <span>♻️ Fighting Fast Fashion, One Pound at a Time</span>
      </div>

      {/* Nav */}
      <nav>
        <div className="nav-logo" id="logo-click">
          <img src="/logo.png" alt="PikaThrift"/>
          <span>PikaThrift</span>
        </div>
        <div className="nav-links">
          <a href="#mission">Mission</a>
          <a href="#problem">Problem</a>
          <a href="#how">How It Works</a>
          <a href="#team">Team</a>
          <a href="#calculator">Impact</a>
          <a href="#financials">Financials</a>
          <a href="#game">Game</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <canvas id="ocean-canvas"></canvas>
        <div className="hero-content">
          <div className="logo-wrap">
            <div className="ring ring1"></div><div className="ring ring2"></div>
            <div className="ring ring3"></div><div className="ring ring4"></div>
            <img src="/logo.png" alt="PikaThrift Logo" className="hero-logo" id="hero-logo"/>
          </div>
          <h1>PikaThrift</h1>
          <p className="tagline"><span id="typed-text"></span><span id="typed-cursor"></span></p>
          <div className="badge">🌊 Student-Run Non-Profit Beach Cleanup</div>
          <br/>
          <a href="#mission" className="hero-btn">Dive In ↓</a>
          <button className="reel-btn" id="watch-reel-btn">🎬 Watch Our Reel</button>
        </div>
      </div>

      <div className="section-wrap">

        {/* Mission */}
        <section id="mission">
          <h2>🎯 Our Mission</h2>
          <div className="mission-box glass reveal">
            PikaThrift is a <strong>student-run non-profit</strong> built around <strong>UN SDG Goal 12: Responsible Consumption and Production</strong>. We collect textile waste from beaches before it reaches the ocean, <strong>wash and sort</strong> every item, then sell clean clothing <strong>cheaply to thrift shops</strong> so low-income families can afford quality clothes. By giving discarded clothes a second life, we reduce waste, fight fast fashion, and put every dollar back into more cleanups.
          </div>
        </section>

        {/* Game */}
        <section id="game">
          <h2>🎮 Sort the Clothes!</h2>
          <div className="game-wrap glass reveal">
            <p>Clothes are falling into the ocean. Click them before they sink! Miss 5 and it is over. Hit 3 in a row for a combo bonus. 🌊</p>
            <div id="game-score-bar">
              <span>Score: <span id="score">0</span></span>
              <span>Missed: <span id="missed">0</span>/5</span>
              <span>Time: <span id="timer">30</span>s</span>
            </div>
            <div id="game-area">
              <canvas id="game-canvas"></canvas>
              <canvas id="confetti-canvas"></canvas>
              <div id="game-msg">Click Start to Play! 👕</div>
            </div>
            <button id="start-btn">▶ Start Game</button>
            <div id="hi-score-display">🏆 High Score: <span className="hi-score-val" id="hi-score-val">0</span></div>
            <br/><span id="sdg-badge">🎯 SDG 12: Responsible Consumption &amp; Production</span>
          </div>
        </section>

        {/* SDG 12 */}
        <section id="sdg">
          <h2>🎯 UN SDG Goal 12</h2>
          <div className="mission-box glass reveal" style={{borderLeftColor:'#ffd700'}}>
            <strong style={{color:'#ffd700'}}>Responsible Consumption and Production</strong> is one of the 17 United Nations Sustainable Development Goals. It calls on governments, businesses, and individuals to change the way we produce and consume goods — cutting waste, reducing environmental damage, and building a circular economy by 2030.
            <br/><br/>
            <strong style={{color:'#ffd700'}}>Target 12.5</strong> — Substantially reduce waste generation through prevention, reduction, recycling, and reuse. PikaThrift directly addresses this target by intercepting textile waste on beaches before it enters the ocean and extending every garment&apos;s life through resale at thrift shops.
            <br/><br/>
            <strong style={{color:'#ffd700'}}>Target 12.8</strong> — Ensure that people everywhere have relevant information and awareness for sustainable development and lifestyles in harmony with nature. PikaThrift spreads this awareness through flyers, social media reels, and community outreach.
            <br/><br/>
            Every pound of clothing we rescue is a concrete step toward the world SDG 12 envisions: one that produces less, wastes less, and reuses more.
          </div>
        </section>

        {/* The Problem */}
        <section id="problem">
          <h2>⚠️ The Problem</h2>
          <div className="stat-grid">
            <div className="stat-card reveal"><div className="stat-num">1%</div><div className="stat-label">of all textiles are actually recycled</div></div>
            <div className="stat-card reveal"><div className="stat-num">35%</div><div className="stat-label">of ocean microplastics come from synthetic textiles</div></div>
            <div className="stat-card reveal"><div className="stat-num">25%</div><div className="stat-label">of new garments remain unsold due to overproduction</div></div>
            <div className="stat-card reveal"><div className="stat-num">1.4M</div><div className="stat-label">trillion microfibres currently in our oceans</div></div>
          </div>
          <div className="quote-block reveal">"It has been estimated that 1.4 million trillion microfibres are currently in the oceans and if the fashion industry continues in a business-as-usual scenario, between 2015 and 2050, 22 million tonnes of microfibres will enter our oceans."<cite>Source: Fashion Revolution</cite></div>
          <div className="quote-block reveal" style={{marginTop:'14px'}}>The fast fashion industry mass produces trendy, low-cost clothing. As it grows, more people constantly throw away old clothes to keep up with trends — sending more textile waste into our oceans.</div>
        </section>

        {/* How It Works */}
        <section id="how">
          <h2>⚙️ How It Works</h2>
          <div className="steps">
            <div className="step reveal"><span className="icon">🌊</span><h3>Step 1 — Collect</h3><p>Volunteers use nets and bags to gather textile waste from beaches and coastal areas.</p></div>
            <div className="step reveal"><span className="icon">🧺</span><h3>Step 2 — Clean</h3><p>Every item is washed, dried, and sorted by quality and size at the laundromat.</p></div>
            <div className="step reveal"><span className="icon">🛍️</span><h3>Step 3 — Sell</h3><p>Clean, sorted clothing is sold affordably to local thrift shops for resale.</p></div>
            <div className="step reveal"><span className="icon">♻️</span><h3>Step 4 — Repeat</h3><p>Every dollar earned is reinvested into more nets, more cleanups, and more impact.</p></div>
          </div>
        </section>

        {/* Numbers */}
        <section id="numbers">
          <h2>📊 By the Numbers</h2>
          <div className="numbers-grid">
            <div className="number-card reveal"><div className="num" data-target="440" data-suffix=" lb">0</div><div className="label">Clothes collected per month (goal)</div></div>
            <div className="number-card reveal"><div className="num">5</div><div className="label">Volunteer goal to start</div></div>
            <div className="number-card reveal"><div className="num" data-target="810" data-prefix="$">0</div><div className="label">Monthly revenue (projected)</div></div>
            <div className="number-card reveal"><div className="num" data-target="200" data-prefix="$">0</div><div className="label">Monthly surplus reinvested</div></div>
          </div>
        </section>

        {/* Team */}
        <section id="team">
          <h2>👥 Our Team</h2>
          <div className="team-grid">
            <div className="team-card reveal"><div className="team-avatar">LZ</div><h3>Leo Zaks</h3><div className="role">Head of Marketing &amp; Sales</div></div>
            <div className="team-card reveal"><div className="team-avatar">EU</div><h3>Ela Unlu</h3><div className="role">Head of Marketing &amp; Sales</div></div>
            <div className="team-card reveal"><div className="team-avatar">GB</div><h3>Gabriel Balucan</h3><div className="role">Head of Supply Chain</div></div>
            <div className="team-card reveal"><div className="team-avatar">AA</div><h3>Arjun Anand</h3><div className="role">Leadership &amp; Management</div></div>
          </div>
          <div className="team-slogan reveal">💚 &quot;We clean to make the Earth green.&quot;</div>
        </section>

        {/* Community */}
        <section id="community">
          <h2>🤝 Our Community</h2>
          <div className="community-box glass reveal">Our community is made up of <strong>eco-conscious young adults</strong> who have the time and passion to help with our beach cleanups. We grow through <strong>flyers and brochures</strong> that spread the word and invite more people to join. Our volunteers are the backbone of PikaThrift. Together we are building a movement that helps both <strong>people and the planet</strong>.</div>
        </section>

        {/* Journey */}
        <section id="journey">
          <h2>🛤️ Our Journey</h2>
          <div className="journey-grid">
            <div className="journey-card reveal"><h3>⚡ Challenges</h3><ul><li>Had to pivot from our original idea</li><li>Tough decisions about the logo</li><li>Editing 10-second and 30-second reels</li><li>Balancing acting, recording, and editing</li></ul></div>
            <div className="journey-card reveal"><h3>🌟 Highlights</h3><ul><li>Recording our reels</li><li>Editing the final videos together</li><li>Acting and bringing the brand to life</li><li>Building our website at pikathrift.com</li><li>Seeing the project come together</li></ul></div>
          </div>
        </section>

        {/* Goals */}
        <section id="goals">
          <h2>🚀 Our Goals</h2>
          <div className="goals-list">
            <div className="goal-item reveal"><div className="goal-icon">🌊</div><p>Get many volunteers and clean beaches of textile waste, giving clothes a second life while helping the ocean.</p></div>
            <div className="goal-item reveal"><div className="goal-icon">📈</div><p>Grow PikaThrift into a recognized organization so our positive impact on the oceans keeps expanding.</p></div>
            <div className="goal-item reveal"><div className="goal-icon">♻️</div><p>Reinvest every dollar into upgrading our operations and increasing our environmental impact.</p></div>
          </div>
        </section>

        {/* Impact Calculator */}
        <section id="calculator">
          <h2>🧮 Impact Calculator</h2>
          <div className="calc-wrap glass reveal">
            <div className="calc-grid">
              <div className="calc-input-section">
                <h3>How much would you collect?</h3>
                <label className="calc-label" htmlFor="calc-lbs">Pounds of clothes collected</label>
                <input type="number" id="calc-lbs" className="calc-input" defaultValue="440" min="1" max="10000"/>
                <input type="range" id="calc-slider" className="calc-slider" min="1" max="2000" defaultValue="440"/>
              </div>
              <div className="calc-results">
                <div className="calc-result-item"><span className="r-label">🧵 Microplastics prevented</span><span className="r-val" id="c-micro">154 g</span></div>
                <div className="calc-result-item"><span className="r-label">👕 Items given new life</span><span className="r-val" id="c-items">~2,200</span></div>
                <div className="calc-result-item"><span className="r-label">💧 Water saved</span><span className="r-val" id="c-water">44,000 L</span></div>
                <div className="calc-result-item"><span className="r-label">🌿 CO₂ equivalent saved</span><span className="r-val" id="c-co2">440 kg</span></div>
                <div className="calc-result-item"><span className="r-label">💰 Revenue generated</span><span className="r-val" id="c-revenue">$660</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Financials */}
        <section id="financials">
          <h2>💰 Financials</h2>
          <div className="costs-wrap">
            <div className="cost-box glass reveal">
              <h3>Starting Costs</h3>
              <div className="cost-row"><span>Nets (5 x $21.99)</span><span>$110</span></div>
              <div className="cost-row"><span>Drying racks (2 x $11.99)</span><span>$24</span></div>
              <div className="cost-row"><span>First month of operations</span><span>$610</span></div>
              <div className="cost-row"><span>Starting donations</span><span>-$150</span></div>
              <div className="cost-row total"><span>Funding needed</span><span>$594</span></div>
            </div>
            <div className="cost-box glass reveal">
              <h3>Monthly Costs</h3>
              <div className="cost-row"><span>Laundromat</span><span>$90</span></div>
              <div className="cost-row"><span>Cleaning supplies</span><span>$15</span></div>
              <div className="cost-row"><span>Trash bags</span><span>$12</span></div>
              <div className="cost-row"><span>Unsold inventory</span><span>$50</span></div>
              <div className="cost-row"><span>CapCut Pro</span><span>$25</span></div>
              <div className="cost-row"><span>Claude Code</span><span>$20</span></div>
              <div className="cost-row"><span>Domain (pikathrift.com)</span><span>$12</span></div>
              <div className="cost-row"><span>Transportation</span><span>$125</span></div>
              <div className="cost-row"><span>Contingency</span><span>$261</span></div>
              <div className="cost-row total"><span>Total</span><span>$610</span></div>
            </div>
            <div className="cost-box glass reveal">
              <h3>Monthly Revenue</h3>
              <div className="cost-row"><span>Sales (440 lb x $1.50)</span><span>$660</span></div>
              <div className="cost-row"><span>Donations</span><span>$150</span></div>
              <div className="cost-row total"><span>Total</span><span>$810</span></div>
              <div className="cost-row" style={{marginTop:'12px'}}><span>Month 1 surplus</span><span>$66</span></div>
              <div className="cost-row"><span>Ongoing monthly surplus</span><span>$200</span></div>
            </div>
          </div>
        </section>

        {/* Charity */}
        <section id="charity">
          <h2>💙 Our Charity of Choice</h2>
          <div className="charity-box glass reveal">
            <div className="charity-icon">🌊</div>
            <div>
              <h3>Save Our Shores</h3>
              <p>Save Our Shores is a non-profit dedicated to saving marine habitats from plastic pollution, offshore oil drilling, and more. They host regular beach cleanups just like us — we chose them because our missions align perfectly: cleaner beaches, healthier oceans, a better planet.</p>
            </div>
          </div>
        </section>

        {/* Sources */}
        <section id="sources">
          <h2>📚 Sources</h2>
          <div className="sources-list">
            <div className="source-item reveal"><strong>National Library of Medicine (PMC)</strong>"Sustainable Development Goals for Textiles and Fashion." Official U.S. government website. Cited for textile recycling rates, overproduction, microplastics, and water consumption statistics.</div>
            <div className="source-item reveal"><strong>Fashion Revolution</strong>"What&apos;s In Our Clothes and How Does it Affect the Oceans?" Non-profit focused on fashion and the environment. Cited for microfibre pollution statistics.</div>
            <div className="source-item reveal"><strong>Marketplace</strong>"What can clothing retailers do with all that excess inventory?" Non-profit raising public awareness about economics and tech. Cited for the Burberry unsold merchandise statistic.</div>
            <div className="source-item reveal"><strong>Goodwill</strong>"What Is Goodwill&apos;s Diversion Rate From The Landfills?" Non-profit focused on giving clothes a second life. Referenced for textile diversion and resale context.</div>
          </div>
        </section>

      </div>

      {/* Contact */}
      <div className="contact-outer" id="contact">
        <div className="contact-inner reveal">
          <h2>✉️ Get In Touch</h2>
          <p>Interested in volunteering or partnering with us?<br/>We would love to hear from you!</p>
          <div className="contact-note">📚 School project demo. Not yet accepting payments or donations.</div><br/>
          <a className="contact-btn" href="https://mail.google.com/mail/?view=cm&to=leo.zaks11@gmail.com" target="_blank" rel="noopener noreferrer">📧 Send Us an Email</a>
        </div>
      </div>

      <footer>&copy; 2026 PikaThrift. A student non-profit dedicated to ocean cleanup and affordable clothing.</footer>

      {/* Floating Buttons */}
      <button id="back-top">↑</button>
      <button id="sound-btn" title="Toggle ocean sounds">🔇</button>
      <div id="cursor-glow"></div>
      <div id="toast-container"></div>
    </>
  );
}
