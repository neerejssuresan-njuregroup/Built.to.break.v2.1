/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;

    // Nodes
    this.masterGain = null;
    this.rumbleOsc = null;
    this.rumbleGain = null;
    this.heartbeatOsc = null;
    this.heartbeatGain = null;
    this.heartbeatInterval = null;

    this.sirenOsc = null;
    this.sirenGain = null;
    this.sirenLFO = null;

    this.noiseNode = null;
    this.noiseGain = null;
    this.noiseInterval = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio API not supported in this browser");
      return;
    }
    this.ctx = new AudioContextClass();
  }

  start() {
    this.init();
    if (!this.ctx || this.isPlaying) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isPlaying = true;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    // Smooth ramp-in
    this.masterGain.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 1.5);
    this.masterGain.connect(this.ctx.destination);

    // 1. Deep Rumble / Ominous Drone (38Hz)
    this.rumbleOsc = this.ctx.createOscillator();
    this.rumbleOsc.type = "sawtooth";
    this.rumbleOsc.frequency.setValueAtTime(38, this.ctx.currentTime);
    
    this.rumbleGain = this.ctx.createGain();
    this.rumbleGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    // Filter to keep only the deep low-end rumble
    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.setValueAtTime(65, this.ctx.currentTime);
    rumbleFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // Slow frequency LFO for unstable pressure feel
    const rumbleLFO = this.ctx.createOscillator();
    rumbleLFO.type = "sine";
    rumbleLFO.frequency.setValueAtTime(0.2, this.ctx.currentTime); // 0.2Hz (5 seconds cycle)
    const rumbleLFOGain = this.ctx.createGain();
    rumbleLFOGain.gain.setValueAtTime(5, this.ctx.currentTime);

    rumbleLFO.connect(rumbleLFOGain);
    rumbleLFOGain.connect(this.rumbleOsc.frequency);
    
    this.rumbleOsc.connect(rumbleFilter);
    rumbleFilter.connect(this.rumbleGain);
    this.rumbleGain.connect(this.masterGain);

    rumbleLFO.start();
    this.rumbleOsc.start();

    // 2. Synthesized Heartbeat / Tension Ticks (pulsing low-pass filter thump)
    this.heartbeatInterval = setInterval(() => {
      if (!this.ctx || !this.masterGain) return;
      try {
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(55, time); // Very low sub-bass kick

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(100, time);

        gain.gain.setValueAtTime(0.0, time);
        gain.gain.linearRampToValueAtTime(0.7, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4); // 400ms decay

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.5);
      } catch (e) {
        // Safe catch
      }
    }, 600); // 100 BPM heart thump

    // 3. Distant Warning Siren (oscillating high pitch, low volume)
    this.sirenOsc = this.ctx.createOscillator();
    this.sirenOsc.type = "triangle";
    this.sirenOsc.frequency.setValueAtTime(450, this.ctx.currentTime); // base siren frequency

    this.sirenGain = this.ctx.createGain();
    this.sirenGain.gain.setValueAtTime(0.02, this.ctx.currentTime); // keep it background/distant

    this.sirenLFO = this.ctx.createOscillator();
    this.sirenLFO.type = "sine";
    this.sirenLFO.frequency.setValueAtTime(0.3, this.ctx.currentTime); // slow wave sweep (3.3s cycle)
    
    const sirenLFOGain = this.ctx.createGain();
    sirenLFOGain.gain.setValueAtTime(60, this.ctx.currentTime); // warble up and down by 60Hz

    this.sirenLFO.connect(sirenLFOGain);
    sirenLFOGain.connect(this.sirenOsc.frequency);

    // Muffle the siren to sound distant
    const sirenFilter = this.ctx.createBiquadFilter();
    sirenFilter.type = "bandpass";
    sirenFilter.frequency.setValueAtTime(500, this.ctx.currentTime);
    sirenFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    this.sirenOsc.connect(sirenFilter);
    sirenFilter.connect(this.sirenGain);
    this.sirenGain.connect(this.masterGain);

    this.sirenLFO.start();
    this.sirenOsc.start();

    // 4. Procedural Crackling Fire Embers
    this.startCrackling();
  }

  startCrackling() {
    if (!this.ctx || !this.masterGain) return;

    // We can simulate wood popping/crackling using small high frequency clicks with white noise
    this.noiseInterval = setInterval(() => {
      if (!this.ctx || !this.masterGain) return;
      if (Math.random() > 0.4) return; // random crackles

      try {
        const time = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.05; // very short click
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2500 + Math.random() * 2000, time); // crackle band
        filter.Q.setValueAtTime(5.0, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.005 + Math.random() * 0.015, time); // low volume click
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noiseNode.start(time);
        noiseNode.stop(time + 0.05);
      } catch (e) {
        // Safe catch
      }
    }, 45);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.masterGain && this.ctx) {
      const time = this.ctx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(0.0, time + 0.5);
      setTimeout(() => {
        try {
          if (this.rumbleOsc) this.rumbleOsc.stop();
          if (this.sirenOsc) this.sirenOsc.stop();
          if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
          if (this.noiseInterval) clearInterval(this.noiseInterval);
        } catch (e) {
          // ignore already stopped
        }
      }, 600);
    }
  }

  setTensionLevel(level) {
    if (!this.isPlaying || !this.ctx) return;
    const time = this.ctx.currentTime;

    // level ranges from 0 (calm) to 1 (max panic)
    if (this.rumbleGain) {
      // increase low rumble power
      this.rumbleGain.gain.linearRampToValueAtTime(0.2 + (level * 0.35), time + 0.5);
    }

    if (this.sirenGain) {
      // increase siren volume
      this.sirenGain.gain.linearRampToValueAtTime(0.01 + (level * 0.06), time + 0.8);
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const audioEngine = new AudioEngine();
