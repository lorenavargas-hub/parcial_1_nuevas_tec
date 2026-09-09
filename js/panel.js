/*
 * panel.js — Panel del estudiante (y del administrador cuando entra a
 * "administrar perfil"). Todo lo que se edita aquí vive en `estadoEdicion`,
 * una copia de trabajo del borrador; "Guardar borrador" la persiste en
 * localStorage, y "Publicar" la copia al snapshot público.
 */

let ESTUDIANTE_ACTUAL = null;
let ESTADO_EDICION = null;
let ES_ADMIN_ADMINISTRANDO = false;

function iniciarPanel() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) { window.location.href = '404.html'; return; }

  const estudiante = buscarEstudiantePorSlug(slug);
  if (!estudiante) { window.location.href = '404.html'; return; }

  const sesion = exigirPropietarioOAdmin(estudiante.id);
  if (!sesion) return;

  ESTUDIANTE_ACTUAL = estudiante;
  ES_ADMIN_ADMINISTRANDO = sesion.rol === 'admin';

  const db = leerDB();
  ESTADO_EDICION = JSON.parse(JSON.stringify(db.perfiles[estudiante.id].borrador));

  if (ES_ADMIN_ADMINISTRANDO) {
    document.getElementById('aviso-admin').classList.remove('d-none');
  }

  document.getElementById('nombre-slug').textContent = '/' + slug;
  renderDashboard();
  renderFormularioPersonal();
  renderListaEditable('educacion');
  renderListaEditable('experiencia');
  renderListaEditable('proyectos');
  renderListaEditable('habilidades');
  renderListaEditable('reconocimientos');
  cablearBotonesAccion();

  document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
    cerrarSesion();
    window.location.href = 'index.html';
  });
}

function registroActual() {
  const db = leerDB();
  return db.perfiles[ESTUDIANTE_ACTUAL.id];
}

function renderDashboard() {
  const registro = registroActual();
  const completitud = calcularCompletitud(ESTADO_EDICION);
  const cambiosPendientes = JSON.stringify(ESTADO_EDICION) !== JSON.stringify(registro.publicado);

  const badgeClase = { publicado: 'badge-estado-publicado', borrador: 'badge-estado-borrador', vacio: 'badge-estado-vacio' };
  const badgeTexto = { publicado: 'Publicado', borrador: 'Borrador', vacio: 'Vacío' };

  document.getElementById('panel-dashboard').innerHTML = `
    <div class="row g-3 mb-4">
      <div class="col-sm-4">
        <div class="tarjeta-simple p-3">
          <div class="text-muted small">Estado del perfil</div>
          <span class="badge ${badgeClase[registro.estado]}">${badgeTexto[registro.estado]}</span>
          ${cambiosPendientes ? '<div class="small text-muted mt-1">Tienes cambios sin publicar.</div>' : ''}
        </div>
      </div>
      <div class="col-sm-4">
        <div class="tarjeta-simple p-3">
          <div class="text-muted small">Completitud</div>
          <div class="medidor-completitud my-2"><div style="width:${completitud}%"></div></div>
          <div class="small">${completitud}%</div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="tarjeta-simple p-3">
          <div class="text-muted small">Última publicación</div>
          <div class="small">${registro.publicadoEn ? registro.publicadoEn : 'Aún no publicado'}</div>
        </div>
      </div>
    </div>
    <div class="mensaje-motivacion mb-4">
      Procura mantener tu información profesional actualizada y utilizar logros reales.
      Los proyectos académicos deben identificarse como tales.
    </div>
  `;
}

