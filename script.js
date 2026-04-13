/* ============================================================
   script.js — Lógica general del sitio
   Navegación, scroll reveal, render de fichas y visor 3D
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     CONFIGURACIÓN DE MODELOS 3D Y FICHAS ARQUEOLÓGICAS
     Nota: la correspondencia entre los archivos 3D entregados
     y las fichas del PDF fue organizada para que cada modelo
     muestre la información descriptiva correspondiente.
     ========================================================== */
  const MODELS = [
    {
      id: 'a149',
      file: './A-149.stl',
      archiveCode: 'A-149',
      catalogCode: 'ZAcbo58',
      name: 'Barril de doble asa',
      shortDescription: 'Pieza cerámica asociada al periodo Muisca, procedente de Bogotá, con dos asas superiores y un cuerpo compacto de perfil rectangular.',
      geographicArea: 'Zona Andina',
      geographicSubregion: 'Altiplano Cundiboyacense',
      department: 'Cundinamarca',
      municipality: 'Bogotá',
      archaeologicalSite: 'Candelaria la nueva',
      period: 'Muisca',
      collection: 'ICANH',
      chronologyLabel: 'Cronología',
      maxDate: '200',
      minDate: '1600',
      era: 'D.C',
      observations: '',
      bibliography: 'Cifuentes, Arturo y Leonardo Moreno (1987) Proyecto de rescate arqueológico de la avenida de Villavicencio, Barrio Candelaria la Nueva. Proyecto de rescate Arqueológico. ICANH ARQ 0136. Cifuentes, Arturo y Leonardo Moreno (1987) Proyecto de rescate arqueológico de la avenida de Villavicencio, Barrio Candelaria la Nueva. Proyecto de rescate Arqueológico. ICANH ARQ 0137.',
      sketchfab: 'https://skfb.ly/pHW7G'
    },
    {
      id: 'a213',
      file: './A-213.stl',
      archiveCode: 'A-213',
      catalogCode: 'ZAcau020',
      name: 'Alcarraza con figura zoomorfa con asa de puente, doble vertedera',
      shortDescription: 'Recipiente de tradición Yotoco con representación zoomorfa, asa de puente y doble vertedera, hallado en el Valle del Cauca.',
      geographicArea: 'Zona Andina',
      geographicSubregion: 'Valle del Cauca',
      department: 'Valle del Cauca',
      municipality: 'Restrepo',
      archaeologicalSite: '—',
      period: 'Yotoco',
      collection: 'ICANH',
      chronologyLabel: 'Cronología Yotoco',
      maxDate: '—',
      minDate: '800',
      era: 'D.C',
      observations: '',
      bibliography: 'Bray, W.; Herrera, L.; Cardale, M. (1983). Los sucesos de Malagana vistos desde Calima. Atando cabos en la arqueología del suroccidente colombiano. ICANH - Fundación Pro Calima. Bray, W. (1962). Investigaciones Arqueológicas en el Valle Calima: Informe preliminar. Revista Colombiana de Antropología, Vol. 11. Cubillos, J. (2015). Cultura Yotoco-Malagana. En: Patrimonio arqueológico de la Universidad del Valle, pp. 60-79. Pineda, R. (1945). Material arqueológico de la zona Calima. Boletín de Arqueología, Ministerio de Educación Colombiano.',
      sketchfab: 'https://skfb.ly/pHWnT'
    },
    {
      id: 'cc521',
      file: './CC-521.stl',
      archiveCode: 'CC-521',
      catalogCode: 'CCgua6',
      name: 'Figurilla sonajera zoomorfa',
      shortDescription: 'Figurina sonajera procedente de El Palmar, en la península de La Guajira, vinculada al periodo Horno.',
      geographicArea: 'Costa Caribe',
      geographicSubregion: 'Península de La Guajira',
      department: 'La Guajira',
      municipality: 'Barrancas',
      archaeologicalSite: 'El Palmar',
      period: 'Horno',
      collection: 'ICANH',
      chronologyLabel: 'Cronología',
      maxDate: '450',
      minDate: '700',
      era: 'A.C., D.C',
      observations: 'La figurina es un sonajero.',
      bibliography: 'Ardila, Gerardo. 1982. “Arqueología”. En: Estudio de efecto ambiental de la explotación inicial de carbón en la zona central de El Cerrejón. Carbocol. Ardila, Gerardo. 1996. Los tiempos de las conchas: investigaciones arqueológicas en la costa de la península de La Guajira. Bogotá, Editorial Universidad Nacional. Ardila, Gerardo. 1983. Proyecto carbonífero de El Cerrejón, Zona Norte: arqueología de rescate, área de El Palmar, informe técnico. Bogotá, Asociación Carbocol - Intercor.',
      sketchfab: 'https://skfb.ly/pHDCp'
    },
    {
      id: 'cc2717a',
      file: './CC-2717A.stl',
      archiveCode: 'CC-2717A',
      catalogCode: 'CCsie03',
      name: 'Cuenco bicónica aquillada / Copa bicónica aquillada',
      shortDescription: 'Pieza cerámica Tairona con soporte cilíndrico, registrada en Gairaca, dentro de la Sierra Nevada de Santa Marta.',
      geographicArea: 'Costa Caribe',
      geographicSubregion: 'Sierra Nevada de Santa Marta',
      department: 'Magdalena',
      municipality: 'Santa Marta',
      archaeologicalSite: 'Gairaca',
      period: 'Tairona Black Slip; Tairona Fine Burnished',
      collection: 'ICANH',
      chronologyLabel: 'Cronología',
      maxDate: '1200',
      minDate: '1600',
      era: 'D.C',
      observations: 'Copa bicónica aquillada con soporte cilíndrico.',
      bibliography: 'Lleras, Roberto. Informe sobre exploraciones y excavaciones arqueológicas en la Sierra Nevada de Santa Marta - Ciudad Perdida. Bogotá: ICAN, 1986. Soto Rodríguez, L. (2020). Organización de la producción cerámica prehispánica en la microcuenca El Congo, municipio de Ciénaga, Santa Marta. Universidad Externado de Colombia. Giraldo, S. (2010). Lords of the Snowy Ranges: Politics, Place, and Landscape. Transformation in two Tairona Towns in the Sierra Nevada de Santa Marta, Colombia. Tesis de Doctorado. Universidad de Chicago, Chicago.',
      sketchfab: 'https://skfb.ly/pHVZo'
    },
    {
      id: 'cc2355',
      file: './CC-2355.obj',
      archiveCode: 'CC-2355',
      catalogCode: 'CCsie066',
      name: 'Instrumento musical con cuerpo zoomorfo modelado',
      shortDescription: 'Instrumento musical con labio plano, borde modelado, incisiones, perforaciones y base plana, adscrito a contextos Tairona.',
      geographicArea: 'Costa Caribe',
      geographicSubregion: 'Sierra Nevada de Santa Marta',
      department: 'Magdalena',
      municipality: 'Santa Marta',
      archaeologicalSite: '—',
      period: 'Tairona Coarse Red-Orange',
      collection: 'ICANH',
      chronologyLabel: 'Cronología Tairona',
      maxDate: '1600',
      minDate: '1200',
      era: 'D.C',
      observations: '',
      bibliography: 'Soto Rodríguez, L. (2020). Organización de la producción cerámica prehispánica en la microcuenca El Congo, municipio de Ciénaga, Santa Marta. Universidad Externado de Colombia. Giraldo, S. (2010). Lords of the Snowy Ranges: Politics, Place, and Landscape. Transformation in two Tairona Towns in the Sierra Nevada de Santa Marta, Colombia. Tesis de Doctorado. Universidad de Chicago, Chicago. Herrera, L. (1973). Informe No. 2 de la comisión arqueológica en la Sierra Nevada de Santa Marta. En: Proyecto de reconocimiento y ubicación de sitios arqueológicos en el área Tairona, Sierra Nevada de Santa Martha. Informe, sin publicar.',
      sketchfab: 'https://skfb.ly/pHVZR'
    }
  ];

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollReveal();
    renderModelCards();
    initModalViewer();
  });

  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const toggle = document.querySelector('.navbar__toggle');
    const links = document.querySelector('.navbar__links');
    const navLinks = document.querySelectorAll('.navbar__links a');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
      updateActiveLink();
    }, { passive: true });

    if (toggle) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
      });
    }

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (toggle) toggle.classList.remove('open');
        if (links) links.classList.remove('open');
      });
    });
  }

  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar__links a');
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) current = section.getAttribute('id');
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  }

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

    revealElements.forEach(el => {
      if (!el.classList.contains('visible')) observer.observe(el);
    });
  }

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
          <div class="model-card__header-row">
            <span class="model-card__code">Archivo 3D: ${escapeHtml(model.archiveCode)}</span>
            <span class="model-card__catalog">Código ICANH: ${escapeHtml(model.catalogCode)}</span>
          </div>

          <h3 class="model-card__name">${escapeHtml(model.name)}</h3>
          <p class="model-card__desc">${escapeHtml(model.shortDescription)}</p>

          <div class="model-card__meta-grid">
            ${renderMetaItem('Área geográfica', model.geographicArea)}
            ${renderMetaItem('Subregión geográfica', model.geographicSubregion)}
            ${renderMetaItem('Departamento', model.department)}
            ${renderMetaItem('Municipio del hallazgo', model.municipality)}
            ${renderMetaItem('Sitio arqueológico', model.archaeologicalSite)}
            ${renderMetaItem('Periodo', model.period)}
            ${renderMetaItem('Colección', model.collection)}
          </div>

          <div class="model-card__chronology">
            <div class="model-card__chronology-title">${escapeHtml(model.chronologyLabel)}</div>
            <div class="model-card__chronology-grid">
              ${renderChronologyItem('Fecha máxima', model.maxDate)}
              ${renderChronologyItem('Fecha mínima', model.minDate)}
              ${renderChronologyItem('Referencia temporal', model.era)}
            </div>
          </div>

          ${model.observations ? `
            <div class="model-card__note">
              <span class="model-card__note-label">Observaciones</span>
              <p>${escapeHtml(model.observations)}</p>
            </div>
          ` : ''}

          <details class="model-card__biblio">
            <summary>Bibliografía asociada</summary>
            <p>${escapeHtml(model.bibliography)}</p>
          </details>

          <div class="model-card__actions">
            <button class="btn-expand" data-file="${escapeHtml(model.file)}" data-title="${escapeHtml(model.name)}">
              <span>⛶</span> Ampliar
            </button>
            ${model.sketchfab ? `<a class="btn-link" href="${escapeAttribute(model.sketchfab)}" target="_blank" rel="noopener noreferrer">Sketchfab ↗</a>` : ''}
          </div>
        </div>
      `;
      fragment.appendChild(card);
    });

    gallery.innerHTML = '';
    gallery.appendChild(fragment);

    requestAnimationFrame(() => {
      initModelViewers();
      initScrollReveal();
    });
  }

  function renderMetaItem(label, value) {
    return `
      <div class="model-meta-item">
        <span class="model-meta-item__label">${escapeHtml(label)}</span>
        <strong class="model-meta-item__value">${escapeHtml(value || '—')}</strong>
      </div>
    `;
  }

  function renderChronologyItem(label, value) {
    return `
      <div class="model-chrono-item">
        <span class="model-chrono-item__label">${escapeHtml(label)}</span>
        <strong class="model-chrono-item__value">${escapeHtml(value || '—')}</strong>
      </div>
    `;
  }

  function initModelViewers() {
    MODELS.forEach((model) => {
      const container = document.getElementById(`viewer-${model.id}`);
      if (!container) return;

      const loadingEl = container.querySelector('.viewer-loading');

      try {
        new Viewer3D(container, {
          filePath: model.file,
          backgroundColor: 0x2a2118,
          onLoad: () => {
            if (loadingEl) loadingEl.style.display = 'none';
          },
          onError: (err) => {
            console.warn(`Error loading model ${model.archiveCode}:`, err);
            if (loadingEl) loadingEl.style.display = 'none';
            if (!container.querySelector('.viewer-error')) {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'viewer-error';
              errorDiv.innerHTML = `
                <span class="error-icon">⚠</span>
                <span>No fue posible cargar este modelo</span>
              `;
              container.appendChild(errorDiv);
            }
          }
        });
      } catch (err) {
        console.warn(`Error initializing viewer for ${model.archiveCode}:`, err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (!container.querySelector('.viewer-error')) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'viewer-error';
          errorDiv.innerHTML = `
            <span class="error-icon">⚠</span>
            <span>No fue posible cargar este modelo</span>
          `;
          container.appendChild(errorDiv);
        }
      }
    });
  }

  let modalViewer = null;

  function initModalViewer() {
    modalViewer = new ModalViewer();

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-expand');
      if (!btn) return;
      const file = btn.dataset.file;
      const title = btn.dataset.title;
      modalViewer.open(file, title);
    });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
