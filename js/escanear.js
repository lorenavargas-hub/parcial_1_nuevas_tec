function iniciarEscaneo() {
  const soporta = 'BarcodeDetector' in window;
  const avisoSoporte = document.getElementById('aviso-soporte');
  const video = document.getElementById('video-camara');
  const btnActivar = document.getElementById('btn-activar-camara');
  const resultado = document.getElementById('resultado-escaneo');

  if (!soporta) {
    avisoSoporte.classList.remove('d-none');
    btnActivar.disabled = true;
  } else {
    btnActivar.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.classList.remove('d-none');
        await video.play();
        const detector = new BarcodeDetector({ formats: ['qr_code'] });
        const intervalo = setInterval(async () => {
          try {
            const codigos = await detector.detect(video);
            if (codigos.length > 0) {
              clearInterval(intervalo);
              stream.getTracks().forEach((t) => t.stop());
              video.classList.add('d-none');
              procesarTextoEscaneado(codigos[0].rawValue, resultado);
            }
          } catch (err) { /* seguir intentando */ }
        }, 500);
      } catch (err) {
        avisoSoporte.textContent = 'No se pudo acceder a la cámara. Usa la opción manual de abajo.';
        avisoSoporte.classList.remove('d-none');
      }
    });
  }

  document.getElementById('form-manual').addEventListener('submit', (e) => {
    e.preventDefault();
    const valor = document.getElementById('entrada-manual').value.trim();
    procesarTextoEscaneado(valor, resultado);
  });
}

function procesarTextoEscaneado(texto, contenedorResultado) {
  let slug = texto;
  try {
    if (texto.startsWith('http')) {
      const url = new URL(texto);
      slug = url.pathname.replace(/^\/+/, '').split('/')[0];
    }
  } catch (e) { /* texto no es una URL válida, se usa tal cual */ }

  slug = slug.trim();
  if (!slug) {
    contenedorResultado.innerHTML = '<div class="alert alert-danger">Ingresa una URL o un usuario válido.</div>';
    return;
  }
  window.location.href = 'perfil.html?slug=' + encodeURIComponent(slug);
}
