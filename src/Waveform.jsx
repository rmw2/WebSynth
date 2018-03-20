import React from 'react';
import Tone from 'tone';
import colormap from 'colormap';

import {resize} from './util';

import './waveform.css';

// Number of points for the waveform
const N_POINTS = 256;
// Number of bars to display the FFT
const N_FREQS = 256;
// Minimum frequency to show up on the FFT
const DB_OFFSET = -180;
// Fraction of the canvas that should be filled
// (for clamping distorted waveforms)
const VFILL = 0.9;

// Colormap for the FFT
const nshades = 12;
const COOL = colormap({colormap: 'cool', nshades});
const colorFFT = (frac) => COOL[Math.floor(frac * nshades)];

export default class Waveform extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      type: 'waveform'
    };

    // The waveform broh
    this.waveform = new Tone.Waveform(N_POINTS);
    this.FFT = new Tone.FFT(N_FREQS);

    Tone.Master.fan(this.waveform, this.FFT);

    // Bind instance methods
    this.paintWaveform = this.paintWaveform.bind(this);
    this.paintFFT = this.paintFFT.bind(this);
    this.resize = resize.bind(this);
    this.toggleWaveform = this.toggleWaveform.bind(this);
    this.toggleFFT = this.toggleFFT.bind(this);
  }

  /**
   * Get a 2d drawing context from the canvas when the component mounts
   */
  componentDidMount() {
    // Resize the window
    this.div = this.refs.div;
    this.resize();

    // Save the drawing context
    this.ctx = this.refs.canvas.getContext('2d');

    // Start the animation
    requestAnimationFrame(this.paintWaveform);
  }

  /**
   * These toggles are p hacky, would like to improve this somehow
   */
  toggleWaveform() {
    // if (this.state.type === 'waveform')
    //   return;

    this.setState({type: 'waveform'});

    // Save computation by disconnecting
    // Tone.Master.disconnect(this.FFT);
    // Tone.Master.connect(this.waveform);
  }

  toggleFFT() {
    // if (this.state.type === 'FFT')
    //   return;

    this.setState({type: 'FFT'});

    // Save computation by disconnecting
    // Tone.Master.connect(this.FFT);
    // Tone.Master.disconnect(this.waveform);
  }

  /**
   * Draw the waveform on the canvas!
   */
  paintWaveform() {
    // Get the waveform
    let {width, height, type} = this.state;
    let wave = this.waveform.getValue();

    // Clear the last waveform
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.strokeStyle = '#3f9';
    this.ctx.strokeWidth = 5;

    // Draw the waveform
    this.ctx.beginPath();
    this.ctx.moveTo(0, height * VFILL * (wave[0] + 1) / 2);
    for (let i = 1; i < N_POINTS; i++)
      this.ctx.lineTo(width * i/N_POINTS, height * VFILL * (wave[i] + 1) / 2);

    this.ctx.stroke();

    // Callback for next frame
    if (type === 'waveform') {
      requestAnimationFrame(this.paintWaveform);
    } else {
      requestAnimationFrame(this.paintFFT);
    }
  }

  /**
   * Draw the FFT on the canvas!
   */
  paintFFT() {
    let {width, height, type} = this.state;
    let spectrum = this.FFT.getValue();

    // Clear the last waveform
    this.ctx.clearRect(0, 0, width, height);

    let bar = width / N_FREQS;
    for (let i = 0; i < N_FREQS; i++) {
      let x = width * i / N_FREQS;
      let weight = (DB_OFFSET - spectrum[i]) / DB_OFFSET;
      let y = height * (1 - weight);

      this.ctx.fillStyle = colorFFT(weight);
      this.ctx.fillRect(x, y, bar, height);
    }

    // Callback for next frame
    if (type === 'waveform') {
      requestAnimationFrame(this.paintWaveform);
    } else {
      requestAnimationFrame(this.paintFFT);
    }
  }

  render() {
    let {width, height, type} = this.state;

    const showWave = (type === 'waveform');
    return (
      <div id="waveform">
        <div id="waveform-buttons">
          <button className={`visualizer-button${showWave ? ' selected' : ''}`}
            onClick={this.toggleWaveform}>waveform</button>
          <button className={`visualizer-button${showWave ? '' : ' selected'}`}
            onClick={this.toggleFFT}>FFT</button>
        </div>
        <div ref="div" id="waveform-box">
          <canvas width={width} height={height} ref="canvas" />
        </div>
      </div>
    );
  }
}
