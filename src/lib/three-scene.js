import * as THREE from 'three';

export class ARSceneManager {
  constructor(containerElement, onHitCallback) {
    this.container = containerElement;
    this.onHitCallback = onHitCallback;
    this.markers = [];
    this.session = null;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);

    this.controller = this.renderer.xr.getController(0);
    this.controller.addEventListener('select', this.onSelect.bind(this));
    this.scene.add(this.controller);

    // Neon cyan reticle ring on detected surface
    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.14, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.85 })
    );
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);

    this.hitTestSource = null;
    this.hitTestSourceRequested = false;

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  // Start AR session programmatically — no button needed
  async startSession() {
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body },
      });
      this.session = session;
      await this.renderer.xr.setSession(session);
      this.renderer.setAnimationLoop(this.render.bind(this));

      session.addEventListener('end', () => {
        this.hitTestSourceRequested = false;
        this.hitTestSource = null;
        this.reticle.visible = false;
        this.session = null;
        this.renderer.setAnimationLoop(null);
      });
    } catch (err) {
      console.error('Failed to start AR session:', err);
    }
  }

  stopSession() {
    try { this.session?.end(); } catch (e) {}
    this.renderer.setAnimationLoop(null);
  }

  // Snapshot the reticle's current world position when user taps to scan
  captureHitPosition() {
    if (this.reticle.visible) {
      const pos = new THREE.Vector3();
      pos.setFromMatrixPosition(this.reticle.matrix);
      return pos;
    }
    return null;
  }

  addMarker(objectType, worldPos) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff })
    );
    mesh.position.copy(worldPos);
    this.scene.add(mesh);
    this.markers.push({ mesh, worldPos, objectType });
  }

  removeMarker(objectType) {
    const idx = this.markers.findIndex(m => m.objectType === objectType);
    if (idx !== -1) {
      this.scene.remove(this.markers[idx].mesh);
      this.markers.splice(idx, 1);
    }
  }

  projectToScreen(worldPos) {
    const vec = worldPos.clone();
    vec.project(this.camera);
    return {
      x: (vec.x * 0.5 + 0.5) * window.innerWidth,
      y: (-vec.y * 0.5 + 0.5) * window.innerHeight,
      behind: vec.z > 1,
    };
  }

  getMarkerScreenPositions() {
    return this.markers.map(m => ({
      objectType: m.objectType,
      screen: this.projectToScreen(m.worldPos),
    }));
  }

  onSelect() {
    if (this.reticle.visible && this.onHitCallback) {
      const pos = new THREE.Vector3();
      pos.setFromMatrixPosition(this.reticle.matrix);
      this.onHitCallback(pos);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render(timestamp, frame) {
    if (frame) {
      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const session = this.renderer.xr.getSession();

      if (!this.hitTestSourceRequested) {
        session.requestReferenceSpace('viewer').then(viewerSpace => {
          session.requestHitTestSource({ space: viewerSpace }).then(source => {
            this.hitTestSource = source;
          });
        });
        this.hitTestSourceRequested = true;
      }

      if (this.hitTestSource) {
        const results = frame.getHitTestResults(this.hitTestSource);
        if (results.length > 0) {
          this.reticle.visible = true;
          this.reticle.matrix.fromArray(
            results[0].getPose(referenceSpace).transform.matrix
          );
        } else {
          this.reticle.visible = false;
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
