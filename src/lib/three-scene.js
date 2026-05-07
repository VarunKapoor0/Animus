import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

export class ARSceneManager {
  constructor(containerElement, onHitCallback) {
    this.container = containerElement;
    this.onHitCallback = onHitCallback;
    this.markers = []; // { mesh, worldPos }

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

    // Reticle — neon cyan ring on detected surface
    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.14, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.85 })
    );
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);

    this.hitTestSource = null;
    this.hitTestSourceRequested = false;
    this.lastHitPosition = null; // THREE.Vector3 of last confirmed hit

    window.addEventListener('resize', this.onWindowResize.bind(this));
    this._setupARButton();
  }

  _setupARButton() {
    const button = ARButton.createButton(this.renderer, {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: document.body },
    });
    button.style.display = 'none';
    this.container.appendChild(button);
    this.arButton = button;
  }

  startSession() {
    if (this.arButton) this.arButton.click();
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  stopSession() {
    try { this.renderer.xr.getSession()?.end(); } catch (e) {}
    this.renderer.setAnimationLoop(null);
  }

  // Call this when the user taps to scan — records the current hit position
  captureHitPosition() {
    if (this.reticle.visible) {
      const pos = new THREE.Vector3();
      pos.setFromMatrixPosition(this.reticle.matrix);
      this.lastHitPosition = pos;
      return pos;
    }
    return null;
  }

  // Place a named marker at a 3D world position
  addMarker(objectType, worldPos) {
    const geometry = new THREE.SphereGeometry(0.02, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(worldPos);
    this.scene.add(mesh);
    this.markers.push({ mesh, worldPos, objectType });
    return mesh;
  }

  removeMarker(objectType) {
    const idx = this.markers.findIndex(m => m.objectType === objectType);
    if (idx !== -1) {
      this.scene.remove(this.markers[idx].mesh);
      this.markers.splice(idx, 1);
    }
  }

  // Project 3D world position to 2D screen coordinates for DOM label overlay
  projectToScreen(worldPos) {
    const vec = worldPos.clone();
    vec.project(this.camera);
    return {
      x: (vec.x * 0.5 + 0.5) * window.innerWidth,
      y: (-vec.y * 0.5 + 0.5) * window.innerHeight,
      behind: vec.z > 1, // behind camera
    };
  }

  // Returns screen positions of all markers for React to render labels
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
        session.addEventListener('end', () => {
          this.hitTestSourceRequested = false;
          this.hitTestSource = null;
          this.reticle.visible = false;
        });
        this.hitTestSourceRequested = true;
      }

      if (this.hitTestSource) {
        const results = frame.getHitTestResults(this.hitTestSource);
        if (results.length > 0) {
          const hit = results[0];
          this.reticle.visible = true;
          this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
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
    if (this.container.contains(this.renderer.domElement)) this.container.removeChild(this.renderer.domElement);
    if (this.arButton && this.container.contains(this.arButton)) this.container.removeChild(this.arButton);
  }
}