function renderFormularioPersonal() {
  const p = ESTADO_EDICION;
  const cont = document.getElementById('seccion-personal');
  const db = leerDB();
  cont.innerHTML = `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Nombre completo</label>
        <input class="form-control" id="campo-nombre" value="${valAttr(p.nombre)}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Carrera / profesión</label>
        <input class="form-control" id="campo-carrera" value="${valAttr(p.carrera)}">
      </div>
      <div class="col-12">
        <label class="form-label">Reseña breve</label>
        <textarea class="form-control" id="campo-resena" rows="3">${p.resena || ''}</textarea>
      </div>
      <div class="col-md-6">
        <label class="form-label">Correo</label>
        <input class="form-control" id="campo-correo" value="${valAttr(p.correo)}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Teléfono</label>
        <input class="form-control" id="campo-telefono" value="${valAttr(p.telefono)}">
      </div>
      <div class="col-md-6">
        <label class="form-label">LinkedIn</label>
        <input class="form-control" id="campo-linkedin" value="${valAttr(p.linkedin)}">
      </div>
      <div class="col-md-6">
        <label class="form-label">GitHub</label>
        <input class="form-control" id="campo-github" value="${valAttr(p.github)}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Fotografía</label>
        <input class="form-control" id="campo-foto" type="file" accept="image/png,image/jpeg,image/webp">
        <div id="error-foto" class="text-danger small mt-1"></div>
        ${p.foto ? `<img src="${p.foto}" class="mt-2" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">` : ''}
      </div>
      <div class="col-md-6">
        <label class="form-label">Plantilla de CV</label>
        <select class="form-select" id="campo-plantilla">
          ${db.catalogos.plantillasCV.map((pl) => `<option value="${pl.id}" ${registroActual().plantillaCV === pl.id ? 'selected' : ''}>${pl.nombre}</option>`).join('')}
        </select>
      </div>
    </div>
  `;

  ['nombre', 'carrera', 'resena', 'correo', 'telefono', 'linkedin', 'github'].forEach((campo) => {
    document.getElementById('campo-' + campo).addEventListener('input', (e) => {
      ESTADO_EDICION[campo] = e.target.value;
    });
  });

  document.getElementById('campo-foto').addEventListener('change', manejarSeleccionFoto);
}

function manejarSeleccionFoto(e) {
  const archivo = e.target.files[0];
  const cajaError = document.getElementById('error-foto');
  cajaError.textContent = '';
  if (!archivo) return;
  const tiposValidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (!tiposValidos.includes(archivo.type)) {
    cajaError.textContent = 'Formato no válido. Usa JPG, PNG o WEBP.';
    return;
  }
  if (archivo.size > 2 * 1024 * 1024) {
    cajaError.textContent = 'La imagen es demasiado grande (máximo 2 MB).';
    return;
  }
  const lector = new FileReader();
  lector.onload = () => {
    ESTADO_EDICION.foto = lector.result;
    mostrarToast('Foto cargada. No olvides guardar el borrador.');
  };
  lector.readAsDataURL(archivo);
}

// ---- CRUD genérico para listas (educación, experiencia, proyectos, habilidades, reconocimientos) ----

const CONFIG_LISTAS = {
  educacion: {
    titulo: 'Formación académica',
    campos: [
      { clave: 'institucion', etiqueta: 'Institución' },
      { clave: 'carrera', etiqueta: 'Carrera' },
      { clave: 'inicio', etiqueta: 'Fecha inicial', tipo: 'month' },
      { clave: 'fin', etiqueta: 'Fecha final', tipo: 'month' },
      { clave: 'descripcion', etiqueta: 'Descripción', area: true },
    ],
  },
  experiencia: {
    titulo: 'Experiencia',
    campos: [
      { clave: 'empresa', etiqueta: 'Empresa' },
      { clave: 'puesto', etiqueta: 'Puesto' },
      { clave: 'inicio', etiqueta: 'Fecha inicial', tipo: 'month' },
      { clave: 'fin', etiqueta: 'Fecha final', tipo: 'month' },
      { clave: 'descripcion', etiqueta: 'Descripción', area: true },
    ],
  },
  proyectos: {
    titulo: 'Proyectos',
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre' },
      { clave: 'descripcion', etiqueta: 'Descripción', area: true },
      { clave: 'tecnologias', etiqueta: 'Tecnologías' },
      { clave: 'rol', etiqueta: 'Rol' },
      { clave: 'tipo', etiqueta: 'Tipo de proyecto' },
      { clave: 'fecha', etiqueta: 'Fecha', tipo: 'month' },
      { clave: 'url', etiqueta: 'Enlace' },
      { clave: 'repo', etiqueta: 'Repositorio' },
      { clave: 'academico', etiqueta: '¿Es un proyecto académico?', tipo: 'checkbox' },
    ],
  },
  habilidades: {
    titulo: 'Habilidades',
    campos: [
      { clave: 'nombre', etiqueta: 'Habilidad' },
      { clave: 'categoria', etiqueta: 'Categoría', tipo: 'select', opciones: () => leerDB().catalogos.categoriasHabilidades },
    ],
  },
  reconocimientos: {
    titulo: 'Reconocimientos',
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre' },
      { clave: 'institucion', etiqueta: 'Institución' },
      { clave: 'fecha', etiqueta: 'Fecha', tipo: 'month' },
      { clave: 'descripcion', etiqueta: 'Descripción', area: true },
    ],
  },
};

function renderListaEditable(clave) {
  const config = CONFIG_LISTAS[clave];
  const cont = document.getElementById('seccion-' + clave);
  const items = ESTADO_EDICION[clave] || [];

  cont.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="h6 mb-0">${config.titulo}</h2>
      <button class="btn btn-sm btn-primary" id="btn-agregar-${clave}">Agregar</button>
    </div>
    <div id="lista-${clave}"></div>
  `;

  document.getElementById(`btn-agregar-${clave}`).addEventListener('click', () => {
    const nuevo = { id: cId() };
    config.campos.forEach((c) => { nuevo[c.clave] = c.tipo === 'checkbox' ? false : ''; });
    ESTADO_EDICION[clave].push(nuevo);
    renderListaEditable(clave);
  });

  const listaEl = document.getElementById(`lista-${clave}`);
  if (items.length === 0) {
    listaEl.innerHTML = '<p class="text-muted small">Todavía no has agregado nada aquí.</p>';
    return;
  }

  items.forEach((item, idx) => {
    const bloque = document.createElement('div');
    bloque.className = 'item-card p-3 mb-3';
    bloque.innerHTML = `
      <div class="row g-2">
        ${config.campos.map((c) => `
          <div class="${c.area ? 'col-12' : 'col-md-6'}">
            <label class="form-label small">${c.etiqueta}</label>
            ${campoHtml(c, item)}
          </div>
        `).join('')}
      </div>
      <div class="text-end mt-2">
        <button class="btn btn-sm btn-outline-danger btn-eliminar">Eliminar</button>
      </div>
    `;
    listaEl.appendChild(bloque);

    config.campos.forEach((c) => {
      const input = bloque.querySelector(`[data-campo="${c.clave}"]`);
      const evento = c.tipo === 'checkbox' ? 'change' : 'input';
      input.addEventListener(evento, (e) => {
        item[c.clave] = c.tipo === 'checkbox' ? e.target.checked : e.target.value;
      });
    });

    bloque.querySelector('.btn-eliminar').addEventListener('click', () => {
      if (!confirm('¿Eliminar este elemento? Esta acción no se puede deshacer.')) return;
      ESTADO_EDICION[clave] = ESTADO_EDICION[clave].filter((x) => x.id !== item.id);
      renderListaEditable(clave);
      mostrarToast('Elemento eliminado.');
    });
  });
}

