import React from 'react';
import Tone from 'tone';

const N_POINTS = 256;
const width = 400;
const height = 300;

export default class Waveform extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      wave: null
    };

    // The waveform broh
    this.waveform = new Tone.Waveform(N_POINTS);
    Tone.Master.connect(this.waveform);

    // Bind the paint method
    this.paint = this.paint.bind(this);
  }

  /**
   * Get a 2d drawing context from the canvas when the component mounts
   */
  componentDidMount() {
    // Save the drawing context
    this.ctx = this.refs.canvas.getContext('2d');
    this.ctx.strokeStyle = '#3f9';
    this.ctx.strokeWidth = 3;

    // Start the animation
    requestAnimationFrame(this.paint);
  }

  /**
   * Draw the waveform on the canvas!
   */
  paint() {
    // Get the waveform
    let wave = this.waveform.getValue();

    // Clear the last waveform
    this.ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);

    // Draw the waveform
    this.ctx.beginPath();
    this.ctx.moveTo(0, height * (wave[0] + 1) / 2);
    for (let i = 1; i < N_POINTS; i++) {
      this.ctx.lineTo(width * i/N_POINTS, height * (wave[i] + 1) / 2);
    }
    this.ctx.stroke();

    // Callback for next frame
    requestAnimationFrame(this.paint);
  }

  render() {
    return <canvas width={width} height={height} ref="canvas" />
  }
}
