/*
 * perfil.js — Arma la EProfile pública en el layout de sidebar + tarjetas.
 * Reglas que sigue: nunca mostrar borradores, nunca mostrar secciones
 * vacías, y respetar el estado de la cuenta (activa/inactiva).
 */

function formatoFecha(iso) {
  if (!iso) return '';
  const [anio, mes] = iso.split('-');
  if (!mes) return iso;
  return `${mes}/${anio}`;
}

function iniciarPerfilPublico() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const modoPreview = params.get('preview') === '1';

  if (!slug) { window.location.href = '404.html'; return; }

  const estudiante = buscarEstudiantePorSlug(slug);
  if (!estudiante) { window.location.href = '404.html'; return; }

  let perfil, plantillaCV;

  if (modoPreview) {
    const sesion = exigirPropietarioOAdmin(estudiante.id);
    if (!sesion) return;
    const db = leerDB();
    const registro = db.perfiles[estudiante.id];
    perfil = registro.borrador;
    plantillaCV = registro.plantillaCV;
    const banner = document.createElement('div');
    banner.className = 'alert alert-warning rounded-0 text-center mb-0 no-imprimir';
    banner.textContent = 'Vista previa (borrador, no visible para el público)';
    document.body.prepend(banner);
  } else {
    const visible = perfilPublicoVisible(estudiante.id);
    if (!visible) { window.location.href = '404.html'; return; }
    perfil = visible.registro.publicado;
    plantillaCV = visible.registro.plantillaCV;
  }

  document.title = `${perfil.nombre || 'EProfile'} — EProfile`;
  renderPerfil(perfil, slug, plantillaCV);
}

function renderPerfil(perfil, slug, plantillaCV) {
  renderSidebar(perfil);
  renderTarjetaPerfil(perfil, slug);
  renderCV(perfil, plantillaCV);
  renderProyectos(perfil);
  renderColumnaLateral(perfil, slug);

  const btnVcard = document.getElementById('btn-vcard');
  if (btnVcard) btnVcard.addEventListener('click', () => descargarVCard(perfil, slug));
}

function renderSidebar(perfil) {
  document.getElementById('sidebar-nombre').textContent = perfil.nombre || 'EProfile';
  document.getElementById('sidebar-carrera').textContent = perfil.carrera || '';
}

function renderTarjetaPerfil(perfil, slug) {
  const cont = document.getElementById('tarjeta-perfil');
  const fotoHtml = perfil.foto
    ? `<img src="${perfil.foto}" class="eprofile-foto" alt="Foto de ${escapar(perfil.nombre)}">`
    : `<div class="eprofile-foto-vacia">${(perfil.nombre || '?').charAt(0)}</div>`;

  const iconos = [];
  if (perfil.linkedin) iconos.push(`<a href="${escapar(perfil.linkedin)}" target="_blank" rel="noopener" class="icono-contacto" title="LinkedIn">in</a>`);
  if (perfil.github) iconos.push(`<a href="${escapar(perfil.github)}" target="_blank" rel="noopener" class="icono-contacto" title="GitHub">gh</a>`);
  if (perfil.correo) iconos.push(`<a href="mailto:${escapar(perfil.correo)}" class="icono-contacto" title="Correo">@</a>`);
  if (perfil.telefono) iconos.push(`<a href="tel:${escapar(perfil.telefono)}" class="icono-contacto" title="Llamar">☎</a>`);

  cont.innerHTML = `
    <div class="d-flex flex-wrap align-items-center gap-4">
      ${fotoHtml}
      <div class="flex-grow-1">
        <h1 class="h4 mb-1">${escapar(perfil.nombre)}</h1>
        <p class="text-muted mb-2">${escapar(perfil.carrera)}</p>
        <div class="d-flex gap-2">${iconos.join('')}</div>
      </div>
      <div class="d-flex flex-column gap-2 no-imprimir">
        <button class="btn btn-outline-primary btn-sm" onclick="window.print()">Descargar / imprimir CV (PDF)</button>
        <button class="btn btn-outline-primary btn-sm" id="btn-vcard">Guardar contacto</button>
        <a class="btn btn-outline-secondary btn-sm" href="tarjeta.html?slug=${encodeURIComponent(slug)}">Ver tarjeta y QR</a>
      </div>
    </div>
    ${perfil.resena ? `<p class="mt-3 mb-0">${escapar(perfil.resena)}</p>` : ''}
  `;
}

