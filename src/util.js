/**
 * util.js
 */

// Some hacky stuff for music
const BLACK_KEYS = [1, 3, 6, 8, 10]
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11, 12]

/**
 * Does this key correspond to a black key on the keyboard?
 * @param {Number} key -- the index of this key
 */
export function isBlackKey(k) {
  return (BLACK_KEYS.indexOf(k) >= 0)
}

/**
 * Beacuse importing sound methods from is proving difficult...
 * @param {Number} midi -- the midi note
 */
export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
