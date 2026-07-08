// sound.js - Web Audio API Sound Synthesizer for Mallang World
const Sound = (() => {
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function noise(duration) {
    const ctx = audioCtx;
    const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  // ─── 기본 뾱 소리 ───────────────────────────────────────────────
  function playSqueeze() {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.16);
  }

  // ─── 슬라임 소리 (찐득찐득 구글구글) ──────────────────────────────
  function playSlime() {
    const ctx = initAudio();
    const now = ctx.currentTime;

    // 저음 오실레이터 - 찐득한 기저음
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(55, now + 0.3);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.35, now);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(og); og.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.35);

    // 거품 노이즈 - 구글구글
    const n = noise(0.25);
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 600;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.4, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    n.connect(lpf); lpf.connect(ng); ng.connect(ctx.destination);
    n.start(now);

    // 2번째 bubble pop
    setTimeout(() => {
      const ctx2 = audioCtx;
      const o2 = ctx2.createOscillator();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(200, ctx2.currentTime);
      o2.frequency.exponentialRampToValueAtTime(80, ctx2.currentTime + 0.15);
      const g2 = ctx2.createGain();
      g2.gain.setValueAtTime(0.2, ctx2.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.18);
      o2.connect(g2); g2.connect(ctx2.destination);
      o2.start(); o2.stop(ctx2.currentTime + 0.18);
    }, 80);
  }

  // ─── 버터 소리 (콰자작 콰자작 💛) ────────────────────────────────
  function playButter() {
    const ctx = initAudio();
    const now = ctx.currentTime;

    // 여러 번 반복되는 콰자작 bursts
    [0, 0.11, 0.23].forEach((delay, i) => {
      const t = now + delay;

      // 메인 크런치 노이즈
      const n = noise(0.1);
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(1800 - i * 200, t);
      const hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass'; hpf.frequency.value = 180;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.7, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      n.connect(lpf); lpf.connect(hpf); hpf.connect(ng); ng.connect(ctx.destination);
      n.start(t);

      // 저주파 펀치감 (콰~)
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.3, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(og); og.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.08);
    });
  }

  // ─── 뾱뾱 (탱글탱글 pop) ──────────────────────────────────────────
  function playPop() {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.38, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.08);
  }

  // ─── 물방울 소리 💧 ────────────────────────────────────────────────
  function playWater() {
    const ctx = initAudio();
    const now = ctx.currentTime;
    [0, 0.07].forEach((d, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const baseFreq = 800 + i * 300;
      osc.frequency.setValueAtTime(baseFreq * 1.5, now + d);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, now + d + 0.12);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now + d);
      gain.gain.exponentialRampToValueAtTime(0.001, now + d + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + d); osc.stop(now + d + 0.15);
    });
  }

  // ─── ASMR 바스락 소리 🎵 ──────────────────────────────────────────
  function playASMR() {
    const ctx = initAudio();
    const now = ctx.currentTime;
    const n = noise(0.18);
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass'; hpf.frequency.value = 4000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    n.connect(hpf); hpf.connect(g); g.connect(ctx.destination);
    n.start(now);
  }

  // ─── 왁스 크랙 (바삭) ──────────────────────────────────────────────
  function playWaxCrack() {
    const ctx = initAudio();
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.011;
      const n = noise(0.05);
      const hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = 3200 + Math.random() * 1500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      n.connect(hpf); hpf.connect(g); g.connect(ctx.destination);
      n.start(t);
    }
  }

  // ─── 성공 / 실패 / 클릭 ───────────────────────────────────────────
  function playSuccess() {
    const ctx = initAudio();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.value = freq;
      g.gain.setValueAtTime(0.18, now + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.15);
    });
  }

  function playFail() {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.3);
  }

  function playClick() {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.05);
  }

  // ─── 말랑이 재질/설정에 따라 소리 재생 ────────────────────────────
  function playForMallang(mallang) {
    const soundType = mallang.sound || mallang.material || 'normal';
    switch (soundType) {
      case 'slime':   playSlime();   break;
      case 'butter':  playButter();  break;
      case 'pop':     playPop();     break;
      case 'water':   playWater();   break;
      case 'asmr':    playASMR();    break;
      case 'wackpu':  playWaxCrack(); break;
      case 'needoh':
        // 니도 = 슬로우 리커버리라 소리도 느리고 묵직하게
        playSlime(); break;
      default:        playSqueeze(); break;
    }
  }

  return {
    init: initAudio,
    playSqueeze,
    playSlime,
    playButter,
    playPop,
    playWater,
    playASMR,
    playWaxCrack,
    playSuccess,
    playFail,
    playClick,
    playForMallang
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sound;
} else {
  window.Sound = Sound;
}
