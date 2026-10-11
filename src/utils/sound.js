// Web Audio API Sound Generator for SAFEWATCH
// Generates realistic emergency alert beeps and sirens without needing external audio files.

let audioCtx = null;
let sirenOscillator = null;
let sirenGain = null;
let sirenInterval = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play a short UI beep (feedback for buttons or hold ticks)
export function playBeep(freq = 600, duration = 0.08, type = 'sine') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

// Play confirmation chime
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
    });
  } catch (e) {
    console.warn('Chime failed:', e);
  }
}

// Start emergency siren (alternating high-low alarm sweep)
export function startEmergencySiren() {
  try {
    stopEmergencySiren();
    const ctx = getAudioContext();
    if (!ctx) return;

    sirenOscillator = ctx.createOscillator();
    sirenGain = ctx.createGain();

    sirenOscillator.type = 'sawtooth';
    sirenGain.gain.setValueAtTime(0.15, ctx.currentTime);

    let high = true;
    sirenOscillator.frequency.setValueAtTime(960, ctx.currentTime);

    sirenOscillator.connect(sirenGain);
    sirenGain.connect(ctx.destination);
    sirenOscillator.start();

    sirenInterval = setInterval(() => {
      if (!sirenOscillator || !ctx) return;
      high = !high;
      const targetFreq = high ? 960 : 700;
      sirenOscillator.frequency.cancelScheduledValues(ctx.currentTime);
      sirenOscillator.frequency.linearRampToValueAtTime(targetFreq, ctx.currentTime + 0.3);
    }, 400);
  } catch (e) {
    console.warn('Siren start error:', e);
  }
}

// Stop emergency siren
export function stopEmergencySiren() {
  try {
    if (sirenInterval) {
      clearInterval(sirenInterval);
      sirenInterval = null;
    }
    if (sirenOscillator) {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
      sirenOscillator = null;
    }
    if (sirenGain) {
      sirenGain.disconnect();
      sirenGain = null;
    }
  } catch (e) {
    console.warn('Siren stop error:', e);
  }
}
