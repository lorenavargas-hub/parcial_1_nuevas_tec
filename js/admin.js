/*
 * admin.js — Panel del administrador de la plataforma.
 */

function iniciarAdmin() {
  const sesion = exigirAdmin();
  if (!sesion) return;

  renderResumen();
  renderTablaEstudiantes();

  document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
    cerrarSesion();
    window.location.href = 'index.html';
  });

  document.getElementById('form-nuevo-estudiante').addEventListener('submit', crearEstudiante);
  document.getElementById('filtro-busqueda').addEventListener('input', renderTablaEstudiantes);
  document.getElementById('filtro-estado').addEventListener('change', renderTablaEstudiantes);

  document.getElementById('btn-respaldar').addEventListener('click', respaldarDatos);
  document.getElementById('input-restaurar').addEventListener('change', restaurarDatos);
  document.getElementById('btn-reiniciar-demo').addEventListener('click', () => {
    if (!confirm('Esto borrará todos tus cambios y regresará a los datos de demostración originales. ¿Continuar?')) return;
    reiniciarDatosDemo();
    renderResumen();
    renderTablaEstudiantes();
    mostrarToastAdmin('Datos de demostración restaurados.');
  });
}

function renderResumen() {
  const db = leerDB();
  const total = db.estudiantes.length;
  let publicados = 0, borradores = 0, vacios = 0, activas = 0, inactivas = 0;
  db.estudiantes.forEach((e) => {
    const registro = db.perfiles[e.id];
    if (registro.estado === 'publicado') publicados++;
    else if (registro.estado === 'borrador') borradores++;
    else vacios++;
    const usuario = db.usuarios.find((u) => u.estudianteId === e.id);
    if (usuario && usuario.activo) activas++; else inactivas++;
  });

  document.getElementById('resumen-admin').innerHTML = `
    ${tarjetaResumen('Estudiantes', total)}
    ${tarjetaResumen('Publicados', publicados)}
    ${tarjetaResumen('Borradores', borradores)}
    ${tarjetaResumen('Vacíos', vacios)}
    ${tarjetaResumen('Cuentas activas', activas)}
    ${tarjetaResumen('Cuentas inactivas', inactivas)}
  `;
}

function tarjetaResumen(etiqueta, valor) {
  return `<div class="col-6 col-md-2">
    <div class="tarjeta-simple p-3 text-center">
      <div class="fs-4 fw-semibold">${valor}</div>
      <div class="text-muted small">${etiqueta}</div>
    </div>
  </div>`;
}

