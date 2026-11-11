// Áudio: efeitos sintetizados (WebAudio), música procedural leve e falas gravadas (mp3).
import { LINES } from '../data/lines.js';

export class Audio {
  constructor() {
    this.ctx = null;
    this.voiceSrc = null;
    this.voiceId = 0;
    this.cache = {};
    this.level = 0;
    this.musicOn = false;
    this.musicT = 0;
    this.musicStep = 0;
    this.scale = [0, 2, 4, 7, 9];
    this.root = 220;
    this.tempo = 0.28;
  }

  // Precisa ser chamado dentro de um gesto do usuário (clique em "Jogar"/"Entrar em VR").
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.5;
      this.sfxBus.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.11;
      this.musicBus.connect(this.master);
      this.voiceBus = this.ctx.createGain();
      this.voiceBus.gain.value = 1.0;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.buf = new Uint8Array(this.analyser.fftSize);
      this.voiceBus.connect(this.analyser);
      this.analyser.connect(this.master);
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended' && this.ctx.resume) this.ctx.resume();
  }

  tone(freq, dur, o) {
    if (!this.ctx) return;
    o = o || {};
    const t = this.ctx.currentTime + (o.delay || 0);
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const v = o.vol === undefined ? 0.5 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(o.bus || this.sfxBus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  noise(dur, o) {
    if (!this.ctx) return;
    o = o || {};
    const t = this.ctx.currentTime + (o.delay || 0);
    const src = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    src.buffer = this.noiseBuf;
    src.loop = true;
    f.type = o.type || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 1200, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    f.Q.value = o.q || 1;
    const v = o.vol === undefined ? 0.4 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.sfxBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  sfx(name) {
    if (!this.ctx) return;
    switch (name) {
      case 'grab': this.tone(520, 0.08, { to: 780, type: 'triangle', vol: 0.35 }); break;
      case 'drop': this.tone(180, 0.1, { to: 90, type: 'sine', vol: 0.5 }); this.noise(0.06, { freq: 600, vol: 0.2 }); break;
      case 'place': this.tone(660, 0.07, { type: 'triangle', vol: 0.4 }); this.tone(990, 0.1, { type: 'triangle', vol: 0.35, delay: 0.06 }); break;
      case 'click': this.tone(900, 0.05, { type: 'square', vol: 0.18 }); break;
      case 'error': this.tone(190, 0.16, { type: 'sawtooth', vol: 0.25 }); this.tone(140, 0.22, { type: 'sawtooth', vol: 0.25, delay: 0.14 }); break;
      case 'success': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, { type: 'triangle', vol: 0.4, delay: i * 0.09 })); break;
      case 'fanfare': [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone(f, i === 6 ? 0.6 : 0.14, { type: 'square', vol: 0.2, delay: i * 0.13 })); break;
      case 'beep': this.tone(1320, 0.09, { type: 'square', vol: 0.2 }); break;
      case 'ding': this.tone(1568, 0.5, { type: 'sine', vol: 0.45 }); this.tone(2093, 0.4, { type: 'sine', vol: 0.2 }); break;
      case 'scrub': this.noise(0.12, { freq: 2400, q: 0.8, vol: 0.22 }); break;
      case 'pour': this.noise(0.25, { freq: 900, to: 1500, q: 2, vol: 0.25 }); break;
      case 'chop': this.noise(0.05, { freq: 1800, vol: 0.4 }); this.tone(220, 0.05, { type: 'square', vol: 0.15 }); break;
      case 'whoosh': this.noise(0.5, { freq: 300, to: 2400, q: 1.5, vol: 0.4 }); break;
      case 'print': this.noise(0.9, { freq: 3000, q: 4, vol: 0.12 }); this.tone(440, 0.9, { type: 'square', vol: 0.03 }); break;
      case 'coin': this.tone(1245, 0.07, { type: 'square', vol: 0.18 }); this.tone(1661, 0.25, { type: 'square', vol: 0.18, delay: 0.07 }); break;
      case 'ring': [0, 0.09, 0.18, 0.27].forEach((d) => this.tone(1760, 0.07, { type: 'square', vol: 0.14, delay: d })); break;
      case 'engine': this.tone(55, 1.4, { to: 95, type: 'sawtooth', vol: 0.4 }); this.noise(1.4, { freq: 180, vol: 0.3, type: 'lowpass' }); break;
      case 'spark': this.noise(0.08, { freq: 5000, q: 0.5, vol: 0.25 }); break;
      case 'sizzle': this.noise(0.3, { freq: 5200, q: 0.7, vol: 0.1 }); break;
      case 'pop': this.tone(300, 0.08, { to: 900, type: 'sine', vol: 0.4 }); break;
      case 'alarm': this.tone(880, 0.18, { type: 'square', vol: 0.1 }); this.tone(660, 0.18, { type: 'square', vol: 0.1, delay: 0.2 }); break;
      case 'drill': this.tone(140, 0.12, { to: 220, type: 'sawtooth', vol: 0.2 }); break;
    }
  }

  // Toca uma fala gravada. Chama onEnd ao terminar (ou após um tempo estimado se o áudio falhar).
  playVoice(id, onEnd) {
    this.stopVoice();
    const my = ++this.voiceId;
    const text = LINES[id] || '';
    let ended = false;
    const fallbackMs = 1200 + text.length * 62;
    const finish = () => {
      if (ended) return;
      ended = true;
      if (my === this.voiceId) { this.voiceSrc = null; if (onEnd) onEnd(); }
    };
    if (!this.ctx) { this._timer = setTimeout(finish, fallbackMs); return; }
    const play = (buf) => {
      if (my !== this.voiceId) return;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.voiceBus);
      src.onended = finish;
      src.start();
      this.voiceSrc = src;
      clearTimeout(this._timer);
      this._timer = setTimeout(finish, buf.duration * 1000 + 800);
    };
    if (this.cache[id]) { play(this.cache[id]); return; }
    this._timer = setTimeout(finish, fallbackMs + 3000);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'assets/voice/' + id + '.mp3', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status !== 200 && xhr.status !== 0) { clearTimeout(this._timer); this._timer = setTimeout(finish, fallbackMs); return; }
      this.ctx.decodeAudioData(xhr.response, (buf) => {
        // só mantém em memória as falas curtas e repetidas (economia de RAM no Go)
        if (/^(ok|no)\d/.test(id)) this.cache[id] = buf;
        play(buf);
      }, () => { clearTimeout(this._timer); this._timer = setTimeout(finish, fallbackMs); });
    };
    xhr.onerror = () => { clearTimeout(this._timer); this._timer = setTimeout(finish, fallbackMs); };
    xhr.send();
  }

  stopVoice() {
    this.voiceId++;
    clearTimeout(this._timer);
    if (this.voiceSrc) {
      this.voiceSrc.onended = null;
      try { this.voiceSrc.stop(); } catch (e) { /* já parou */ }
      this.voiceSrc = null;
    }
  }

  setMusic(on, root, tempo) {
    this.musicOn = on;
    if (root) this.root = root;
    if (tempo) this.tempo = tempo;
  }

  update(dt) {
    if (!this.ctx) return;
    // nível da voz (animação da boca do robô)
    let lvl = 0;
    if (this.voiceSrc) {
      this.analyser.getByteTimeDomainData(this.buf);
      let m = 0;
      for (let i = 0; i < this.buf.length; i += 4) { const v = Math.abs(this.buf[i] - 128); if (v > m) m = v; }
      lvl = Math.min(1, m / 50);
    }
    this.level += (lvl - this.level) * Math.min(1, dt * 25);
    // música: arpejo pentatônico bem discreto, abaixa quando o robô fala
    const target = this.voiceSrc ? 0.04 : 0.11;
    this.musicBus.gain.value += (target - this.musicBus.gain.value) * Math.min(1, dt * 4);
    if (!this.musicOn) return;
    this.musicT -= dt;
    if (this.musicT <= 0) {
      this.musicT += this.tempo;
      const s = this.musicStep++;
      const pat = [0, 2, 4, 2, 3, 1, 4, 2, 0, 3, 4, 1, 2, 4, 3, 2];
      const deg = pat[s % 16] + ((s >> 4) % 2 ? 1 : 0);
      const semi = this.scale[deg % 5] + 12 * ((deg / 5) | 0);
      if (s % 2 === 0 || s % 16 > 11) this.tone(this.root * 2 * Math.pow(2, semi / 12), 0.32, { type: 'triangle', vol: 0.5, bus: this.musicBus });
      if (s % 8 === 0) this.tone(this.root / 2 * Math.pow(2, this.scale[(s >> 3) % 3] / 12), 0.9, { type: 'sine', vol: 0.9, bus: this.musicBus });
    }
  }
}
