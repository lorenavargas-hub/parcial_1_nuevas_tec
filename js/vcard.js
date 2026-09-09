/*
 * vcard.js — Genera y descarga un archivo .vcf a partir de los datos
 * publicados de un perfil. No depende de ningún servicio externo.
 */

function textoVCard(perfil, slug) {
  const url = urlPublicaDe(slug);
  const lineas = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${perfil.nombre || ''}`,
    perfil.carrera ? `TITLE:${perfil.carrera}` : null,
    perfil.correo ? `EMAIL:${perfil.correo}` : null,
    perfil.telefono ? `TEL:${perfil.telefono}` : null,
    `URL:${url}`,
    perfil.resena ? `NOTE:${perfil.resena.replace(/\n/g, ' ')}` : null,
    'END:VCARD',
  ].filter(Boolean);
  return lineas.join('\r\n');
}

function descargarVCard(perfil, slug) {
  const contenido = textoVCard(perfil, slug);
  const blob = new Blob([contenido], { type: 'text/vcard;charset=utf-8' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `${slug}.vcf`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
}

function urlPublicaDe(slug) {
  return `${window.location.origin}/${slug}`;
}
