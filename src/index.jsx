import React from 'react';
import ReactDOM from 'react-dom';
import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

import UnisonOsc from './UnisonOsc.js';

const OSCS = ['sawtooth', 'square', 'triangle', 'sine', 'noise'];

const KEY_TO_MIDI = {
  'a':0, 'w':1, 's':2, 'e':3, 'd':4, 'f':5,
  't':6, 'g':7, 'y':8, 'h':9, 'u':10, 'j':11
};

class WebSynth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      adsr: {},
    }

    // Initialize filter, envelopes, and oscillators
    this.filter = new p5.Filter();
    this.envelopes = OSCS.map(() => new p5.Env());
    this.oscillators = OSCS.map((o, i) =>
      (o !== 'noise')
        ? new UnisonOsc(o, this.envelopes[i], this.filter)
        : new p5.Noise()
    );

    // Bind instance methods
    this.playNote = this.playNote.bind(this);
    this.endNote = this.endNote.bind(this);

    // Setup global event listeners
    window.onkeydown = (event) => {
      this.playNote(KEY_TO_MIDI[event.key]);
    }

    window.onkeyup = this.endNote;
  }

  playNote(midiNote) {
    this.oscillators.map((osc) => osc.freq(midiToFreq(midiNote)));
    this.envelopes.map((env) => env.triggerAttack());
  }

  endNote() {
    this.envelopes.map((env) => env.triggerRelease());
  }

  render() {
    // Sneakily "render" the audio elements
    const {adsr, octave} = this.state;
    this.envelopes.map((env) => env.setADSR(...adsr));

    return (
      <main>
        <div id="keyboard">
        {Object.values(KEY_TO_MIDI).map((idx) =>
          <div className="keyboard-key"
            key={idx} onClick={() => this.playNote(idx + 12*octave)} />
        )}
        </div>
      </main>
    );
  }
}