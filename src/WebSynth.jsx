import React from 'react';
import Tone from 'tone';

import {isBlackKey, midiToFreq} from './util';

import './style.css';
import './layout.css';
import './keyboard.css';
import './controls.css';

const OSCS = ['sine', 'sawtooth', 'square', 'triangle'];
const N_OSCS = OSCS.length;
const NOISE = N_OSCS;

const MIN_OCTAVE = 0;
const MAX_OCTAVE = 8;

const KEY_TO_MIDI = {
  a: 0, w: 1, s: 2,
  e: 3, d: 4, f: 5,
  t: 6, g: 7, y: 8,
  h: 9, u: 10, j: 11,
  k: 12
};

// Default filter props
const FILTER_DEFAULT = { Q: 0, freq: 1000 };
const SPREAD_DEFAULT = 40; // cents
const VOICES_DEFAULT = 3;

/**
 * @classdesc
 * WebSynth is a UI component for Controlling a subtractive synthesizer
 */
class WebSynth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      adsr: {
        attack: 0.1,
        decay: 0.2,
        sustain: 1.0,
        release: 0.8
      },
      octave: 4,
      gains: [...OSCS.map(() => 1), 0],
      filterProps: [...OSCS.map(() => FILTER_DEFAULT), FILTER_DEFAULT],
      voices: [...OSCS.map(() => VOICES_DEFAULT)],
      spread: [...OSCS.map(() => SPREAD_DEFAULT)]
    };

    // Initialize filter, envelopes, and oscillators
    this.env = new Tone.AmplitudeEnvelope(this.state.adsr).toMaster();

    // Intialize individual gains for each osc and the noise
    this.gains = OSCS.map(o => new Tone.Gain().connect(this.env));
    this.gains[NOISE] = new Tone.Gain(0).connect(this.env);

    // Initialize filters for each gain
    this.filters = this.gains.map((_,i) => new Tone.Filter().connect(this.gains[i]));

    // Intiialize the oscillators and connect them to their gains
    this.oscillators = OSCS.map((o, i) =>
      new Tone.FatOscillator(440, o).connect(this.filters[i]).start());

    // Connect the noise to its specific gain
    this.noise = new Tone.Noise().connect(this.filters[NOISE]).start();

    // Bind instance methods
    this.playNote = this.playNote.bind(this);
    this.endNote = this.endNote.bind(this);
    this.adjustGain = this.adjustGain.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.setOctave = this.setOctave.bind(this);
  }

  componentDidMount() {
    // Setup global event listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp)
  }

  /**
   * Dispatcher for keyboard events
   */
  handleKeyDown(event) {
    if (event.key in KEY_TO_MIDI) {
      this.playNote(12*this.state.octave + KEY_TO_MIDI[event.key]);
    } else if (event.key === 'z') {
      this.setOctave(this.state.octave - 1);
    } else if (event.key === 'x') {
      this.setOctave(this.state.octave + 1);
    }
  }

  /**
   * Cleanup for keyboard events.  Stop playing a note if a note was being played.
   */
  handleKeyUp(event) {
    if (event.key in KEY_TO_MIDI)
      this.endNote();
  }

  /**
   * Set the oscillators to the requested frequency and trigger the ADSR
   * @param {Number} midiNote
   */
  playNote(midiNote) {
    this.oscillators.map((osc) => {
      osc.frequency.value = midiToFreq(midiNote);
    });

    this.env.triggerAttack();
  }

  /**
   * Trigger the release for the ADSR
   */
  endNote() {
    this.env.triggerRelease();
  }

  adjustGain(val, which) {
    let gains = this.state.gains.slice();

    // Awkward to manage state gains and Node gains...
    // Can nodes live on state? unclear
    // THOUGHT: maybe have the audio params get updated in the render method??
    //          that way it's kinda like the state of the audio is being rendered
    //          along with the UI, and both are controlled by Component state
    // ISSUE: this is a lot of computation to do for every update, i.e. every param
    //        is reset with every update rather than just the param that changes...

    gains[which] = val;                 // update state (for ui)
    this.setState({gains});

    this.gains[which].gain.value = val; // update WebAudio node (for sound)
  }

  adjustVoices(val, which) {
    // TODO: VALIDATE INPUT
    let voices = this.state.voices.slice();
    voices[which] = val;
    this.setState({voices})

    this.oscillators[which].count = val;
  }

  adjustSpread(val, which) {
    // TODO: VALIDATE INPUT
    let spread = this.state.spread.slice();
    spread[which] = val;
    this.setState({spread});

    this.oscillators[which].spread = val;
  }

  /**
   * Bounds check and update the current octave.
   */
  setOctave(octave) {
    if (MIN_OCTAVE <= octave && octave <= MAX_OCTAVE)
      this.setState({octave});
  }

  render() {
    const {adsr, octave, gains, voices, spread} = this.state;

    // Sneakily "render" the audio elements here ??
    //      -> see above discussion

    // Set the envelope
    Object.keys(adsr).map(prop => this.env[prop] = adsr[prop]);

    return (
      <div id="app">
        <div id="name-area" className="container">
          <span id="title">websynth</span><span id="version">0.2</span>
        </div>
        <div id="keyboard-area" className="container">
          <div id="octave">
            <span className="label">octave:</span>
            <button id="octave-down"
              className="control-button octave-button"
              onClick={() => this.setOctave(octave - 1)}
              disabled={octave <= MIN_OCTAVE}>&#9001;</button>
            <input id="octave-value"
              className="value"
              onChange={(e) => this.setOctave(e.target.value)}
              value={octave} />
            <button id="octave-up"
              className="control-button octave-button"
              onClick={() => this.setOctave(octave + 1)}
              disabled={octave >= MAX_OCTAVE}>&#9002;</button>
          </div>
          <div id="keyboard">
          {Object.values(KEY_TO_MIDI).map((idx) =>
            <div className={`keyboard-key ${isBlackKey(idx) ? 'black' : 'white'}`} key={idx}
              onMouseDown={() => this.playNote(idx + 12*octave)}
              onMouseUp={() => this.endNote()} />
          )}
          </div>
        </div>
        <div id="controls-area" className="container">
          {/* TODO: factor this out somewhere ?? */}
          {gains.map((g,i) =>
            <div className="control-group">
              <RangeSlider key={i}
                className="gain"
                outerClass="control-gain"
                value={g}
                min={0} max={1} step={0.01}
                orient="vertical"
                onChange={(val) => this.adjustGain(val, i)}/>
              {(i === NOISE) ? (
                null
              ) : (
                <div className="control-knobs">
                  <div className="control-voices">
                    <span className="knob-label">voices</span>
                    <button className="control-button voice-down"
                      onClick={() => this.adjustVoices(voices[i] - 1, i)}>&#9001;</button>
                    <input className="value"
                      onChange={(e) => this.adjustVoices(e.target.value, i)}
                      value={voices[i]}/>
                    <button className="control-button voice-up"
                      onClick={() => this.adjustVoices(voices[i] + 1, i)}>&#9002;</button>
                  </div>
                  <div className="control-spread">
                    <span className="knob-label">spread</span>
                    <button className="control-button spread-down"
                      onClick={() => this.adjustSpread(spread[i] - 1, i)}>&#9001;</button>
                    <input className="value"
                      onChange={(e) => this.adjustSpread(e.target.value, i)}
                      value={spread[i]}/>
                    <button className="control-button spread-up"
                      onClick={() => this.adjustSpread(spread[i] + 1, i)}>&#9002;</button>
                  </div>
                </div>
              )}
              <div className="control-label">{OSCS[i] || 'noise'}</div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

/**
 * Very basic rangeslider
 */
const RangeSlider = ({onChange, name, outerClass, ...props}) => (
  <div className={`slider-box ${outerClass || ''} ${props.orient || ''}`}>
    <label className={`slider-label`}>{name}</label>
    <input type="range" {...props}
      onChange={(event) => onChange(parseFloat(event.target.value))} />
  </div>
);

export default WebSynth;
