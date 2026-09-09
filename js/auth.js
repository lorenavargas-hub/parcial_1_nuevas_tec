/*
 * auth.js — Sesión simulada para la demo estática.
 *
 * No hay servidor, así que esto NO es seguridad real: solo controla la
 * navegación dentro del sitio para que la demo se sienta como un sistema
 * con roles. Cualquiera con acceso a las herramientas de desarrollador del
 * navegador podría alterar la sesión. Ver README.md, sección "Limitaciones".
 */

const EPROFILE_SESION_KEY = 'eprofile_sesion_v1';

function iniciarSesion(email, password) {
  const db = leerDB();
  const usuario = db.usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!usuario) return { ok: false, mensaje: 'No encontramos una cuenta con ese correo.' };
  if (!usuario.activo) return { ok: false, mensaje: 'Esta cuenta está desactivada. Contacta al administrador.' };
  if (usuario.password !== password) return { ok: false, mensaje: 'La contraseña no es correcta.' };

  const sesion = { userId: usuario.id, rol: usuario.rol, estudianteId: usuario.estudianteId || null };
  localStorage.setItem(EPROFILE_SESION_KEY, JSON.stringify(sesion));
  return { ok: true, sesion };
}

function cerrarSesion() {
  localStorage.removeItem(EPROFILE_SESION_KEY);
}

function sesionActual() {
  const crudo = localStorage.getItem(EPROFILE_SESION_KEY);
  if (!crudo) return null;
  try {
    const sesion = JSON.parse(crudo);
    const db = leerDB();
    const usuario = db.usuarios.find((u) => u.id === sesion.userId);
    if (!usuario || !usuario.activo) {
      cerrarSesion();
      return null;
    }
    return sesion;
  } catch (e) {
    return null;
  }
}

function exigirSesion() {
  const sesion = sesionActual();
  if (!sesion) {
    window.location.href = 'login.html';
    return null;
  }
  return sesion;
}

function exigirAdmin() {
  const sesion = exigirSesion();
  if (!sesion) return null;
  if (sesion.rol !== 'admin') {
    window.location.href = 'acceso-denegado.html';
    return null;
  }
  return sesion;
}

// Verifica que la sesión pueda administrar el estudiante de "estudianteId".
// Los administradores pueden entrar a cualquier panel; el estudiante solo al propio.
function exigirPropietarioOAdmin(estudianteId) {
  const sesion = exigirSesion();
  if (!sesion) return null;
  if (sesion.rol === 'admin') return sesion;
  if (sesion.rol === 'estudiante' && sesion.estudianteId === estudianteId) return sesion;
  window.location.href = 'acceso-denegado.html';
  return null;
}