function renderCV(perfil, plantillaCV) {
  const cont = document.getElementById('tarjeta-cv');
  const hayCV = (perfil.educacion && perfil.educacion.length) || (perfil.experiencia && perfil.experiencia.length);
  if (!hayCV) { cont.classList.add('d-none'); return; }

  cont.innerHTML = `
    <h2 class="h6 text-uppercase text-muted mb-3">Currículum</h2>
    <div class="contenido-imprimible cv-${plantillaCV || 'clasica'}">
      ${perfil.educacion && perfil.educacion.length ? `
        <h3 class="h6 mt-2">Formación académica</h3>
        ${perfil.educacion.map((ed) => `
          <div class="mb-3">
            <div class="fw-semibold">${escapar(ed.carrera)} — ${escapar(ed.institucion)}</div>
            <div class="text-muted small">${formatoFecha(ed.inicio)} – ${ed.fin ? formatoFecha(ed.fin) : 'Actualidad'}</div>
            ${ed.descripcion ? `<div class="small">${escapar(ed.descripcion)}</div>` : ''}
          </div>`).join('')}
      ` : ''}
      ${perfil.experiencia && perfil.experiencia.length ? `
        <h3 class="h6 mt-3">Experiencia</h3>
        ${perfil.experiencia.map((ex) => `
          <div class="mb-3">
            <div class="fw-semibold">${escapar(ex.puesto)} — ${escapar(ex.empresa)}</div>
            ${(ex.inicio || ex.fin) ? `<div class="text-muted small">${formatoFecha(ex.inicio)} – ${ex.fin ? formatoFecha(ex.fin) : 'Actualidad'}</div>` : ''}
            ${ex.descripcion ? `<div class="small">${escapar(ex.descripcion)}</div>` : ''}
          </div>`).join('')}
      ` : ''}
    </div>
  `;
}

function renderProyectos(perfil) {
  const cont = document.getElementById('tarjeta-proyectos');
  if (!perfil.proyectos || !perfil.proyectos.length) { cont.classList.add('d-none'); return; }

  cont.innerHTML = `
    <h2 class="h6 text-uppercase text-muted mb-3">Proyectos</h2>
    <div class="linea-tiempo">
      ${perfil.proyectos.map((p) => `
        <div class="item-tiempo">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <h3 class="h6 mb-1">${escapar(p.nombre)}</h3>
            ${p.academico ? '<span class="etiqueta-academico">Proyecto académico</span>' : ''}
          </div>
          <p class="small mb-2">${escapar(p.descripcion)}</p>
          ${p.tecnologias ? `<p class="small text-muted mb-1"><strong>Tecnologías:</strong> ${escapar(p.tecnologias)}</p>` : ''}
          ${p.rol ? `<p class="small text-muted mb-2"><strong>Rol:</strong> ${escapar(p.rol)}</p>` : ''}
          <div class="d-flex gap-2">
            ${p.url ? `<a href="${escapar(p.url)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary">Ver proyecto</a>` : ''}
            ${p.repo ? `<a href="${escapar(p.repo)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary">GitHub</a>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderColumnaLateral(perfil, slug) {
  const cont = document.getElementById('columna-lateral');
  const bloques = [];

  if (perfil.habilidades && perfil.habilidades.length) {
    const porCategoria = agrupar(perfil.habilidades, 'categoria');
    bloques.push(`
      <div class="tarjeta-simple p-4 mb-4">
        <h2 class="h6 text-uppercase text-muted mb-3">Habilidades</h2>
        ${Object.entries(porCategoria).map(([cat, items]) => `
          <div class="mb-2">
            <div class="text-muted small mb-1">${escapar(cat)}</div>
            ${items.map((h) => `<span class="badge text-bg-light border me-1 mb-1">${escapar(h.nombre)}</span>`).join('')}
          </div>
        `).join('')}
      </div>
    `);
  }

  if (perfil.reconocimientos && perfil.reconocimientos.length) {
    bloques.push(`
      <div class="tarjeta-simple p-4 mb-4">
        <h2 class="h6 text-uppercase text-muted mb-3">Reconocimientos</h2>
        ${perfil.reconocimientos.map((r) => `
          <div class="mb-2">
            <div class="fw-semibold small">${escapar(r.nombre)}</div>
            <div class="text-muted small">${escapar(r.institucion)} · ${formatoFecha(r.fecha)}</div>
            ${r.descripcion ? `<div class="small">${escapar(r.descripcion)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `);
  }

  bloques.push(`
    <div class="tarjeta-simple p-4 text-center no-imprimir">
      <h2 class="h6 text-uppercase text-muted mb-3">Comparte este perfil</h2>
      <canvas id="mini-qr" class="mb-2"></canvas>
      <a href="tarjeta.html?slug=${encodeURIComponent(slug)}" class="btn btn-outline-primary btn-sm w-100">Ver tarjeta completa</a>
    </div>
  `);

  cont.innerHTML = bloques.join('');

  const canvas = document.getElementById('mini-qr');
  if (canvas) {
    const qr = QR.generar(urlPublicaDe(slug));
    QR.dibujarEnCanvas(canvas, qr, { escala: 4, margen: 2 });
  }
}

function agrupar(lista, campo) {
  return lista.reduce((acc, item) => {
    const clave = item[campo] || 'Otras';
    acc[clave] = acc[clave] || [];
    acc[clave].push(item);
    return acc;
  }, {});
}

function escapar(texto) {
  if (!texto) return '';
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