function campoHtml(c, item) {
  const valor = item[c.clave];
  if (c.tipo === 'checkbox') {
    return `<div class="form-check mt-2"><input class="form-check-input" type="checkbox" data-campo="${c.clave}" ${valor ? 'checked' : ''}></div>`;
  }
  if (c.tipo === 'select') {
    const opciones = c.opciones();
    return `<select class="form-select" data-campo="${c.clave}">
      ${opciones.map((o) => `<option value="${o}" ${valor === o ? 'selected' : ''}>${o}</option>`).join('')}
    </select>`;
  }
  if (c.area) {
    return `<textarea class="form-control" rows="2" data-campo="${c.clave}">${valor || ''}</textarea>`;
  }
  return `<input class="form-control" type="${c.tipo || 'text'}" data-campo="${c.clave}" value="${valAttr(valor)}">`;
}

function valAttr(v) {
  return (v || '').toString().replace(/"/g, '&quot;');
}

function cablearBotonesAccion() {
  document.getElementById('btn-guardar-borrador').addEventListener('click', () => {
    const db = leerDB();
    const registro = db.perfiles[ESTUDIANTE_ACTUAL.id];
    registro.borrador = JSON.parse(JSON.stringify(ESTADO_EDICION));
    registro.plantillaCV = document.getElementById('campo-plantilla').value;
    if (registro.estado === 'vacio' && hayDatosMinimos(registro.borrador)) {
      registro.estado = 'borrador';
    }
    ESTUDIANTE_ACTUAL.actualizadoEn = new Date().toISOString().slice(0, 10);
    guardarDB(db);
    renderDashboard();
    mostrarToast('Los cambios se guardaron como borrador.');
  });

  document.getElementById('btn-previsualizar').addEventListener('click', () => {
    document.getElementById('btn-guardar-borrador').click();
    window.open('perfil.html?slug=' + encodeURIComponent(ESTUDIANTE_ACTUAL.slug) + '&preview=1', '_blank');
  });

  document.getElementById('btn-publicar').addEventListener('click', () => {
    const nombre = document.getElementById('campo-nombre').value.trim();
    const carrera = document.getElementById('campo-carrera').value.trim();
    if (!nombre || !carrera) {
      mostrarToast('Para publicar tu EProfile necesitas completar al menos tu nombre y carrera.', true);
      return;
    }
    document.getElementById('btn-guardar-borrador').click();
    const db = leerDB();
    const registro = db.perfiles[ESTUDIANTE_ACTUAL.id];
    registro.publicado = JSON.parse(JSON.stringify(registro.borrador));
    registro.estado = 'publicado';
    registro.publicadoEn = new Date().toISOString().slice(0, 10);
    guardarDB(db);
    renderDashboard();
    mostrarToast('Tu EProfile fue publicada correctamente.');
  });
}

function mostrarToast(mensaje, esError) {
  const cont = document.getElementById('contenedor-toasts');
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white ${esError ? 'bg-danger' : 'bg-dark'} border-0 show mb-2`;
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${mensaje}</div></div>`;
  cont.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
