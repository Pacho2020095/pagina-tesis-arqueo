/* ============================================================
   script.js — Lógica general del sitio
   Navegación, scroll reveal, inicialización de modelos 3D
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     CONFIGURACIÓN DE MODELOS 3D
     ========================================================== 
     Para agregar o cambiar modelos, edita este array.
     Cada objeto necesita:
       - id:          identificador único
       - file:        nombre del archivo (en la raíz del proyecto)
       - code:        código de la pieza arqueológica
       - name:        nombre descriptivo
       - description: texto breve sobre la pieza
  */
  const MODELS = [
    {
      id: 'a149',
      file: './A-149.stl',
      code: 'A-149',
      name: 'Fragmento Cerámico A-149',
      description: 'Fragmento cerámico con decoración incisa, recuperado en el sector norte de la excavación. Presenta motivos geométricos característicos del periodo formativo.'
    },
    {
      id: 'a213',
      file: './A-213.stl',
      code: 'A-213',
      name: 'Pieza Lítica A-213',
      description: 'Artefacto lítico tallado con evidencia de uso como herramienta de corte. Asociado a contextos domésticos de la ocupación principal.'
    },
    {
      id: 'cc521',
      file: './CC-521.stl',
      code: 'CC-521',
      name: 'Vasija Ceremonial CC-521',
      description: 'Recipiente cerámico de posible uso ritual. Destaca por su manufactura cuidada y la presencia de pigmentos en su superficie interior.'
    },
    {
      id: 'cc2717a',
      file: './CC-2717A.stl',
      code: 'CC-2717A',
      name: 'Ornamento CC-2717A',
      description: 'Pieza ornamental elaborada en cerámica fina. Su forma y acabado sugieren una función decorativa o de estatus dentro de la comunidad.'
    },
    {
      id: 'cc2355',
      file: './CC-2355.obj',
      code: 'CC-2355',
      name: 'Figurina Antropomorfa CC-2355',
      description: 'Figura modelada con rasgos antropomorfos. Representa una de las expresiones artísticas más destacadas de la colección excavada.'
    }
  ];

  /* ==========================================================
     DOM READY
     ========================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollReveal();
    renderModelCards();
    initModalViewer();
  });

  /* ==========================================================
     NAVBAR
     ========================================================== */
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const toggle = document.querySelector('.navbar__toggle');
    const links = document.querySelector('.navbar__links');
    const navLinks = document.querySelectorAll('.navbar__links a');

    // Scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      updateActiveLink();
    }, { passive: true });

    // Mobile toggle
    if (toggle) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
      });
    }

    // Close mobile menu on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  /* ---------- Active Link Highlighting ---------- */
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar__links a');
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  /* ==========================================================
     SCROLL REVEAL (Intersection Observer)
     ========================================================== */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  /* ==========================================================
     MODEL CARDS — Render Gallery
     ========================================================== */
  function renderModelCards() {
    const gallery = document.getElementById('models-gallery');
    if (!gallery) return;

    const fragment = document.createDocumentFragment();

    MODELS.forEach((model) => {
      const card = document.createElement('article');
      card.className = 'model-card reveal';
      card.innerHTML = `
        <div class="model-card__viewer" id="viewer-${model.id}">
          <div class="viewer-loading">
            <div class="spinner"></div>
            <span>Cargando modelo…</span>
          </div>
        </div>
        <div class="model-card__info">
          <span class="model-card__code">${model.code}</span>
          <h3 class="model-card__name">${model.name}</h3>
          <p class="model-card__desc">${model.description}</p>
          <div class="model-card__actions">
            <button class="btn-expand" data-file="${model.file}" data-title="${model.name}">
              <span>⛶</span> Ampliar
            </button>
          </div>
        </div>
      `;
      fragment.appendChild(card);
    });

    gallery.appendChild(fragment);

    // Initialize 3D viewers with a slight delay to let DOM settle
    requestAnimationFrame(() => {
      initModelViewers();
      // Re-observe newly added .reveal elements
      initScrollReveal();
    });
  }

  /* ---------- Initialize individual 3D viewers ---------- */
  function initModelViewers() {
    MODELS.forEach((model) => {
      const container = document.getElementById(`viewer-${model.id}`);
      if (!container) return;

      const loadingEl = container.querySelector('.viewer-loading');

      try {
        new Viewer3D(container, {
          filePath: model.file,
          backgroundColor: 0x332b21,
          onLoad: () => {
            if (loadingEl) loadingEl.style.display = 'none';
          },
          onError: (err) => {
            console.warn(`Error loading model ${model.code}:`, err);
            if (loadingEl) loadingEl.style.display = 'none';
            // Show elegant error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'viewer-error';
            errorDiv.innerHTML = `
              <span class="error-icon">⚠</span>
              <span>No fue posible cargar este modelo</span>
            `;
            container.appendChild(errorDiv);
          }
        });
      } catch (err) {
        console.warn(`Error initializing viewer for ${model.code}:`, err);
        if (loadingEl) loadingEl.style.display = 'none';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'viewer-error';
        errorDiv.innerHTML = `
          <span class="error-icon">⚠</span>
          <span>No fue posible cargar este modelo</span>
        `;
        container.appendChild(errorDiv);
      }
    });
  }

  /* ==========================================================
     MODAL VIEWER
     ========================================================== */
  let modalViewer = null;

  function initModalViewer() {
    modalViewer = new ModalViewer();

    // Delegate click for expand buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-expand');
      if (!btn) return;
      const file = btn.dataset.file;
      const title = btn.dataset.title;
      modalViewer.open(file, title);
    });
  }

})();
