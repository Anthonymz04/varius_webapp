export interface SeedLawyer {
  id: string;
  name: string;
  role: string;
  city: string;
  rating: string;
  reviews: string;
  price: string;
  color: string;
  initials: string;
  bio: string;
  education: string;
  experience: string;
}

export interface SeedTutorialia {
  id: string;
  label: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  tutor: string;
  icon: 'scale' | 'shield' | 'users' | 'book';
}

export interface SeedPost {
  id: string;
  author: string;
  initials: string;
  color: string;
  body: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  createdAt: number;
}

export const SEED_LAWYERS: SeedLawyer[] = [
  {
    id: 'valentina-mena',
    name: 'Valentina Mena',
    role: 'Derecho de familia',
    city: 'Quito, Ecuador',
    rating: '4.9',
    reviews: '124 reseñas',
    price: '$45 / consulta',
    color: '#d8ad96',
    initials: 'VM',
    bio: 'Especialista en demandas de alimentos, divorcios, custodia de menores y régimen de visitas en Ecuador. Más de 8 años asistiendo familias.',
    education: 'Universidad Central del Ecuador · Máster en Derecho de Familia',
    experience: '8+ años de ejercicio profesional',
  },
  {
    id: 'santiago-rivas',
    name: 'Santiago Rivas',
    role: 'Derecho laboral',
    city: 'Guayaquil, Ecuador',
    rating: '4.8',
    reviews: '98 reseñas',
    price: '$38 / consulta',
    color: '#7e907d',
    initials: 'SR',
    bio: 'Abogado laboralista. Asesoría en despidos intempestivos, actas de finiquito, mediación laboral y demandas ante el Ministerio del Trabajo.',
    education: 'Universidad de Guayaquil · Especialista en Derecho Laboral',
    experience: '10+ años asesorando trabajadores y empresas',
  },
  {
    id: 'elena-paredes',
    name: 'Elena Paredes',
    role: 'Propiedad intelectual',
    city: 'Atención virtual',
    rating: '5.0',
    reviews: '76 reseñas',
    price: '$55 / consulta',
    color: '#9f7f8c',
    initials: 'EP',
    bio: 'Registro de marcas en el SENADI, patentes, derechos de autor y protección de startups. Consultas 100% online.',
    education: 'Universidad San Francisco de Quito · LL.M. IP Law',
    experience: '7 años en consultoría LegalTech y propiedad intelectual',
  },
  {
    id: 'carlos-mendoza',
    name: 'Carlos Mendoza',
    role: 'Derecho penal',
    city: 'Cuenca, Ecuador',
    rating: '4.7',
    reviews: '63 reseñas',
    price: '$50 / consulta',
    color: '#8b7d9b',
    initials: 'CM',
    bio: 'Defensa penal técnica en procesos según el COIP. Medidas cautelares, hábeas corpus y acompañamiento a audiencias.',
    education: 'Universidad de Cuenca · Máster en Ciencias Penales',
    experience: '12 años de práctica procesal penal',
  },
  {
    id: 'maria-fernandez',
    name: 'María Fernández',
    role: 'Derecho tributario',
    city: 'Quito, Ecuador',
    rating: '4.9',
    reviews: '112 reseñas',
    price: '$60 / consulta',
    color: '#d89696',
    initials: 'MF',
    bio: 'Planificación fiscal, reclamos administrativos ante el SRI y defensas tributarias en el Tribunal Contencioso.',
    education: 'Universidad Andina Simón Bolívar · Especialidad en Tributación',
    experience: '9 años en consultoría fiscal corporativa',
  },
  {
    id: 'andres-lopez',
    name: 'Andrés López',
    role: 'Derecho constitucional',
    city: 'Guayaquil, Ecuador',
    rating: '4.6',
    reviews: '45 reseñas',
    price: '$42 / consulta',
    color: '#7d8e90',
    initials: 'AL',
    bio: 'Acciones de protección, hábeas data y recursos de inconstitucionalidad ante la Corte Constitucional del Ecuador.',
    education: 'Universidad Católica de Santiago de Guayaquil',
    experience: '6 años en litigio constitucional',
  },
];

