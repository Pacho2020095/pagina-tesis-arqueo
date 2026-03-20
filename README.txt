Sitio web de tesis de arqueología - Nathalia Torres
===================================================

Este paquete contiene una página web lista para mostrar una tesis de arqueología con modelos 3D interactivos.

ARCHIVOS PRINCIPALES
- index.html
- styles.css
- script.js

MODO DE PUBLICACIÓN EN GITHUB PAGES
1. Sube al repositorio estos archivos en la misma carpeta:
   - index.html
   - styles.css
   - script.js
   - models.zip
   - previews.zip (opcional)

2. El archivo models.zip debe contener los modelos 3D y puede estar armado de cualquiera de estas formas:
   - models/A-149.glb
   - models/A-213.glb
   - models/CC-521.glb
   - models/CC-2717A.glb
   - models/CC-2355.glb

   o también puede contener directamente los .glb en la raíz del zip. El código ya intenta encontrar ambas variantes.

3. El archivo previews.zip es opcional. Si lo subes, debe contener imágenes con el mismo nombre base de cada ficha, por ejemplo:
   - previews/A-149.png
   - previews/A-213.jpg
   - previews/CC-521.webp

   También funciona si las imágenes quedan en la raíz del zip. Extensiones soportadas:
   png, jpg, jpeg, webp, avif.

4. Si en vez de zip prefieres usar carpetas normales, el código también sigue funcionando con:
   - /models/*.glb
   - /previews/*.(png|jpg|jpeg|webp|avif)

IMPORTANTE
- La página fue ajustada para que NO dependa exclusivamente de carpetas descomprimidas.
- Primero intentará cargar desde models.zip y previews.zip.
- Si no existen esos zip, caerá automáticamente a las carpetas normales.

EJECUCIÓN LOCAL
Abre la carpeta con un servidor local. Por ejemplo:

python -m http.server 8000

Luego entra desde el navegador a:
http://localhost:8000

PERSONALIZACIÓN
- Edita textos y secciones en index.html.
- Edita colores, tipografías y espaciados en styles.css.
- Edita el arreglo "models" en script.js si agregas más fichas arqueológicas.
