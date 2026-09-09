function iniciarTarjeta() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const cont = document.getElementById('contenido-tarjeta');

  if (!slug) { window.location.href = '404.html'; return; }
  const estudiante = buscarEstudiantePorSlug(slug);
  if (!estudiante) { window.location.href = '404.html'; return; }
  const visible = perfilPublicoVisible(estudiante.id);
  if (!visible) { window.location.href = '404.html'; return; }

  const perfil = visible.registro.publicado;
  const url = urlPublicaDe(slug);

  cont.innerHTML = `
    <div class="tarjeta-digital">
      <p class="text-muted text-uppercase small mb-1">EProfile</p>
      <h1 class="h5 mb-0">${perfil.nombre}</h1>
      <p class="text-muted small">${perfil.carrera}</p>
      <canvas id="canvas-qr"></canvas>
      <p class="small">${url}</p>
      <p class="text-muted small mb-3">Escanea para conocer mi perfil</p>
      <div class="d-flex gap-2 justify-content-center no-imprimir">
        <button class="btn btn-outline-primary btn-sm" onclick="window.print()">Imprimir tarjeta</button>
        <button class="btn btn-outline-primary btn-sm" id="btn-descargar-qr">Descargar QR</button>
        <button class="btn btn-outline-primary btn-sm" id="btn-vcard-tarjeta">Guardar contacto</button>
      </div>
    </div>
  `;

  const canvas = document.getElementById('canvas-qr');
  const qr = QR.generar(url);
  QR.dibujarEnCanvas(canvas, qr, { escala: 6, margen: 3 });

  document.getElementById('btn-descargar-qr').addEventListener('click', () => {
    const enlace = document.createElement('a');
    enlace.href = canvas.toDataURL('image/png');
    enlace.download = `qr-${slug}.png`;
    enlace.click();
  });

  document.getElementById('btn-vcard-tarjeta').addEventListener('click', () => descargarVCard(perfil, slug));
}
