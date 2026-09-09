/*
 * datos.js — Capa de datos de EProfile.
 *
 * IMPORTANTE (léelo antes de usar el proyecto):
 * Esta versión es un sitio 100% estático pensado para subirse a Netlify.
 * Netlify no ejecuta backend ni bases de datos persistentes, así que toda
 * la información (perfiles, cuentas, publicaciones) se guarda en el
 * localStorage del navegador. Esto significa:
 *
 *   - Los cambios se guardan en el navegador donde los hiciste, no en un
 *     servidor. Si abres el sitio desde otro dispositivo o navegador,
 *     verás los datos originales de este archivo, no tus cambios.
 *   - Las "contraseñas" son solo para simular el login en la demo y no
 *     ofrecen seguridad real (cualquiera puede leer este archivo).
 *
 * Si el proyecto necesita persistencia real multi-dispositivo, se debe
 * agregar un backend. Ver README.md, sección "Limitaciones".
 */

const EPROFILE_DB_KEY = 'eprofile_db_v2';

function datosSemilla() {
  return {
    catalogos: {
      categoriasHabilidades: ['Técnicas', 'Blandas', 'Idiomas', 'Herramientas'],
      tiposEnlace: ['LinkedIn', 'GitHub', 'Correo', 'Teléfono', 'Portafolio', 'Otro'],
      tiposProyecto: ['Académico', 'Personal', 'Freelance', 'Laboratorio'],
      plantillasCV: [
        { id: 'clasica', nombre: 'Clásica', descripcion: 'Profesional y tradicional.' },
        { id: 'moderna', nombre: 'Moderna', descripcion: 'Más visual, pero sobria.' },
        { id: 'minimalista', nombre: 'Minimalista', descripcion: 'Simple y limpia.' },
      ],
    },
    usuarios: [
      { id: 'u-admin', email: 'admin@eprofile.local', password: 'Admin123!', rol: 'admin', activo: true },
      { id: 'u-1', email: 'isabella.lopez@iest.edu.mx', password: 'Isabella123!', rol: 'estudiante', activo: true, estudianteId: 'e-1' },
      { id: 'u-2', email: 'lorena.vargas@iest.edu.mx', password: 'Lorena123!', rol: 'estudiante', activo: true, estudianteId: 'e-2' },
    ],
    estudiantes: [
      { id: 'e-1', userId: 'u-1', slug: 'isabella-lopez', creadoEn: '2026-01-15', actualizadoEn: '2026-02-20' },
      { id: 'e-2', userId: 'u-2', slug: 'lorena-vargas', creadoEn: '2026-01-20', actualizadoEn: '2026-02-10' },
    ],
    perfiles: {
      'e-1': {
        estado: 'publicado',
        publicadoEn: '2026-02-20',
        plantillaCV: 'moderna',
        publicado: perfilIsabella(),
        borrador: perfilIsabella(),
      },
      'e-2': {
        estado: 'publicado',
        publicadoEn: '2026-02-10',
        plantillaCV: 'moderna',
        publicado: perfilLorena(),
        borrador: perfilLorena(),
      },
    },
  };
}

function perfilVacio() {
  return {
    nombre: '', carrera: '', resena: '', correo: '', telefono: '', linkedin: '', github: '', foto: '',
    educacion: [], experiencia: [], proyectos: [], habilidades: [], reconocimientos: [], enlaces: [],
  };
}

function perfilIsabella() {
  return {
    nombre: 'Isabella López',
    carrera: 'Ingeniería en Sistemas y Negocios Digitales',
    resena: 'Estudiante de Ingeniería en Sistemas y Negocios Digitales en el IEST Anáhuac, con interés en redes neuronales, inteligencia artificial y el desarrollo de productos digitales que resuelven problemas reales.',
    correo: 'isabella.lopez@iest.edu.mx',
    telefono: '',
    linkedin: '',
    github: '',
    foto: '',
    educacion: [
      {
        id: cId(), institucion: 'IEST Anáhuac', carrera: 'Ingeniería en Sistemas y Negocios Digitales',
        inicio: '2024-08', fin: '', descripcion: '',
      },
    ],
    experiencia: [],
    proyectos: [
      {
        id: cId(), nombre: 'Nodus', academico: true,
        descripcion: 'Sistema para el control de donativos de campañas. Permite a una institución administrar sus campañas activas, definir la meta de recolección por producto (por ejemplo, 30 litros de aceite) y llevar el control de los centros de distribución para conocer el inventario disponible de cada producto, asignando la mejor cantidad posible a cada campaña.',
        tecnologias: 'Supabase, TypeScript, React', rol: 'Diseño front',
        tipo: 'Académico', fecha: '2026',
        url: '', repo: '',
      },
    ],
    habilidades: [
      { id: cId(), nombre: 'C++', categoria: 'Técnicas' },
      { id: cId(), nombre: 'Python', categoria: 'Técnicas' },
      { id: cId(), nombre: 'Java', categoria: 'Técnicas' },
      { id: cId(), nombre: 'Figma', categoria: 'Herramientas' },
      { id: cId(), nombre: 'Diseño de front', categoria: 'Blandas' },
      { id: cId(), nombre: 'Trabajo en equipo', categoria: 'Blandas' },
    ],
    reconocimientos: [
      { id: cId(), nombre: 'Primer lugar, Hackathon 2026', institucion: 'IEST Anáhuac', fecha: '2026', descripcion: 'Con el proyecto Nodus.' },
    ],
    enlaces: [],
  };
}

