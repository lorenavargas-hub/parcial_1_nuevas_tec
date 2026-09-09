# EProfile — Tarjeta de presentación digital

Proyecto académico de la asignatura Nuevas Tecnologías. Sitio web estático
(HTML, CSS con Bootstrap 5, y JavaScript vanilla) donde cada estudiante
tiene una EProfile pública con su información profesional, currículum,
proyectos y un código QR para compartirla.

## Por qué es un sitio estático (y no ASP.NET Core + SQLite)

La versión original de este proyecto se planteó en ASP.NET Core + SQLite
para correr desde Visual Studio. Esa arquitectura **no puede subirse a
Netlify**: Netlify solo sirve archivos estáticos y funciones serverless;
no ejecuta un backend .NET ni mantiene un archivo SQLite persistente entre
peticiones. Como la prioridad indicada fue "que se pueda subir rápido y
sencillo a Netlify", esta versión se reconstruyó como un sitio 100%
estático: HTML/CSS/JS, sin Node, sin npm, sin paso de compilación, listo
para arrastrar y soltar en Netlify o conectarlo a un repositorio de Git.

## Cómo desplegarlo en Netlify

1. Descarga y descomprime la carpeta `eprofile/`.
2. Entra a [app.netlify.com](https://app.netlify.com), sección "Deploys".
3. Arrastra la carpeta completa al recuadro de despliegue manual
   ("Deploy manually" / arrastrar y soltar).
4. Netlify publicará el sitio en segundos. No hace falta configurar
   comando de build ni carpeta de publicación (ya viene un `netlify.toml`
   por si acaso, pero no es obligatorio).
5. El archivo `_redirects` ya está incluido para que `/isabella`,
   `/isabella/admin` y `/admin` funcionen como rutas "bonitas".

También puedes probarlo en tu computadora sin subir nada: solo abre
`index.html` con doble clic, o usa la extensión "Live Server" de VS Code.

## Credenciales de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@eprofile.local | Admin123! |
| Estudiante — Isabella López | isabella.lopez@iest.edu.mx | Isabella123! |
| Estudiante — Lorena Vargas | lorena.vargas@iest.edu.mx | Lorena123! |

Estas credenciales son solo para la demostración y quedan visibles en el
código fuente (ver "Limitaciones" abajo).

## Rutas principales

- `/` — página de inicio con los perfiles de demostración
- `/login` — inicio de sesión
- `/isabella-lopez`, `/lorena-vargas` — EProfiles públicas
- `/isabella-lopez/admin` — panel del estudiante (requiere sesión propia o de administrador)
- `/admin` — panel del administrador
- `/tarjeta.html?slug=isabella-lopez` — tarjeta digital con QR
- `/escanear.html` — escaneo de QR con cámara o entrada manual

(Si abres el sitio en local sin Netlify, usa las URLs con `.html`, por
ejemplo `perfil.html?slug=isabella`, ya que las rutas bonitas dependen de
las redirecciones de Netlify.)

## Qué se implementó

- EProfile pública que oculta automáticamente las secciones vacías.
- Panel del estudiante con edición de información personal, formación,
  experiencia, proyectos, habilidades y reconocimientos (alta, edición y
  eliminación de cada elemento).
- Estados de perfil (Vacío / Borrador / Publicado), con "Guardar borrador",
  "Previsualizar" (ve los cambios sin publicarlos) y "Publicar" (valida que
  exista al menos nombre y carrera).
- Panel del administrador: listado con búsqueda y filtros, crear cuentas,
  desactivar/reactivar/eliminar, reiniciar contraseña, entrar a administrar
  cualquier perfil, respaldo y restauración de datos en JSON.
- Aislamiento de acceso: un estudiante no puede abrir el panel de otro
  (se le redirige a una pantalla de acceso denegado).
- Código QR generado localmente en JavaScript (algoritmo QR estándar
  implementado desde cero, sin librerías ni servicios externos) que apunta
  siempre a la URL pública del slug.
- Tarjeta digital imprimible con el QR y los datos básicos.
- Descarga de contacto en formato vCard (.vcf), generado dinámicamente.
- CV visible dentro de la EProfile y "descarga en PDF" mediante la función
  de impresión del navegador (el usuario elige "Guardar como PDF" en el
  diálogo de impresión). Se probó y produce un documento limpio.
- Tres plantillas visuales de CV (clásica, moderna, minimalista)
  seleccionables por el estudiante.
- Escaneo de QR con la cámara usando la API `BarcodeDetector` del
  navegador, con alternativa manual (escribir el usuario) cuando el
  navegador no la soporta o no hay cámara disponible.
- Diseño responsive con Bootstrap 5, con un layout de sidebar y tarjetas
  y una paleta morada, tomando como referencia visual el diseño que se
  compartió para el proyecto.
- Mensajes de error naturales, confirmaciones antes de acciones
  destructivas y notificaciones tipo toast.
- Datos reales de dos estudiantes (Isabella López y Lorena Vargas),
  ambos con su perfil publicado, para que la demo se vea con contenido
  real desde el primer momento.

## Limitaciones reales (léelas antes de la entrega)

Estas limitaciones existen **porque el sitio no tiene backend**, que es el
costo de que se pueda subir a Netlify sin instalar nada. Si el profesor
pide una app con backend real, la alternativa funcional más cercana es la
versión en ASP.NET Core + SQLite (arquitectura descrita al inicio de este
documento), corriendo en un servicio que sí soporte .NET, como Render,
Railway o Azure App Service.

1. **Persistencia por navegador, no en un servidor.** Todos los datos
   (perfiles, cuentas nuevas, publicaciones) se guardan en el
   `localStorage` del navegador que estés usando. Si abres el sitio desde
   otro dispositivo o navegador verás siempre los datos de demostración
   originales, no tus cambios. Esto significa que el criterio de aceptación
   "los cambios publicados se pueden ver desde otro dispositivo" **no se
   cumple** en esta versión; sí funciona correctamente dentro del mismo
   navegador (recarga la página, cierra sesión y vuelve a entrar, y los
   cambios siguen ahí).
2. **No hay seguridad real.** El "login" es una simulación en JavaScript
   para que la demostración se sienta como un sistema con roles;
   cualquiera que abra las herramientas de desarrollador del navegador
   puede ver las contraseñas de demo o alterar la sesión. No debe usarse
   con datos reales ni contraseñas reales.
3. **El PDF se genera con la función de impresión del navegador**, no con
   una librería de generación de PDF. Es una técnica común y válida en
   sitios estáticos, pero el resultado depende del navegador del usuario.
4. El escaneo por cámara depende de que el navegador soporte
   `BarcodeDetector` (funciona en Chrome/Edge de escritorio y Android; no
   está disponible en Safari/iOS). Por eso siempre está disponible la
   alternativa manual, como pide el proyecto.
5. Por simplicidad se unificó la sección de "Enlaces" dentro de la
   información personal (LinkedIn, GitHub, correo, teléfono) en lugar de
   un CRUD de enlaces genérico aparte.

## Pruebas realizadas

- Login correcto e incorrecto, con cuentas activas e inactivas.
- Edición de perfil, guardar borrador, previsualizar (con banner de aviso)
  y publicar, incluyendo el mensaje de validación cuando falta nombre o
  carrera.
- Intento de un estudiante de entrar al panel de otro estudiante:
  redirige correctamente a la pantalla de acceso denegado.
- Alta, desactivación, reactivación, reinicio de contraseña y eliminación
  de estudiantes desde el panel de administrador.
- Un perfil despublicado o con cuenta desactivada deja de verse
  públicamente (se muestra la página 404).
- Generación de código QR verificada de forma independiente: las imágenes
  generadas por el algoritmo se probaron con un lector de códigos QR real
  (fuera del navegador) para confirmar que son válidas y escaneables, no
  solo que "se ven" como un QR.
- Descarga de vCard y verificación del contenido generado.
- Backup y restauración de datos en JSON.
- Responsive revisado en anchos de escritorio y móvil.

## Estructura del proyecto

```
eprofile/
├── index.html
├── login.html
├── panel.html
├── admin.html
├── perfil.html
├── tarjeta.html
├── escanear.html
├── 404.html
├── acceso-denegado.html
├── _redirects
├── netlify.toml
├── css/
│   └── estilos.css
└── js/
    ├── datos.js       (datos semilla + capa de "base de datos" en localStorage)
    ├── auth.js        (sesión simulada)
    ├── panel.js        (panel del estudiante)
    ├── admin.js        (panel del administrador)
    ├── perfil.js       (renderizado de la EProfile pública)
    ├── tarjeta.js       (tarjeta digital)
    ├── escanear.js      (escaneo de QR)
    ├── vcard.js         (generación de vCard)
    └── qrcode.js        (generador de QR local, sin dependencias)
```
