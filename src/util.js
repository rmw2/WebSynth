/**
 * util.js
 */
'use strict'

// Some hacky stuff for music
const BLACK_KEYS = [1, 3, 6, 8, 10]
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11, 12]

export const isBlackKey = (k) => (BLACK_KEYS.indexOf(k) >= 0)
