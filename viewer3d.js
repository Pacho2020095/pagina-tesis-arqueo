import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

const models = window.NT_ARCH_DATA?.models || [];
const assetSources = window.NT_ARCH_DATA?.assetSources || {
  models: { zipUrl: 'models.zip', directFolder: 'models/' },
  previews: { zipUrl: 'previews.zip', directFolder: 'previews/' }
};
const previewExtensions = window.NT_ARCH_DATA?.previewExtensions || ['png', 'jpg', 'jpeg', 'webp', 'avif'];

const modal = document.getElementById('viewerModal');
const modalViewer = document.getElementById('modalViewer');
const closeModalBtn = document.getElementById('closeModal');
const loader = new GLTFLoader();
const viewerStates = new Map();
const assetUrlCache = new Map();
const assetZipCache = new Map();
const directAssetProbeCache = new Map();
let modalState = null;

function normalizePath(path = '') {
  return path.replace(/\\/g, '/').replace(/^\.?\//, '').toLowerCase();
}

function getBaseName(path = '') {
  const normalized = normalizePath(path);
  return normalized.split('/').pop() || normalized;
}

function getExtension(path = '') {
  const base = getBaseName(path);
  const parts = base.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function getMimeType(path = '') {
  const extension = getExtension(path);
  const map = {
    glb: 'model/gltf-binary',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    avif: 'image/avif'
  };
  return map[extension] || 'application/octet-stream';
}

async function getZipBundle(bundleName) {
  if (assetZipCache.has(bundleName)) return assetZipCache.get(bundleName);

  const source = assetSources[bundleName];
  const promise = fetch(source.zipUrl, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`No se encontró ${source.zipUrl}`);
      return response.arrayBuffer();
    })
    .then((buffer) => JSZip.loadAsync(buffer))
    .catch(() => null);

  assetZipCache.set(bundleName, promise);
  return promise;
}

function findFileInZip(zip, requestedPath) {
  if (!zip) return null;

  const requested = normalizePath(requestedPath);
  const requestedBase = getBaseName(requestedPath);
  const files = Object.values(zip.files).filter((entry) => !entry.dir);

  let exact = files.find((entry) => normalizePath(entry.name) === requested);
  if (exact) return exact;

  exact = files.find((entry) => normalizePath(entry.name).endsWith(`/${requested}`));
  if (exact) return exact;

  exact = files.find((entry) => getBaseName(entry.name) === requestedBase);
  if (exact) return exact;

  return null;
}

async function probeDirectAsset(path) {
  const normalized = normalizePath(path);
  if (directAssetProbeCache.has(normalized)) return directAssetProbeCache.get(normalized);

  const promise = fetch(path, { method: 'GET', cache: 'no-store' })
    .then((response) => (response.ok ? path : null))
    .catch(() => null);

  directAssetProbeCache.set(normalized, promise);
  return promise;
}

async function resolveAssetUrl(path, bundleName) {
  const cacheKey = `${bundleName}:${normalizePath(path)}`;
  if (assetUrlCache.has(cacheKey)) return assetUrlCache.get(cacheKey);

  const bundle = await getZipBundle(bundleName);
  if (bundle) {
    const entry = findFileInZip(bundle, path);
    if (entry) {
      const content = await entry.async('uint8array');
      const blob = new Blob([content], { type: getMimeType(entry.name || path) });
      const objectUrl = URL.createObjectURL(blob);
      assetUrlCache.set(cacheKey, objectUrl);
      return objectUrl;
    }
  }

  assetUrlCache.set(cacheKey, path);
  return path;
}

async function resolvePreviewUrl(previewBase) {
  if (!previewBase) return null;

  const zip = await getZipBundle('previews');
  if (zip) {
    for (const extension of previewExtensions) {
      const requested = `previews/${previewBase}.${extension}`;
      const entry = findFileInZip(zip, requested);
      if (!entry) continue;

      const cacheKey = `previews:${normalizePath(requested)}`;
      if (assetUrlCache.has(cacheKey)) return assetUrlCache.get(cacheKey);

      const content = await entry.async('uint8array');
      const blob = new Blob([content], { type: getMimeType(requested) });
      const objectUrl = URL.createObjectURL(blob);
      assetUrlCache.set(cacheKey, objectUrl);
      return objectUrl;
    }
  }

  for (const extension of previewExtensions) {
    const directPath = `previews/${previewBase}.${extension}`;
    const found = await probeDirectAsset(directPath);
    if (found) return found;
  }

  return null;
}

async function applyPreview(shell) {
  const previewBase = shell.dataset.previewBase;
  if (!previewBase) return;

  const previewLayer = shell.querySelector('.model-preview');
  if (!previewLayer) return;

  const previewUrl = await resolvePreviewUrl(previewBase);
  if (!previewUrl) return;

  previewLayer.style.backgroundImage = `linear-gradient(180deg, rgba(8, 6, 4, 0.08), rgba(8, 6, 4, 0.45)), url("${previewUrl}")`;
  previewLayer.hidden = false;
}