function perfilLorena() {
  return {
    nombre: 'Lorena Vargas',
    carrera: 'Ingeniería en Sistemas — especialidad en Ingeniería de Datos',
    resena: 'Estudiante de Ingeniería en Sistemas con especialidad en Ingeniería de Datos en el IEST Anáhuac, enfocada en análisis de datos y soluciones de inteligencia de negocio.',
    correo: 'lorena.vargas@iest.edu.mx',
    telefono: '',
    linkedin: '',
    github: '',
    foto: '',
    educacion: [
      {
        id: cId(), institucion: 'IEST Anáhuac', carrera: 'Ingeniería en Sistemas — especialidad en Ingeniería de Datos',
        inicio: '2024-08', fin: '', descripcion: '',
      },
    ],
    experiencia: [
      {
        id: cId(), empresa: 'BPO & Tecnología', puesto: 'Becaria de datos',
        inicio: '', fin: '',
        descripcion: 'Colaboración en distintos proyectos de datos para clientes como Philip Morris International y Banco Base.',
      },
    ],
    proyectos: [
      {
        id: cId(), nombre: 'Nodus', academico: true,
        descripcion: 'Sistema para el control de donativos de campañas. Permite a una institución administrar sus campañas activas, definir la meta de recolección por producto (por ejemplo, 30 litros de aceite) y llevar el control de los centros de distribución para conocer el inventario disponible de cada producto, asignando la mejor cantidad posible a cada campaña.',
        tecnologias: 'Supabase, TypeScript, React', rol: 'Diseño y modelado de base de datos',
        tipo: 'Académico', fecha: '2026',
        url: '', repo: '',
      },
      {
        id: cId(), nombre: 'Pipeline', academico: true,
        descripcion: 'Software que ayuda a las empresas a llevar un mejor control de sus flujos de trabajo. Por ejemplo, una solicitud de crédito: etapa 1, datos del cliente; etapa 2, revisión de buró; y así sucesivamente hasta la resolución de la solicitud.',
        tecnologias: '', rol: '',
        tipo: 'Académico', fecha: '2026',
        url: '', repo: '',
      },
    ],
    habilidades: [
      { id: cId(), nombre: 'SQL', categoria: 'Técnicas' },
      { id: cId(), nombre: 'Python', categoria: 'Técnicas' },
      { id: cId(), nombre: 'Análisis de negocio', categoria: 'Técnicas' },
      { id: cId(), nombre: 'AWS', categoria: 'Herramientas' },
      { id: cId(), nombre: 'Matillion', categoria: 'Herramientas' },
      { id: cId(), nombre: 'Snowflake', categoria: 'Herramientas' },
      { id: cId(), nombre: 'Power BI', categoria: 'Herramientas' },
      { id: cId(), nombre: 'Trabajo en equipo', categoria: 'Blandas' },
    ],
    reconocimientos: [
      { id: cId(), nombre: 'Primer lugar, Hackathon 2026', institucion: 'IEST Anáhuac', fecha: '2026', descripcion: 'Con el proyecto Nodus.' },
    ],
    enlaces: [],
  };
}

function cId() {
  return 'id-' + Math.random().toString(36).slice(2, 10);
}

function leerDB() {
  const crudo = localStorage.getItem(EPROFILE_DB_KEY);
  if (!crudo) {
    const inicial = datosSemilla();
    localStorage.setItem(EPROFILE_DB_KEY, JSON.stringify(inicial));
    return inicial;
  }
  try {
    return JSON.parse(crudo);
  } catch (e) {
    const inicial = datosSemilla();
    localStorage.setItem(EPROFILE_DB_KEY, JSON.stringify(inicial));
    return inicial;
  }
}

function guardarDB(db) {
  localStorage.setItem(EPROFILE_DB_KEY, JSON.stringify(db));
}

function reiniciarDatosDemo() {
  localStorage.setItem(EPROFILE_DB_KEY, JSON.stringify(datosSemilla()));
}

// ---- Helpers de consulta ----

function buscarEstudiantePorSlug(slug) {
  const db = leerDB();
  return db.estudiantes.find((e) => e.slug === slug) || null;
}

function buscarUsuarioPorEstudianteId(estudianteId) {
  const db = leerDB();
  return db.usuarios.find((u) => u.estudianteId === estudianteId) || null;
}

function perfilPublicoVisible(estudianteId) {
  const db = leerDB();
  const estudiante = db.estudiantes.find((e) => e.id === estudianteId);
  const usuario = db.usuarios.find((u) => u.estudianteId === estudianteId);
  const registro = db.perfiles[estudianteId];
  if (!estudiante || !usuario || !registro) return null;
  if (!usuario.activo) return null;
  if (registro.estado !== 'publicado') return null;
  return { estudiante, registro };
}

function calcularCompletitud(perfil) {
  const campos = [
    perfil.nombre, perfil.carrera, perfil.resena, perfil.correo,
    perfil.educacion.length > 0, perfil.habilidades.length > 0,
    perfil.proyectos.length > 0, perfil.foto,
  ];
  const llenos = campos.filter(Boolean).length;
  return Math.round((llenos / campos.length) * 100);
}

function hayDatosMinimos(perfil) {
  return Boolean(perfil.nombre && perfil.carrera);
}

function hayCambiosSinPublicar(registro) {
  return JSON.stringify(registro.borrador) !== JSON.stringify(registro.publicado);
}

function slugValido(slug) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

function slugDisponible(slug, ignorarEstudianteId) {
  const db = leerDB();
  return !db.estudiantes.some((e) => e.slug === slug && e.id !== ignorarEstudianteId);
}
