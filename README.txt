PÁGINA WEB - TESIS DE ARQUEOLOGÍA
================================

Autora mostrada en la página: Nathalia Torres

Archivos principales:
- index.html
- styles.css
- script.js
- carpeta /models con los archivos 3D en formato .glb

IMPORTANTE
----------
Para que los modelos 3D carguen correctamente, abre la página con un servidor local.
No se recomienda abrir index.html directamente con doble clic porque muchos navegadores
bloquean la carga de modelos 3D cuando se usa la ruta file://

Opciones simples:
1. VS Code + extensión "Live Server"
2. En una terminal dentro de esta carpeta:
   python -m http.server 8000
   Luego abrir: http://localhost:8000

PERSONALIZACIÓN RÁPIDA
----------------------
- El texto principal está en index.html
- Los colores y estilos están en styles.css
- La lógica de la galería 3D está en script.js
- La lista de modelos está al inicio de script.js

NOTA TÉCNICA
------------
Los archivos originales subidos (.stl y .obj) fueron convertidos a .glb para mejorar el
rendimiento en web y facilitar una experiencia más fluida en computador y celular.
