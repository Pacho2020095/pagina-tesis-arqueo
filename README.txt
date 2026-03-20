================================================================
  ARQUEOLOGÍA DIGITAL — Página Web de Tesis
  README — Instrucciones de uso
================================================================

DESCRIPCIÓN
-----------
Esta carpeta contiene un sitio web estático para presentar un
proyecto de grado en arqueología digital. Incluye un visor 3D
interactivo que permite explorar piezas arqueológicas digitalizadas
directamente desde el navegador.

Autora: Nathalia Torres


ARCHIVOS INCLUIDOS
------------------
  index.html       Página principal del sitio
  styles.css       Hoja de estilos
  script.js        Lógica general del sitio (navegación, galería)
  viewer3d.js      Módulo del visor 3D (Three.js)
  README.txt       Este archivo

  A-149.stl        Modelo 3D — Fragmento Cerámico A-149
  A-213.stl        Modelo 3D — Pieza Lítica A-213
  CC-521.stl       Modelo 3D — Vasija Ceremonial CC-521
  CC-2717A.stl     Modelo 3D — Ornamento CC-2717A
  CC-2355.obj      Modelo 3D — Figurina Antropomorfa CC-2355


================================================================
  CÓMO ABRIR LOCALMENTE
================================================================

IMPORTANTE: Los visores 3D requieren que los archivos se sirvan
desde un servidor web local. Abrir index.html directamente desde
el explorador de archivos (file://) puede provocar que los
modelos no carguen por restricciones de seguridad (CORS).

Opciones para servidor local:

  1. Visual Studio Code + Live Server
     - Instala la extensión "Live Server" en VS Code
     - Abre la carpeta pagina-tesis en VS Code
     - Clic derecho en index.html > "Open with Live Server"

  2. Python (si lo tienes instalado)
     - Abre una terminal en la carpeta del proyecto
     - Ejecuta:
         python -m http.server 8000
     - Abre http://localhost:8000 en tu navegador

  3. Node.js (si lo tienes instalado)
     - Instala npx (viene con Node.js)
     - Ejecuta:
         npx serve .
     - Abre la URL que te indique la terminal


================================================================
  CÓMO DESPLEGAR EN GITHUB PAGES
================================================================

  1. Sube la carpeta pagina-tesis como un repositorio en GitHub
  2. Ve a Settings > Pages
  3. En "Source" selecciona la rama "main" y carpeta "/ (root)"
  4. Espera unos minutos y tu sitio estará en:
       https://tu-usuario.github.io/nombre-repositorio/


================================================================
  CÓMO DESPLEGAR EN VERCEL
================================================================

  1. Sube la carpeta a un repositorio en GitHub
  2. Entra a vercel.com e importa el repositorio
  3. En "Framework Preset" selecciona "Other"
  4. Haz deploy. No se requiere configuración adicional.

  Alternativa rápida:
    - Instala Vercel CLI: npm i -g vercel
    - En la carpeta del proyecto ejecuta: vercel
    - Sigue las instrucciones en pantalla


================================================================
  CÓMO EDITAR TEXTOS
================================================================

Todos los textos del sitio están en index.html. Busca las
secciones identificadas con comentarios HTML como:
  <!-- HERO — PORTADA -->
  <!-- PROYECTO -->
  <!-- METODOLOGÍA -->
  <!-- MODELOS 3D -->
  <!-- AUTORA -->

Edita directamente el contenido de las etiquetas HTML.
No necesitas compilar nada: solo guarda y recarga el navegador.


================================================================
  CÓMO AGREGAR O CAMBIAR MODELOS 3D
================================================================

  1. Coloca el nuevo archivo .stl, .obj o .glb en la RAÍZ de la
     carpeta (junto a index.html, no en subcarpetas).

  2. Abre el archivo script.js

  3. Busca el array MODELS al inicio del archivo.
     Cada entrada tiene esta estructura:

       {
         id:          'mi-pieza',
         file:        './MI-PIEZA.stl',
         code:        'MI-PIEZA',
         name:        'Nombre descriptivo',
         description: 'Descripción breve de la pieza.'
       }

  4. Agrega una nueva entrada al array o modifica las existentes.

  5. Guarda y recarga el navegador.


================================================================
  CÓMO AGREGAR PREVIEWS OPCIONALES (imágenes)
================================================================

El sistema funciona perfectamente sin imágenes preview. Si deseas
agregar imágenes de referencia:

  1. Coloca la imagen en la raíz con el mismo nombre base que el
     modelo, pero con extensión .png
     Ejemplo: A-149.png para A-149.stl

  2. Estas imágenes son opcionales y actualmente el sistema
     no las carga automáticamente, pero puedes integrarlas
     editando las tarjetas en script.js si lo deseas.


================================================================
  FORMATOS SOPORTADOS
================================================================

  .stl   — STL (Standard Tessellation Language)
  .obj   — Wavefront OBJ
  .glb   — glTF Binary (compatible si se necesita)


================================================================
  REQUISITOS DEL NAVEGADOR
================================================================

Cualquier navegador moderno con soporte para WebGL:
  - Google Chrome (recomendado)
  - Mozilla Firefox
  - Microsoft Edge
  - Safari (iOS/macOS)

Se recomienda una conexión a internet para cargar las librerías
Three.js desde CDN la primera vez.


================================================================
  CRÉDITOS Y TECNOLOGÍAS
================================================================

  - Three.js (r160) — Librería 3D para web
    https://threejs.org/

  - Google Fonts — Cormorant Garamond e Inter
    https://fonts.google.com/

  - Diseño y desarrollo del visor interactivo para el
    proyecto de grado de Nathalia Torres.

================================================================
