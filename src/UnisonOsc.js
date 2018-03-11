import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

/**
 * @classdesc
 * The main oscillator wrapper class
 */
export default class UnisonOscillator {
  constructor(wavetype, envelope, filter) {
    if (['sine', 'triangle', 'sawtooth', 'square'].indexOf(wavetype) < 0)
      throw new Error('Wavetype must be either sine, triangle, sawtooth, or square.');

    // Initialize instance letiables
    this.wavetype = wavetype;
    this.unison = 1;
    this.detune = 0;

    // Create the default oscillator
    let osc = new p5.Oscillator();
    osc.setType(wavetype);
    osc.amp(envelope);
    osc.disconnect();
    osc.connect(filter);
    osc.start();

    // Private instance variables
    this._oscs = [osc];
    this._detunes = [0];
    this._envelope = envelope;
    this._filter = filter;
  }

  /**
   * @private
   */
  _changeUnison() {
    let unison = this.unison;
    let detune = this.detune;
    let wavetype = this.wavetype;
    let envelope = this._envelope;
    let filter = this._filter;
    let detunePerOsc = detune / unison;

    // Destroy the old oscillators
    let oscs = this._oscs;
    for (let i = 0; i < oscs.length; i++) {
      oscs[i].disconnect();
      oscs[i].amp(0);
    }

    // Reinitialize oscillators and corresponding detune values
    oscs = new Array(unison);
    let detunes = new Array(unison);
    let currentDetune = -detune;

    for (i = 0; i < unison; i++) {
      let osc = new p5.Oscillator();
      osc.setType(wavetype);
      osc.amp(envelope);
      osc.disconnect();
      osc.connect(filter);
      osc.start();

      oscs[i] = osc;
      detunes[i] = currentDetune;
      currentDetune = currentDetune - detunePerOsc;
    }

    this._oscs = oscs;
    this._detunes = detunes;

    return true;
  }

  /**
   * @param {number} unsion : number of oscillators in unison
   * @param {number} detune : the frequency of detune for the most detuned oscillator in unison
   * @return {boolean} Return whether or not the unison/detune was changed
   */
  set(unison, detune) {
    if (typeof unison !== 'number' || typeof detune !== 'number') {
      throw new Error('Unison and detune must be numbers.');
    }
    if (unison < 0) {
      throw new Error('Unison must be a positive value.')
    }

    detune = Math.abs(detune);

    this.unison = unison;
    this.detune = detune;

    return this._changeUnison();
  }

  /**
   * @param {p5.Filter} filter - The filter the sound source will go through
   */
  changeFilter(filter) {
    for (let i = 0; i < this.unison; i++) {
      this._oscs[i].disconnect();
      this._oscs[i].connect(filter);
    }

    this._filter = filter;
  }

  /**
   * @param {p5.Env} envelope - The envelope the sound source's amplitude will follow
   */
  changeEnvelope(envelope) {
    for (let i = 0; i < this.unison; i++) {
      this._oscs[i].amp(envelope);
    }

    this._envelope = envelope;
  }

  /*
   * @param {number} note - The frequency (NOT MIDI) the oscillator will play
   */
  freq(note) {
    // If this is a oscillator passed in (LFO), extra handling is needed
    if (typeof note === 'object') {
      this._frequencyModulate(note);
      return;
    };

    // Set each oscillator to its detuned frequency
    for (let i = 0; i < this.unison; i++) {
      let thisFrequency = note + this._detunes[i];
      this._oscs[i].freq(thisFrequency);
    }
  }

  /**
   * @private
   */
  _frequencyModulate(modulator) {
    for (const osc of this._oscs) {
      osc.freq(modulator);
    }
  }
}