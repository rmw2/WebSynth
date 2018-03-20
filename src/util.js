/**
 * util.js
 */

// Some hacky stuff for music
const BLACK_KEYS = [1, 3, 6, 8, 10]
// const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11, 12]

/**
 * Does this key correspond to a black key on the keyboard?
 * @param {Number} key -- the index of this key
 */
export function isBlackKey(k) {
  return (BLACK_KEYS.indexOf(k % 12) >= 0)
}

/**
 * Beacuse importing sound methods from is proving difficult...
 * @param {Number} midi -- the midi note
 */
export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Utility function for resizing based on a child div
 * should be bound to a component in the constructor
 */
export function resize() {
  // pixels of change needed to trigger resize
  // set to nonzero so that rounding errors or other small overflows don't trigger resize
  const RESIZE_THRESH = 5;

  // Set the box height
  if (!this.state.height || Math.abs(this.state.height - this.div.clientHeight) > RESIZE_THRESH)
    this.setState({height: this.div.clientHeight});
  if (!this.state.width || Math.abs(this.state.width - this.div.clientWidth) > RESIZE_THRESH)
    this.setState({width: this.div.clientWidth});
}