function renderTablaEstudiantes() {
  const db = leerDB();
  const busqueda = (document.getElementById('filtro-busqueda').value || '').toLowerCase();
  const filtroEstado = document.getElementById('filtro-estado').value;

  const filas = db.estudiantes
    .map((e) => {
      const registro = db.perfiles[e.id];
      const usuario = db.usuarios.find((u) => u.estudianteId === e.id);
      return { estudiante: e, registro, usuario };
    })
    .filter(({ estudiante, registro, usuario }) => {
      const texto = `${registro.publicado.nombre} ${usuario.email} ${estudiante.slug}`.toLowerCase();
      if (busqueda && !texto.includes(busqueda)) return false;
      if (filtroEstado === 'publicado' && registro.estado !== 'publicado') return false;
      if (filtroEstado === 'borrador' && registro.estado !== 'borrador') return false;
      if (filtroEstado === 'vacio' && registro.estado !== 'vacio') return false;
      if (filtroEstado === 'activo' && !usuario.activo) return false;
      if (filtroEstado === 'inactivo' && usuario.activo) return false;
      return true;
    });

  const cuerpo = document.getElementById('cuerpo-tabla-estudiantes');
  if (filas.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No se encontraron estudiantes.</td></tr>';
    return;
  }

  const badgeEstado = { publicado: 'badge-estado-publicado', borrador: 'badge-estado-borrador', vacio: 'badge-estado-vacio' };
  const textoEstado = { publicado: 'Publicado', borrador: 'Borrador', vacio: 'Vacío' };

  cuerpo.innerHTML = filas.map(({ estudiante, registro, usuario }) => `
    <tr>
      <td>${registro.publicado.nombre || registro.borrador.nombre || '(sin nombre)'}</td>
      <td>${usuario.email}</td>
      <td>/${estudiante.slug}</td>
      <td><span class="badge ${badgeEstado[registro.estado]}">${textoEstado[registro.estado]}</span></td>
      <td><span class="badge ${usuario.activo ? 'badge-cuenta-activa' : 'badge-cuenta-inactiva'}">${usuario.activo ? 'Activa' : 'Inactiva'}</span></td>
      <td>${estudiante.actualizadoEn}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" onclick="window.location.href='panel.html?slug=${estudiante.slug}'">Administrar</button>
          <button class="btn btn-outline-secondary" data-accion="reset" data-id="${usuario.id}">Reiniciar contraseña</button>
          ${usuario.activo
            ? `<button class="btn btn-outline-warning" data-accion="desactivar" data-id="${usuario.id}">Desactivar</button>`
            : `<button class="btn btn-outline-success" data-accion="reactivar" data-id="${usuario.id}">Reactivar</button>`}
          <button class="btn btn-outline-danger" data-accion="eliminar" data-id="${estudiante.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');

  cuerpo.querySelectorAll('[data-accion]').forEach((btn) => {
    btn.addEventListener('click', () => manejarAccion(btn.dataset.accion, btn.dataset.id));
  });
}

function manejarAccion(accion, id) {
  const db = leerDB();
  if (accion === 'desactivar' || accion === 'reactivar') {
    const usuario = db.usuarios.find((u) => u.id === id);
    usuario.activo = accion === 'reactivar';
    guardarDB(db);
    mostrarToastAdmin(accion === 'reactivar' ? 'La cuenta fue reactivada.' : 'La cuenta fue desactivada.');
  } else if (accion === 'reset') {
    const usuario = db.usuarios.find((u) => u.id === id);
    const nueva = generarContrasenaTemporal();
    usuario.password = nueva;
    guardarDB(db);
    alert(`Nueva contraseña temporal para ${usuario.email}: ${nueva}`);
  } else if (accion === 'eliminar') {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cuenta? Esta acción eliminará la información asociada al perfil.')) return;
    db.estudiantes = db.estudiantes.filter((e) => e.id !== id);
    db.usuarios = db.usuarios.filter((u) => u.estudianteId !== id);
    delete db.perfiles[id];
    guardarDB(db);
    mostrarToastAdmin('El estudiante fue eliminado.');
  }
  renderResumen();
  renderTablaEstudiantes();
}

function generarContrasenaTemporal() {
  return 'Temp' + Math.random().toString(36).slice(2, 8) + '!';
}

function crearEstudiante(e) {
  e.preventDefault();
  const nombre = document.getElementById('nuevo-nombre').value.trim();
  const correo = document.getElementById('nuevo-correo').value.trim();
  const slug = document.getElementById('nuevo-slug').value.trim().toLowerCase();
  const password = document.getElementById('nuevo-password').value;
  const cajaError = document.getElementById('error-nuevo-estudiante');
  cajaError.classList.add('d-none');

  const db = leerDB();
  if (!nombre || !correo || !slug || !password) {
    return mostrarErrorForm(cajaError, 'Todos los campos son obligatorios.');
  }
  if (db.usuarios.some((u) => u.email.toLowerCase() === correo.toLowerCase())) {
    return mostrarErrorForm(cajaError, 'Ya existe una cuenta con ese correo.');
  }
  if (!slugValido(slug)) {
    return mostrarErrorForm(cajaError, 'El slug solo puede tener minúsculas, números y guiones (ej. ana-martinez).');
  }
  if (!slugDisponible(slug)) {
    return mostrarErrorForm(cajaError, 'Ese slug ya está en uso.');
  }
  if (password.length < 6) {
    return mostrarErrorForm(cajaError, 'La contraseña debe tener al menos 6 caracteres.');
  }

  const estudianteId = cId();
  const usuarioId = cId();
  const hoy = new Date().toISOString().slice(0, 10);

  db.usuarios.push({ id: usuarioId, email: correo, password, rol: 'estudiante', activo: true, estudianteId });
  db.estudiantes.push({ id: estudianteId, userId: usuarioId, slug, creadoEn: hoy, actualizadoEn: hoy });
  db.perfiles[estudianteId] = {
    estado: 'vacio', publicadoEn: null, plantillaCV: 'clasica',
    publicado: perfilVacio(), borrador: perfilVacio(),
  };
  guardarDB(db);

  document.getElementById('form-nuevo-estudiante').reset();
  renderResumen();
  renderTablaEstudiantes();
  mostrarToastAdmin('El estudiante fue creado correctamente.');
}

function mostrarErrorForm(caja, mensaje) {
  caja.textContent = mensaje;
  caja.classList.remove('d-none');
}

function respaldarDatos() {
  const db = leerDB();
  const contenido = JSON.stringify(db, null, 2);
  const blob = new Blob([contenido], { type: 'application/json' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `eprofile-backup-${new Date().toISOString().slice(0, 10)}.json`;
  enlace.click();
  mostrarToastAdmin('Respaldo generado.');
}

function restaurarDatos(e) {
  const archivo = e.target.files[0];
  if (!archivo) return;
  if (!confirm('Esto reemplazará todos los datos actuales por los del respaldo. ¿Continuar?')) {
    e.target.value = '';
    return;
  }
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const datos = JSON.parse(lector.result);
      if (!datos.usuarios || !datos.estudiantes || !datos.perfiles) throw new Error('formato inválido');
      guardarDB(datos);
      renderResumen();
      renderTablaEstudiantes();
      mostrarToastAdmin('Datos restaurados correctamente.');
    } catch (err) {
      alert('El archivo de respaldo no es válido.');
    }
  };
  lector.readAsText(archivo);
  e.target.value = '';
}

function mostrarToastAdmin(mensaje) {
  const cont = document.getElementById('contenedor-toasts');
  const toast = document.createElement('div');
  toast.className = 'toast align-items-center text-white bg-dark border-0 show mb-2';
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${mensaje}</div></div>`;
  cont.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