export const SEED_TUTORIAS: SeedTutorialia[] = [
  {
    id: 'contrato-trabajo',
    label: 'DERECHO LABORAL',
    title: 'Cómo redactar un contrato de trabajo',
    description: 'Aprende los elementos esenciales que debe contener un contrato de trabajo válido según el Código del Trabajo ecuatoriano.',
    level: 'Básico',
    duration: '15 min',
    tutor: 'Santiago Rivas',
    icon: 'scale',
  },
  {
    id: 'contrato-arriendo',
    label: 'DERECHO CIVIL',
    title: 'Paso a paso: contrato de arriendo',
    description: 'Guía práctica para elaborar un contrato de arrendamiento que proteja tanto al arrendador como al arrendatario.',
    level: 'Básico',
    duration: '12 min',
    tutor: 'Valentina Mena',
    icon: 'shield',
  },
  {
    id: 'pension-alimentos',
    label: 'DERECHO DE FAMILIA',
    title: 'Guía para solicitar pensión alimenticia',
    description: 'Todo lo que necesitas saber para presentar una demanda de alimentos: requisitos, documentos y proceso.',
    level: 'Intermedio',
    duration: '20 min',
    tutor: 'Valentina Mena',
    icon: 'users',
  },
  {
    id: 'victima-delito',
    label: 'DERECHO PENAL',
    title: 'Qué hacer si eres víctima de un delito',
    description: 'Pasos a seguir para denunciar un delito ante la Fiscalía General del Estado de Ecuador.',
    level: 'Básico',
    duration: '10 min',
    tutor: 'Carlos Mendoza',
    icon: 'scale',
  },
  {
    id: 'garantias-jurisdiccionales',
    label: 'DERECHO CONSTITUCIONAL',
    title: 'Garantías jurisdiccionales explicadas',
    description: 'Entiende la acción de protección, hábeas corpus, hábeas data y acceso a la información pública.',
    level: 'Intermedio',
    duration: '25 min',
    tutor: 'Andrés López',
    icon: 'book',
  },
  {
    id: 'derechos-consumidor',
    label: 'DERECHO DEL CONSUMIDOR',
    title: 'Tus derechos como consumidor en Ecuador',
    description: 'Aprende a reclamar ante productos defectuosos, publicidad engañosa y servicios incumplidos.',
    level: 'Básico',
    duration: '15 min',
    tutor: 'María Fernández',
    icon: 'shield',
  },
];

export const SEED_POSTS: SeedPost[] = [
  {
    id: 'post-1',
    author: 'María González',
    initials: 'MG',
    color: '#d8ad96',
    body: '¿Alguien ha tenido experiencia con acciones de protección por vulneración de derechos laborales? Me despidieron estando embarazada y quiero saber si es viable esta vía además de la demanda laboral.',
    tags: ['Derecho laboral', 'Constitucional'],
    likeCount: 24,
    commentCount: 8,
    createdAt: 1755600000000,
  },
  {
    id: 'post-2',
    author: 'Carlos Mendoza',
    initials: 'CM',
    color: '#7e907d',
    body: 'Comparto un resumen que hice del nuevo reglamento de mediación comunitaria. Creo que puede ser muy útil para quienes están viendo mecanismos alternativos de resolución de conflictos. 📄',
    tags: ['Mediación', 'Recursos'],
    likeCount: 42,
    commentCount: 15,
    createdAt: 1755592800000,
  },
  {
    id: 'post-3',
    author: 'Lucía Paredes',
    initials: 'LP',
    color: '#9f7f8c',
    body: 'Tip para estudiantes: el COGEP tiene muchos plazos y procedimientos que se confunden fácilmente. Les recomiendo hacer un cuadro comparativo entre proceso ordinario, sumario y ejecutivo. ¡Me salvó en el examen!',
    tags: ['Consejos', 'Estudiantes'],
    likeCount: 67,
    commentCount: 23,
    createdAt: 1755504000000,
  },
  {
    id: 'post-4',
    author: 'Andrea Ruiz',
    initials: 'AR',
    color: '#8b7d9b',
    body: '¿Sabían que según el Art. 169 de la Constitución, el sistema procesal es un medio para la realización de la justicia? Esto significa que las formalidades no deben prevalecer sobre el fondo del derecho. Un principio que muchos jueces olvidan.',
    tags: ['Constitucional', 'Debate'],
    likeCount: 89,
    commentCount: 31,
    createdAt: 1755417600000,
  },
];