function setupViewer(container, modelPath) {
  const shell = container.closest('.model-viewer-shell') || container.parentElement;
  const loadingEl = shell.querySelector('.model-loading');
  const errorEl = shell.querySelector('.model-error');
  const placeholderEl = shell.querySelector('.model-placeholder');
  const fallbackEl = shell.querySelector('.model-viewer-fallback');

  applyPreview(shell);

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 2000);
  camera.position.set(0, 0, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0xf7ead7, 0x2b1d12, 1.4);
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  const fillLight = new THREE.DirectionalLight(0xf8d7aa, 1.2);
  const rimLight = new THREE.DirectionalLight(0xc48c5b, 1.0);
  keyLight.position.set(3, 5, 6);
  fillLight.position.set(-4, 1.5, 5);
  rimLight.position.set(-3, 3, -4);
  scene.add(ambient, keyLight, fillLight, rimLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.9;
  controls.panSpeed = 0.7;
  controls.enablePan = false;
  controls.minDistance = 0.15;
  controls.maxDistance = 30;
  controls.autoRotate = false;

  const root = new THREE.Group();
  scene.add(root);

  const state = {
    container,
    scene,
    camera,
    renderer,
    controls,
    root,
    animationId: null,
    resizeObserver: null,
    initialCameraPosition: new THREE.Vector3(),
    initialTarget: new THREE.Vector3(),
    loaded: false
  };

  function render() {
    controls.update();
    renderer.render(scene, camera);
  }

  function animate() {
    state.animationId = requestAnimationFrame(animate);
    render();
  }

  function resize() {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }

  state.resetView = () => {
    camera.position.copy(state.initialCameraPosition);
    controls.target.copy(state.initialTarget);
    controls.update();
    render();
  };

  renderer.domElement.addEventListener('dblclick', state.resetView);
  renderer.domElement.addEventListener('touchend', (event) => {
    if (event.touches.length === 0 && event.changedTouches.length === 1) {
      const now = Date.now();
      const lastTap = renderer.domElement.dataset.lastTap ? Number(renderer.domElement.dataset.lastTap) : 0;
      if (now - lastTap < 320) state.resetView();
      renderer.domElement.dataset.lastTap = now;
    }
  });

  loadingEl.hidden = false;

  (async () => {
    try {
      const resolvedModelUrl = await resolveAssetUrl(modelPath, 'models');
      const gltf = await loader.loadAsync(resolvedModelUrl);

      placeholderEl.hidden = true;
      loadingEl.hidden = true;
      if (fallbackEl) fallbackEl.hidden = true;

      const object = gltf.scene;
      root.add(object);

      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xd3b18a,
            roughness: 0.72,
            metalness: 0.08
          });
        }
      });

      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      object.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      let distance = (maxDim / 2) / Math.tan(fov / 2);
      distance *= 1.7;

      camera.position.set(distance * 0.65, distance * 0.45, distance);
      controls.target.set(0, 0, 0);
      controls.minDistance = Math.max(maxDim * 0.45, 0.1);
      controls.maxDistance = Math.max(maxDim * 8, 4);

      state.initialCameraPosition.copy(camera.position);
      state.initialTarget.copy(controls.target);
      state.loaded = true;

      resize();
      animate();
    } catch (error) {
      console.error(`No fue posible cargar el modelo ${modelPath}:`, error);
      loadingEl.hidden = true;
      errorEl.hidden = false;
    }
  })();

  state.resizeObserver = new ResizeObserver(resize);
  state.resizeObserver.observe(container);
  resize();

  return state;
}

function initVisibleViewers() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const container = entry.target;
      const modelId = container.dataset.modelId;
      if (!viewerStates.has(modelId)) {
        const state = setupViewer(container, container.dataset.modelPath);
        viewerStates.set(modelId, state);
      }
      observer.unobserve(container);
    });
  }, { rootMargin: '220px 0px' });

  document.querySelectorAll('.model-viewer').forEach((viewer) => observer.observe(viewer));
}

function openModal(modelId) {
  const model = models.find((item) => item.id === modelId);
  if (!model) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  modalViewer.innerHTML = '';
  if (modalState?.animationId) cancelAnimationFrame(modalState.animationId);
  if (modalState?.resizeObserver) modalState.resizeObserver.disconnect();

  modalState = setupViewer(modalViewer, model.file);
}

function closeModal() {
  if (modalState?.animationId) cancelAnimationFrame(modalState.animationId);
  if (modalState?.resizeObserver) modalState.resizeObserver.disconnect();
  modalViewer.innerHTML = '';
  modalState = null;
}

function setupEvents() {
  document.addEventListener('click', (event) => {
    const expandId = event.target?.dataset?.expand;
    const resetId = event.target?.dataset?.reset;

    if (expandId) openModal(expandId);
    if (resetId && viewerStates.has(resetId)) viewerStates.get(resetId).resetView();
  });

  closeModalBtn.addEventListener('click', closeModal);
  modal.querySelector('[data-close-modal]')?.addEventListener('click', closeModal);
}

setupEvents();
initVisibleViewers();
