/**
 * Tiny sound-effect helper using the Web Audio API directly — no audio
 * files needed, just synthesized tones. Kept deliberately subtle (short,
 * soft, low volume) since these play during normal site use and should
 * never feel like a notification spam app.
 *
 * Each call creates and tears down its own AudioContext rather than
 * sharing one, since these fire rarely (a handful of times per session,
 * not continuously) — simplicity here outweighs the minor overhead of
 * not pooling contexts.
 */

type ToneShape = 'sine' | 'triangle';

function playTone(frequency: number, durationMs: number, volume: number, shape: ToneShape = 'sine', delayMs = 0) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = shape;
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    const startTime = ctx.currentTime + delayMs / 1000;
    const durationSec = durationMs / 1000;

    // Quick fade in/out avoids an audible "click" at the start/end of the tone.
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, startTime + durationSec);

    oscillator.start(startTime);
    oscillator.stop(startTime + durationSec + 0.02);

    // Release the context shortly after the tone finishes.
    setTimeout(() => ctx.close().catch(() => {}), delayMs + durationMs + 100);
  } catch {
    // Web Audio can fail to init in some environments (e.g. before any user
    // gesture, or in certain embedded webviews) — sound is a nice-to-have,
    // so we fail silently rather than ever surface an error to the user.
  }
}

/** A soft two-note rising chime — used for positive confirmations like a
 *  successful booking, quote submission, or review. */
export function playSuccessChime() {
  playTone(587.33, 110, 0.06, 'sine');        // D5
  playTone(880, 140, 0.06, 'sine', 90);        // A5
}

/** A single soft, short tone for a new notification arriving — deliberately
 *  quieter and shorter than the success chime so it doesn't compete for
 *  attention if several arrive close together. */
export function playNotificationPing() {
  playTone(740, 90, 0.045, 'triangle');
}

/** A gentle low tone for cancellations / destructive confirmations — not
 *  alarming, just a clearly different register from the success chime. */
export function playSoftAlert() {
  playTone(330, 130, 0.05, 'sine');
}
