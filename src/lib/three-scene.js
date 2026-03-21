import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

export class ARSceneManager {
  constructor(containerElement, onSelectCallback) {
    this.container = containerElement;
    this.onSelectCallback = onSelectCallback;
    
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    
    this.container.appendChild(this.renderer.domElement);
    
    // Add light
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);
    
    // The WebXR standard controller
    this.controller = this.renderer.xr.getController(0);
    this.controller.addEventListener('select', this.onSelect.bind(this));
    this.scene.add(this.controller);
    
    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff })
    );
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);
    
    this.hitTestSource = null;
    this.hitTestSourceRequested = false;
    
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    this.setupARButton();
  }
  
  setupARButton() {
    const button = ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] });
    // To allow custom UI via DOM Overlay, we'd add domOverlay: { root: document.body }
    // But since the scope is simple, we will just use it to get spatial tracking
    this.container.appendChild(button);
    // Hide standard button to customize our trigger if we wanted
    button.style.display = 'none'; 
    this.arButton = button;
  }
  
  startARRenderLoop() {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }
  
  stopARRenderLoop() {
    this.renderer.setAnimationLoop(null);
  }
  
  onSelect() {
    if (this.reticle.visible) {
       if (this.onSelectCallback) {
         // Pass position of reticle hit
         const position = new THREE.Vector3();
         position.setFromMatrixPosition(this.reticle.matrix);
         this.onSelectCallback(position);
       }
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

      if (this.hitTestSourceRequested === false) {
        session.requestReferenceSpace('viewer').then((referenceSpace) => {
          session.requestHitTestSource({ space: referenceSpace }).then((source) => {
            this.hitTestSource = source;
          });
        });
        session.addEventListener('end', () => {
          this.hitTestSourceRequested = false;
          this.hitTestSource = null;
        });
        this.hitTestSourceRequested = true;
      }

      if (this.hitTestSource) {
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
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
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    if (this.container.contains(this.renderer.domElement)) {
       this.container.removeChild(this.renderer.domElement);
    }
    if (this.container.contains(this.arButton)) {
       this.container.removeChild(this.arButton);
    }
  }
}
