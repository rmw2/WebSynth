/**
 * Collection of presets defined by State objects for the WebSynth component
 */

export const DEFAULT = {
  adsr: {
    attack: 0.1,
    decay: 0.2,
    sustain: 1.0,
    release: 0.8
  },
  octave: 4,
  gain: [1, 1, 1, 1, 0],
  filter: [
    { Q: 0, freq: 1000 },
    { Q: 0, freq: 1000 },
    { Q: 0, freq: 1000 },
    { Q: 0, freq: 1000 },
    { Q: 0, freq: 1000 },
  ],
  voices: [3, 3, 3, 3],
  spread: [40, 40, 40, 40]
};