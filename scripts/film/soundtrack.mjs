import { writeFileSync } from 'node:fs';
/** An original, deterministic ambient score: soft felt tones, warm pads and airy scene swells. */
export function writeSoundtrack(path) {
  const rate = 48000,
    duration = 28,
    count = rate * duration;
  const left = new Float32Array(count),
    right = new Float32Array(count);
  const chords = [
    [130.8128, 164.8138, 195.9977, 246.9417],
    [110, 130.8128, 164.8138, 195.9977],
    [87.3071, 110, 130.8128, 164.8138],
    [97.9989, 123.4708, 146.8324, 195.9977],
  ];
  for (let i = 0; i < count; i++) {
    const t = i / rate;
    let l = 0,
      r = 0;
    for (let c = 0; c < 7; c++) {
      const start = c * 4,
        age = t - start;
      if (age < 0 || age > 6) continue;
      const env = Math.min(age / 1.3, 1) * Math.min((6 - age) / 2, 1) * 0.037;
      for (const [j, f] of chords[c % 4].entries()) {
        l += Math.sin(2 * Math.PI * f * t) * env * (0.75 + 0.25 * Math.sin(t * 0.3 + j));
        r += Math.sin(2 * Math.PI * (f + 0.13) * t) * env * (0.75 + 0.25 * Math.cos(t * 0.27 + j));
      }
    }
    const fade = Math.min(t / 1.5, 1, Math.max(0, (28 - t) / 2));
    left[i] = l * fade;
    right[i] = r * fade;
  }
  const notes = [261.626, 329.628, 391.995, 493.883, 440, 391.995, 329.628, 293.665];
  for (let n = 0; n < 35; n++) {
    const start = 0.55 + n * 0.75,
      f = notes[(n * 3) % notes.length],
      pan = Math.sin(n * 1.7) * 0.35;
    for (let j = 0; j < rate * 2.2; j++) {
      const i = Math.floor(start * rate) + j;
      if (i >= count) break;
      const age = j / rate;
      const env = (1 - Math.exp(-age * 130)) * Math.exp(-age * 3.3) * 0.065;
      const tone =
        (Math.sin(2 * Math.PI * f * age) +
          0.24 * Math.sin(2 * Math.PI * f * 2 * age) +
          0.08 * Math.sin(2 * Math.PI * f * 3 * age)) *
        env;
      const fade = Math.min(1, (count - i) / (rate * 2));
      left[i] += tone * (1 - pan) * fade;
      right[i] += tone * (1 + pan) * fade;
    }
  }
  let seed = 73,
    smoothed = 0;
  for (let i = 0; i < count; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    smoothed = smoothed * 0.94 + (seed / 4294967296 - 0.5) * 0.06;
    const t = i / rate;
    let swell = 0;
    for (const cut of [5, 12, 16, 20, 24]) swell += Math.exp(-(((t - cut) / 0.6) ** 2)) * 0.07;
    left[i] += smoothed * swell;
    right[i] += smoothed * swell;
  }
  const data = Buffer.alloc(44 + count * 4);
  data.write('RIFF');
  data.writeUInt32LE(36 + count * 4, 4);
  data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22);
  data.writeUInt32LE(rate, 24);
  data.writeUInt32LE(rate * 4, 28);
  data.writeUInt16LE(4, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(count * 4, 40);
  for (let i = 0; i < count; i++) {
    data.writeInt16LE(Math.round(Math.tanh(left[i] * 1.4) * 26000), 44 + i * 4);
    data.writeInt16LE(Math.round(Math.tanh(right[i] * 1.4) * 26000), 46 + i * 4);
  }
  writeFileSync(path, data);
}
