/**
 * Sound effects for Brothers Catering Services.
 * All sounds are generated programmatically using the Web Audio API —
 * zero external files, zero network requests, works offline.
 * Each function returns immediately if the browser blocks autoplay.
 */

function ctx(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

/** Short, warm click — buttons, tabs, toggles */
export function playClick() {
  const ac = ctx(); if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(600, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.06);
  g.gain.setValueAtTime(0.18, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
  o.start(); o.stop(ac.currentTime + 0.08);
}

/** Satisfying "pop" — add to cart, add item */
export function playAddToCart() {
  const ac = ctx(); if (!ac) return;
  // Two-tone pop
  [520, 780].forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, ac.currentTime + i * 0.04);
    o.frequency.exponentialRampToValueAtTime(freq * 1.3, ac.currentTime + i * 0.04 + 0.05);
    g.gain.setValueAtTime(0.22, ac.currentTime + i * 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.04 + 0.12);
    o.start(ac.currentTime + i * 0.04);
    o.stop(ac.currentTime + i * 0.04 + 0.13);
  });
}

/** Gentle success chime — booking confirmed, form submitted, saved */
export function playSuccess() {
  const ac = ctx(); if (!ac) return;
  // Ascending three-note chime
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, ac.currentTime + i * 0.13);
    g.gain.setValueAtTime(0, ac.currentTime + i * 0.13);
    g.gain.linearRampToValueAtTime(0.20, ac.currentTime + i * 0.13 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.13 + 0.35);
    o.start(ac.currentTime + i * 0.13);
    o.stop(ac.currentTime + i * 0.13 + 0.36);
  });
}

/** Soft error buzz — validation fail, destructive action */
export function playError() {
  const ac = ctx(); if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(180, ac.currentTime);
  o.frequency.setValueAtTime(140, ac.currentTime + 0.07);
  o.frequency.setValueAtTime(180, ac.currentTime + 0.14);
  g.gain.setValueAtTime(0.12, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.22);
  o.start(); o.stop(ac.currentTime + 0.23);
}

/** Soft notification ping — bell ring for new notifications */
export function playNotification() {
  const ac = ctx(); if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(880, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(1100, ac.currentTime + 0.04);
  o.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.25);
  g.gain.setValueAtTime(0, ac.currentTime);
  g.gain.linearRampToValueAtTime(0.16, ac.currentTime + 0.03);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.45);
  o.start(); o.stop(ac.currentTime + 0.46);
}

/** Whoosh — page transitions, opening modals/menus */
export function playWhoosh() {
  const ac = ctx(); if (!ac) return;
  const bufSize = ac.sampleRate * 0.15;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, ac.currentTime);
  filter.frequency.exponentialRampToValueAtTime(2000, ac.currentTime + 0.08);
  filter.Q.setValueAtTime(0.8, ac.currentTime);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.08, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
  src.connect(filter); filter.connect(g); g.connect(ac.destination);
  src.start(); src.stop(ac.currentTime + 0.16);
}

/** Soft stamp — approve/reject in admin moderation */
export function playStamp() {
  const ac = ctx(); if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'square';
  o.frequency.setValueAtTime(90, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(45, ac.currentTime + 0.07);
  g.gain.setValueAtTime(0.15, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
  o.start(); o.stop(ac.currentTime + 0.11);
}

/** Star rating — satisfying tick per star selected */
export function playStar() {
  const ac = ctx(); if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(1000, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(1200, ac.currentTime + 0.04);
  g.gain.setValueAtTime(0.12, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.07);
  o.start(); o.stop(ac.currentTime + 0.08);
}

/** Warm whoosh-in when chatbot opens */
export function playChatOpen() {
  const ac = ctx(); if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(300, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.18);
  g.gain.setValueAtTime(0.10, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.22);
  o.start(); o.stop(ac.currentTime + 0.23);
}

/** Soft send whoosh — message sent in chat */
export function playSend() {
  const ac = ctx(); if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(500, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(900, ac.currentTime + 0.07);
  g.gain.setValueAtTime(0.10, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.10);
  o.start(); o.stop(ac.currentTime + 0.11);
}
