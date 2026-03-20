/* ============================================================
   viewer3d.js — Módulo de visualización 3D con Three.js
   Soporta: .stl, .obj, .glb
   Usa CDN de Three.js r160
   ============================================================ */

/**
 * Viewer3D — Clase principal para renderizar modelos 3D interactivos
 * 
 * Uso:
 *   const viewer = new Viewer3D(containerElement, {
 *     filePath: './A-149.stl',
 *     backgroundColor: 0x332b21,
 *     onLoad: () => { ... },
 *     onError: (err) => { ... }
 *   });
 *   viewer.dispose(); // Limpieza
 */
class Viewer3D {
  constructor(container, options = {}) {
    this.container = container;
    this.filePath = options.filePath || '';
    this.bgColor = options.backgroundColor ?? 0x332b21;
    this.onLoad = options.onLoad || null;
    this.onError = options.onError || null;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationId = null;
    this.disposed = false;

    this._init();
  }

  /* ---------- Initialization ---------- */
  _init() {
    try {
      // Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(this.bgColor);

      // Camera
      const w = this.container.clientWidth || 400;
      const h = this.container.clientHeight || 280;
      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 10000);
      this.camera.position.set(0, 0, 5);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.container.appendChild(this.renderer.domElement);

      // Controls (OrbitControls)
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.enablePan = true;
      this.controls.enableZoom = true;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 1.2;
      this.controls.minDistance = 0.5;
      this.controls.maxDistance = 500;

      // Lights
      this._setupLights();

      // Resize observer
      this._resizeObserver = new ResizeObserver(() => this._onResize());
      this._resizeObserver.observe(this.container);

      // Start animation loop
      this._animate();

      // Load model
      if (this.filePath) {
        this._loadModel(this.filePath);
      }
    } catch (err) {
      console.error('Viewer3D: Error during initialization', err);
      if (this.onError) this.onError(err);
    }
  }

  /* ---------- Lighting ---------- */
  _setupLights() {
    // Ambient light for base illumination
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    // Main directional light
    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.0);
    dirLight.position.set(5, 8, 5);
    this.scene.add(dirLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xe6f0ff, 0.5);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    // Subtle rim/back light
    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.3);
    rimLight.position.set(0, -3, -6);
    this.scene.add(rimLight);

    // Hemisphere light for natural feel
    const hemiLight = new THREE.HemisphereLight(0xfff5e0, 0x4a3f32, 0.4);
    this.scene.add(hemiLight);
  }

  /* ---------- Model Loading ---------- */
  _loadModel(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();

    switch (ext) {
      case 'stl':
        this._loadSTL(filePath);
        break;
      case 'obj':
        this._loadOBJ(filePath);
        break;
      case 'glb':
      case 'gltf':
        this._loadGLTF(filePath);
        break;
      default:
        const err = new Error(`Formato no soportado: .${ext}`);
        console.error(err);
        if (this.onError) this.onError(err);
    }
  }

  _loadSTL(filePath) {
    const loader = new THREE.STLLoader();
    loader.load(
      filePath,
      (geometry) => {
        if (this.disposed) return;
        // Material with warm archaeological tone
        const material = new THREE.MeshStandardMaterial({
          color: 0xc9a87c,
          metalness: 0.15,
          roughness: 0.65,
          flatShading: false
        });
        // Compute smooth normals
        geometry.computeVertexNormals();

        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this._fitCameraToObject(mesh);
        if (this.onLoad) this.onLoad();
      },
      undefined,
      (err) => {
        console.error('Viewer3D: Error loading STL', err);
        if (this.onError) this.onError(err);
      }
    );
  }

  _loadOBJ(filePath) {
    const loader = new THREE.OBJLoader();
    loader.load(
      filePath,
      (object) => {
        if (this.disposed) return;
        // Apply material to all meshes in the OBJ
        const material = new THREE.MeshStandardMaterial({
          color: 0xc9a87c,
          metalness: 0.15,
          roughness: 0.65
        });
        object.traverse((child) => {
          if (child.isMesh) {
            child.material = material;
            if (child.geometry) {
              child.geometry.computeVertexNormals();
            }
          }
        });
        this.scene.add(object);
        this._fitCameraToObject(object);
        if (this.onLoad) this.onLoad();
      },
      undefined,
      (err) => {
        console.error('Viewer3D: Error loading OBJ', err);
        if (this.onError) this.onError(err);
      }
    );
  }

  _loadGLTF(filePath) {
    const loader = new THREE.GLTFLoader();
    loader.load(
      filePath,
      (gltf) => {
        if (this.disposed) return;
        const model = gltf.scene;
        this.scene.add(model);
        this._fitCameraToObject(model);
        if (this.onLoad) this.onLoad();
      },
      undefined,
      (err) => {
        console.error('Viewer3D: Error loading GLTF/GLB', err);
        if (this.onError) this.onError(err);
      }
    );
  }

  /* ---------- Camera Auto-Fit ---------- */
  _fitCameraToObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Center object at origin
    object.position.sub(center);

    // Position camera to frame the object
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraDistance = (maxDim / 2) / Math.tan(fov / 2);
    cameraDistance *= 1.6; // Add some margin

    this.camera.position.set(
      cameraDistance * 0.6,
      cameraDistance * 0.4,
      cameraDistance * 0.8
    );
    this.camera.lookAt(0, 0, 0);

    // Update controls target
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Update near/far planes based on model size
    this.camera.near = maxDim * 0.001;
    this.camera.far = maxDim * 100;
    this.camera.updateProjectionMatrix();
  }

  /* ---------- Animation Loop ---------- */
  _animate() {
    if (this.disposed) return;
    this.animationId = requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /* ---------- Resize ---------- */
  _onResize() {
    if (this.disposed || !this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /* ---------- Cleanup ---------- */
  dispose() {
    this.disposed = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    // Dispose geometries and materials
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }
  }
}

/* ============================================================
   Modal Viewer — Visor ampliado en pantalla completa
   ============================================================ */
class ModalViewer {
  constructor() {
    this.overlay = document.getElementById('modal-overlay');
    this.content = document.getElementById('modal-viewer-container');
    this.closeBtn = document.getElementById('modal-close');
    this.titleEl = document.getElementById('modal-title');
    this.loadingEl = document.getElementById('modal-loading');
    this.viewer = null;

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  open(filePath, title) {
    if (!this.overlay || !this.content) return;

    // Show modal
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Set title
    if (this.titleEl) this.titleEl.textContent = title || '';

    // Show loading
    if (this.loadingEl) this.loadingEl.style.display = 'flex';

    // Dispose previous viewer
    if (this.viewer) {
      this.viewer.dispose();
      this.viewer = null;
    }

    // Create viewer in modal
    this.viewer = new Viewer3D(this.content, {
      filePath: filePath,
      backgroundColor: 0x2a2219,
      onLoad: () => {
        if (this.loadingEl) this.loadingEl.style.display = 'none';
        // Disable auto-rotate in fullscreen for manual exploration
        if (this.viewer && this.viewer.controls) {
          this.viewer.controls.autoRotate = false;
        }
      },
      onError: () => {
        if (this.loadingEl) {
          this.loadingEl.innerHTML = '<span style="color:#b57a5a;">No fue posible cargar este modelo en vista ampliada</span>';
        }
      }
    });
  }

  close() {
    if (this.viewer) {
      this.viewer.dispose();
      this.viewer = null;
    }
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
    if (this.loadingEl) {
      this.loadingEl.innerHTML = '<div class="spinner"></div><span>Cargando modelo...</span>';
      this.loadingEl.style.display = 'flex';
    }
  }
}

/* Make classes globally available */
window.Viewer3D = Viewer3D;
window.ModalViewer = ModalViewer;
