export const profile = {
  name: 'Ignacio Cisternas',
  username: 'nachodev-ui',
  location: 'Santiago, Chile',
  github: 'https://github.com/nachodev-ui',
  // Add your preferred public email to enable direct email contact.
  email: '',
  intro: 'Transformo ideas en interfaces con personalidad y datos en decisiones. Desarrollo experiencias web, aplicaciones y las conexiones que las hacen funcionar.',
};

export const sections = [
  { id: 'inicio', label: 'Inicio', eyebrow: 'Tu próxima conexión', note: 'Toda buena historia empieza con una idea.' },
  { id: 'perfil', label: 'Mi persona', eyebrow: 'Detrás del código', note: 'Curiosidad, criterio y ganas de construir.' },
  { id: 'proyectos', label: 'Proyectos', eyebrow: 'Misiones en el mundo real', note: 'Ideas que salieron del papel.' },
  { id: 'habilidades', label: 'Habilidades', eyebrow: 'Mi arsenal', note: 'Las herramientas detrás de cada solución.' },
  { id: 'trayectoria', label: 'Trayectoria', eyebrow: 'El camino recorrido', note: 'Cada experiencia desbloquea algo nuevo.' },
  { id: 'contacto', label: 'Contacto', eyebrow: 'El próximo capítulo', note: 'Las mejores ideas se construyen en equipo.' },
] as const;
export type SectionId = typeof sections[number]['id'];
export type Category = 'Todos' | 'Frontend' | 'Backend' | 'Datos';
export interface Project {
  id: string;
  number: string;
  category: Exclude<Category, 'Todos'>;
  name: string;
  subtitle: string;
  description: string;
  challenge: string;
  solution: string;
  features: string[];
  stack: string[];
  repository: string;
  demo?: string;
  demoLabel?: string;
}
export const projects: Project[] = [
  {
    id: 'calculator', number: '01', category: 'Frontend', name: 'Albion Calculator',
    subtitle: 'Menos suposiciones. Mejores decisiones.',
    description: 'Calculadora de producción y análisis económico para Albion Online. Costes, retorno de materiales y oportunidades de mercado en una sola interfaz.',
    challenge: 'Decidir qué fabricar exige cruzar precios, ciudades, impuestos, retorno de recursos y liquidez. Un precio atractivo por sí solo no cuenta toda la historia.',
    solution: 'Una aplicación que reúne esas variables y hace visibles los costes, el beneficio y la calidad de los datos antes de comprometer recursos.',
    features: ['Crafteo y refinamiento con retorno configurable.', 'Optimizador por ciudad con señales de liquidez.', 'Historial de precios y análisis del Black Market.', 'Progreso de fama y diarios de producción.'],
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Vite'],
    repository: 'https://github.com/nachodev-ui/albion-production-calculator',
    demo: 'https://albioncalculator.app/', demoLabel: 'Abrir aplicación',
  },
  {
    id: 'api', number: '02', category: 'Backend', name: 'Albion Market API',
    subtitle: 'El motor detrás del mercado.',
    description: 'API central que consolida precios e historial y los sirve a la calculadora mediante contratos públicos.',
    challenge: 'Recibir capturas repetidas y convertirlas en un historial consistente sin duplicar información ni perder trazabilidad.',
    solution: 'Ingesta autenticada e idempotente, almacenamiento en PostgreSQL y un modelo de consulta separado de los registros de auditoría.',
    features: ['Ingesta por lotes y deduplicación por request_id.', 'Contratos públicos para precios e historial.', 'Métricas, health checks y logs estructurados.', 'Migraciones y despliegues reproducibles.'],
    stack: ['Go', 'PostgreSQL', 'pgx', 'OpenAPI', 'Docker'],
    repository: 'https://github.com/nachodev-ui/albion-market-api',
    demo: 'https://nachodev-ui.github.io/albion-market-api/', demoLabel: 'Ver documentación',
  },
  {
    id: 'pipeline', number: '03', category: 'Datos', name: 'Market Data Platform',
    subtitle: 'Cada dato tiene un recorrido.',
    description: 'Captura, normalización y entrega confiable de datos de mercado desde Albion Data Client hasta la API central.',
    challenge: 'Mantener la información capturada aunque la conexión o el servicio de destino fallen temporalmente.',
    solution: 'Persistir antes de enviar. Una outbox durable conserva los lotes pendientes y permite reintentos y recuperación tras reinicios.',
    features: ['Normalización de precios, mercados y timestamps.', 'Evidencia raw y registros normalizados.', 'Outbox persistente, reintentos y dead-letter.', 'API local de consulta y métricas de diagnóstico.'],
    stack: ['Ingesta de datos', 'JSONL', 'REST', 'Prometheus'],
    repository: 'https://github.com/nachodev-ui/albion-market-data-platform',
    demo: 'https://nachodev-ui.github.io/albion-market-data-platform/', demoLabel: 'Ver documentación',
  },
];
export const skillGroups = [
  { symbol: '</>', name: 'Interfaces', category: 'FRONTEND', description: 'Experiencias claras, adaptables y con identidad.', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand'] },
  { symbol: '[ ]', name: 'Aplicaciones', category: 'MOBILE', description: 'Ideas que también caben en un bolsillo.', items: ['React Native', 'Expo', 'Expo Router', 'Kotlin'] },
  { symbol: '{ }', name: 'Conexiones', category: 'BACKEND', description: 'La lógica que conecta una interfaz con sus datos.', items: ['Node.js', 'Express', 'Go', 'REST', 'PostgreSQL'] },
  { symbol: 'Σ', name: 'Perspectiva', category: 'DATOS & BI', description: 'Información que ayuda a entender y decidir.', items: ['Snowflake', 'Azure Data Factory', 'Power BI', 'Python', 'Streamlit'] },
];
