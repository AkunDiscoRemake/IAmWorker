// I AM WORKER — ponto de entrada: renderer, sessão WebXR, laço principal e troca de cenas.
import * as THREE from '../lib/three.module.js';
import { disposeObject } from './core/build.js';
import { Tweens } from './core/tween.js';
import { FX } from './core/fx.js';
import { Audio } from './core/audio.js';
import { Save } from './core/save.js';
import { Input } from './core/input.js';
import { Player } from './core/player.js';
import { World } from './core/world.js';
import { Robot } from './core/robot.js';
import { Hub } from './scenes/hub.js';
import { JOBS } from './jobs/index.js';

class Game {
  constructor() {
    const canvas = document.getElementById('c');
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.xr.enabled = true;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8ecae6);
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 80);
    this.camera.rotation.order = 'YXZ';
    this.camera.position.set(0, 1.6, 0);
    this.rig = new THREE.Group();
    this.rig.add(this.camera);
    this.scene.add(this.rig);

    // Iluminação barata: hemisférica + uma direcional, sem sombras.
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f9c, 0.78));
    const sun = new THREE.DirectionalLight(0xffffff, 0.42);
    sun.position.set(2, 5, 3);
    this.scene.add(sun);

    // Esfera de fade presa à câmera (transições de cena confortáveis em VR).
    this.fadeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide, transparent: true, opacity: 0, depthTest: false, depthWrite: false })
    );
    this.fadeMesh.renderOrder = 999;
    this.fadeMesh.visible = false;
    this.camera.add(this.fadeMesh);
    this.fade = { v: 0, to: 0, speed: 3, cb: null };

    this.tweens = new Tweens();
    this.audio = new Audio();
    this.save = new Save();
    this.fx = new FX(this.scene);
    this.world = new World(this);
    this.input = new Input(this);
    this.player = new Player(this);
    this.robot = new Robot(this);

    this.started = false;
    this.switching = false;
    this.current = null;
    this.xrFloor = false;
    this.last = 0;

    this._swap(new Hub(this));
    this._ui();
    window.addEventListener('resize', () => this._resize());
    this.renderer.setAnimationLoop((t) => this.tick(t));
  }

  // ---------- interface 2D / início ----------
  _ui() {
    const $ = (id) => document.getElementById(id);
    this.el = { overlay: $('overlay'), vr: $('btn-vr'), desk: $('btn-desk'), status: $('status'), cross: $('cross'), tip: $('tip') };
    const xr = navigator.xr;
    const setVR = (ok, msg) => {
      this.el.vr.disabled = !ok;
      this.el.vr.textContent = ok ? 'Entrar em VR' : 'VR indisponível';
      if (msg) this.el.status.textContent = msg;
    };
    if (xr && xr.isSessionSupported) {
      xr.isSessionSupported('immersive-vr').then((ok) => setVR(ok, ok ? '' : 'Nenhum headset WebXR detectado: use o modo navegador.'), () => setVR(false));
    } else if (xr && xr.supportsSession) {
      xr.supportsSession('immersive-vr').then(() => setVR(true), () => setVR(false));
    } else {
      setVR(false, window.isSecureContext ? 'WebXR não encontrado neste navegador: use o modo navegador.' : 'WebXR exige HTTPS (o GitHub Pages já usa).');
    }
    this.el.vr.addEventListener('click', () => this.enterVR());
    this.el.desk.addEventListener('click', () => {
      this.audio.unlock();
      this.begin();
      this.el.cross.style.display = 'block';
      this.el.tip.style.display = 'block';
      this.el.tip.textContent = 'Mouse: olhar · WASD / botão direito: andar · Botão esquerdo: pegar, soltar e clicar · Esc: liberar o mouse';
      const cv = this.renderer.domElement;
      if (cv.requestPointerLock) cv.requestPointerLock();
    });
  }

  begin() {
    this.el.overlay.style.display = 'none';
    if (this.started) return;
    this.started = true;
    this.audio.setMusic(true, this.current.music[0], this.current.music[1]);
    this.current.enter();
  }

  // ---------- WebXR ----------
  enterVR() {
    this.audio.unlock();
    const xr = navigator.xr;
    if (!xr) return;
    // 'local-floor' é opcional: no Oculus Go (3DoF) pode não existir; aí usamos 'local' + altura fixa.
    xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] }).then((session) => {
      const probe = session.requestReferenceSpace('local-floor').then(() => true, () => false);
      probe.then((floor) => {
        this.xrFloor = floor;
        this.renderer.xr.setReferenceSpaceType(floor ? 'local-floor' : 'local');
        return this.renderer.xr.setSession(session);
      }).then(() => {
        this.camera.position.set(0, 0, 0);
        this.camera.rotation.set(0, 0, 0);
        this.rig.position.y = this.xrFloor ? 0 : 1.6;
        this.el.cross.style.display = 'none';
        this.el.tip.style.display = 'none';
        this.begin();
      }, (err) => { this.el.status.textContent = 'Falha ao iniciar a sessão VR: ' + (err && err.message ? err.message : err); });
      session.addEventListener('end', () => {
        this.rig.position.y = 0;
        this.camera.position.set(0, 1.6, 0);
        this.camera.quaternion.set(0, 0, 0, 1);
        this.el.overlay.style.display = 'flex';
        this._resize();
      });
    }, (err) => { this.el.status.textContent = 'Não foi possível entrar em VR: ' + (err && err.message ? err.message : err); });
  }

  _resize() {
    if (this.renderer.xr.isPresenting) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  }

  // ---------- cenas ----------
  gotoHub() { this.go(() => new Hub(this)); }
  startJob(id) {
    for (let i = 0; i < JOBS.length; i++) if (JOBS[i].id === id) { const C = JOBS[i].cls; this.go(() => new C(this)); return; }
  }

  go(factory) {
    if (this.switching) return;
    this.switching = true;
    this.world.locked = true;
    this.audio.sfx('whoosh');
    this.fadeTo(1, () => {
      this._swap(factory());
      this.fadeTo(0, () => { this.world.locked = false; this.switching = false; });
    });
  }

  fadeTo(v, cb) { this.fade.to = v; this.fade.cb = cb || null; this.fadeMesh.visible = true; }

  _swap(sc) {
    if (this.current) {
      this.current.dispose();
      this.scene.remove(this.current.root);
      disposeObject(this.current.root);
    }
    this.tweens.clear();
    this.robot.hush();
    this.robot.setIdleText('', '');
    this.world.reset(sc.root);
    this.current = sc;
    this.scene.add(sc.root);
    sc.build();
    sc.finishBuild();
    this.scene.background.setHex(sc.bg);
    this.player.teleport(sc.spawn[0], sc.spawn[1], sc.spawn[2]);
    this.robot.setHat(sc.hat);
    this.robot.warp();
    this.audio.setMusic(this.started, sc.music[0], sc.music[1]);
    if (this.started) sc.enter();
  }

  // ---------- laço ----------
  tick(t) {
    const dt = Math.min(0.05, Math.max(0.001, (t - this.last) / 1000));
    this.last = t;
    this.step(dt);
    this.renderer.render(this.scene, this.camera);
  }

  step(dt) {
    this.input.update(dt);
    if (this.started) {
      this.player.update(dt);
      this.world.update(dt);
      this.current.update(dt);
      this.robot.update(dt);
    }
    this.tweens.update(dt);
    this.fx.update(dt);
    this.audio.update(dt);
    const f = this.fade;
    if (f.v !== f.to) {
      const d = f.speed * dt;
      f.v = f.v < f.to ? Math.min(f.to, f.v + d) : Math.max(f.to, f.v - d);
      this.fadeMesh.material.opacity = f.v;
      if (f.v === f.to) {
        if (f.v === 0) this.fadeMesh.visible = false;
        const cb = f.cb;
        f.cb = null;
        if (cb) cb();
      }
    }
  }
}

window.game = new Game();
