'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ExternalLink, Search } from 'lucide-react';

interface Resource {
  title: string;
  type: 'ley' | 'guia' | 'modelo' | 'glosario';
  description: string;
  category: string;
  url: string;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

const glossary: GlossaryTerm[] = [
  { term: 'Acción de protección', definition: 'Garantía constitucional que permite a cualquier persona acudir a un juez cuando sus derechos constitucionales han sido vulnerados por actos u omisiones de autoridad pública o particulares.' },
  { term: 'Alimentos', definition: 'Prestación económica que debe pagar una persona para cubrir las necesidades de otra (alimentación, educación, vivienda, salud) cuando hay obligación legal, como entre padres e hijos.' },
  { term: 'Arrendamiento', definition: 'Contrato por el cual una persona (arrendador) cede el uso de un bien, normalmente un inmueble, a otra (arrendatario) a cambio de un pago periódico llamado canon o renta.' },
  { term: 'Cédula de identidad', definition: 'Documento oficial de identificación de los ciudadanos ecuatorianos, emitido por el Registro Civil. En trámites legales suele requerirse el número de cédula.' },
  { term: 'Citación', definition: 'Acto procesal mediante el cual se notifica formalmente a una persona que existe un proceso judicial en su contra y se la convoca a comparecer.' },
  { term: 'Código Orgánico Integral Penal (COIP)', definition: 'Norma que regula el derecho penal ecuatoriano: qué conductas son infracciones, sus sanciones y el procedimiento para juzgarlas.' },
  { term: 'Código Orgánico General de Procesos (COGEP)', definition: 'Norma que regula los procedimientos judiciales en materias no penales en Ecuador: demanda, contestación, audiencias, pruebas, sentencia.' },
  { term: 'Conciliación', definition: 'Mecanismo alternativo de solución de conflictos en el que las partes, con ayuda de un mediador o conciliador, intentan llegar a un acuerdo voluntario sin ir a juicio.' },
  { term: 'Contrato', definition: 'Acuerdo de voluntades entre dos o más personas que crea, modifica o extingue obligaciones. Puede ser verbal o escrito según la ley.' },
  { term: 'Contrato a plazo fijo', definition: 'Contrato de trabajo con duración determinada. Si el empleador termina la relación antes de vencer el plazo, debe pagar los salarios que faltaban.' },
  { term: 'Contrato indefinido', definition: 'Contrato de trabajo sin fecha de término. Al despedir intempestivamente, el empleador debe pagar indemnización según el tiempo de servicio.' },
  { term: 'Demanda', definition: 'Acto procesal inicial por el cual una persona solicita al juez que resuelva un conflicto jurídico. Debe contener los hechos, la fundamentación legal y la pretensión.' },
  { term: 'Despido intempestivo', definition: 'Terminación unilateral del contrato de trabajo por parte del empleador, sin causa legal justificada. Genera derecho a indemnización conforme al Código del Trabajo.' },
  { term: 'Décimo tercer sueldo', definition: 'Remuneración adicional equivalente a la doceava parte de las remuneraciones anuales, que el empleador debe pagar a los trabajadores.' },
  { term: 'Décimo cuarto sueldo', definition: 'Bono anual que se paga al trabajador equivalente a una remuneración básica unificada, según la ley ecuatoriana.' },
  { term: 'Fondo de reserva', definition: 'Aporte mensual equivalente a una doceava parte de la remuneración, que el empleador deposita a favor del trabajador después de su primer año de servicio.' },
  { term: 'Hábeas corpus', definition: 'Garantía constitucional para proteger la libertad personal. Permite a una persona detenida solicitar su libertad si la detención es ilegal o arbitraria.' },
  { term: 'Hábeas data', definition: 'Garantía constitucional que protege el derecho a conocer, actualizar y rectificar la información que sobre una persona conste en entidades públicas o privadas.' },
  { term: 'Indemnización', definition: 'Compensación económica que debe pagar quien causa un daño o incumple una obligación. En materia laboral, compensa al trabajador por despido injustificado.' },
  { term: 'Juicio', definition: 'Proceso legal seguido ante un juez o tribunal para resolver un conflicto entre partes. Puede ser civil, penal, laboral, etc.' },
  { term: 'Legítima defensa', definition: 'Causa de justificación en materia penal: no se sanciona a quien actúa para defender su vida, integridad o bienes, o los de otro, ante una agresión ilegítima.' },
  { term: 'Mediación', definition: 'Mecanismo alternativo de resolución de conflictos donde un tercero imparcial (mediador) facilita el diálogo entre las partes para que lleguen a un acuerdo.' },
  { term: 'Notaría / Notario', definition: 'Funcionario público que da fe de actos y contratos, y otorga documentos públicos con valor legal, como escrituras, testamentos y poderes.' },
  { term: 'Pensión alimenticia', definition: 'Obligación de pagar alimentos. En Ecuador, la tabla de pensiones alimenticias establece montos según el ingreso del obligado y el número de alimentarios.' },
  { term: 'Poder', definition: 'Documento por el cual una persona (poderdante) autoriza a otra (apoderado) a realizar actos en su nombre, como firmar contratos o representarla en juicio.' },
  { term: 'Prescripción', definition: 'Extinción del derecho a exigir una obligación o a ejercer una acción por el paso del tiempo. En materia laboral, las acciones prescriben a los 3 años.' },
  { term: 'Prueba', definition: 'Medio utilizado en un proceso judicial para demostrar la veracidad de los hechos alegados: documentos, testigos, peritajes, inspecciones, etc.' },
  { term: 'Sentencia', definition: 'Resolución judicial que decide un proceso, condenando o absolviendo, o declarando derechos entre las partes. Puede ser apelada según la ley.' },
  { term: 'Tutela', definition: 'Institución por la cual una persona se encarga del cuidado y administración de los bienes de un menor o de una persona incapaz.' },
  { term: 'Vulneración', definition: 'Afectación o desconocimiento de un derecho garantizado por la ley o la Constitución. Ante ella, se pueden activar garantías como la acción de protección.' },
];

const resources: Resource[] = [
  {
    title: 'Constitución de la República del Ecuador',
    type: 'ley',
    description: 'Norma suprema del ordenamiento jurídico ecuatoriano, vigente desde 2008.',
    category: 'Constitución',
    url: 'https://www.lexis.com.ec/biblioteca/constitucion-republica-ecuador',
  },
  {
    title: 'Código Orgánico Integral Penal (COIP)',
    type: 'ley',
    description: 'Regula el poder punitivo del Estado, tipifica infracciones penales y establece procedimientos.',
    category: 'Códigos',
    url: 'https://www.lexis.com.ec/biblioteca/codigo-organico-integral-penal',
  },
  {
    title: 'Código del Trabajo',
    type: 'ley',
    description: 'Regula las relaciones entre empleadores y trabajadores. Contratos, jornadas, despidos y más.',
    category: 'Códigos',
    url: 'https://www.lexis.com.ec/biblioteca/codigo-trabajo',
  },
  {
    title: 'Código Civil',
    type: 'ley',
    description: 'Norma las relaciones civiles entre personas: contratos, propiedad, familia, sucesiones.',
    category: 'Códigos',
    url: 'https://www.lexis.com.ec/biblioteca/codigo-civil',
  },
  {
    title: 'COGEP — Código Orgánico General de Procesos',
    type: 'ley',
    description: 'Regula los procedimientos judiciales en materias no penales en Ecuador.',
    category: 'Códigos',
    url: 'https://www.lexis.com.ec/biblioteca/codigo-organico-general-procesos',
  },
  {
    title: 'Ley Orgánica de Defensa del Consumidor',
    type: 'ley',
    description: 'Protege los derechos de los consumidores y regula las relaciones de consumo.',
    category: 'Leyes Orgánicas',
    url: 'https://www.lexis.com.ec/biblioteca/ley-organica-defensa-consumidor',
  },
  {
    title: 'Guía: ¿Cómo redactar un contrato de arriendo?',
    type: 'guia',
    description: 'Paso a paso para elaborar un contrato de arrendamiento válido en Ecuador.',
    category: 'Guías',
    url: 'https://www.lexis.com.ec',
  },
  {
    title: 'Guía: Derechos laborales básicos del trabajador',
    type: 'guia',
    description: 'Lo que todo trabajador en Ecuador debe saber sobre sus derechos fundamentales.',
    category: 'Guías',
    url: 'https://www.lexis.com.ec',
  },
  {
    title: 'Modelo: Demanda de alimentos',
    type: 'modelo',
    description: 'Formato base para una demanda de pensión alimenticia ante juez de familia.',
    category: 'Modelos',
    url: 'https://www.lexis.com.ec',
  },
  {
    title: 'Modelo: Contrato de trabajo a plazo fijo',
    type: 'modelo',
    description: 'Plantilla editable de contrato laboral conforme al Código del Trabajo ecuatoriano.',
    category: 'Modelos',
    url: 'https://www.lexis.com.ec',
  },
];

const categories = ['Todos', 'Constitución', 'Códigos', 'Leyes Orgánicas', 'Guías', 'Modelos', 'Glosario'];

const typeLabels: Record<string, string> = {
  ley: 'LEY / CÓDIGO',
  guia: 'GUÍA PRÁCTICA',
  modelo: 'MODELO / PLANTILLA',
  glosario: 'GLOSARIO',
};

function BibliotecaContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('category') || '';

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery) setSearch(initialQuery);
  }, [initialQuery]);

  const filtered = resources.filter((r) => {
    const matchCategory = activeCategory === 'Todos' || r.category === activeCategory;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const showGlossary = activeCategory === 'Glosario';
  const glossaryFiltered = glossary.filter(
    (g) =>
      !search ||
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="library-page">
      <Link href="/" className="back">← Volver al inicio</Link>
      <p className="eyebrow">BIBLIOTECA JURÍDICA</p>
      <h1>Recursos legales de Ecuador</h1>
      <p className="lead">
        Accede a leyes, códigos, guías prácticas y modelos de documentos del ordenamiento jurídico ecuatoriano.
      </p>

      {/* Search */}
      <div style={{ margin: '24px 0 10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid var(--line)',
          borderRadius: '10px',
          padding: '11px 13px',
          maxWidth: '440px',
          background: '#fff',
        }}>
          <Search size={18} color="#999" />
          <input
            type="text"
            placeholder="Buscar por palabra clave (ej. laboral, contrato, penal)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              font: 'inherit',
              flex: 1,
              fontSize: '13px',
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="resource-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={activeCategory === cat ? 'active' : ''}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="results">{showGlossary ? `${glossaryFiltered.length} términos en el glosario` : `${filtered.length} recursos disponibles`}</p>

      {showGlossary ? (
        <div className="glossary-list">
          {glossaryFiltered.map((g) => (
            <article className="glossary-item" key={g.term}>
              <h3>{g.term}</h3>
              <p>{g.definition}</p>
            </article>
          ))}
          {glossaryFiltered.length === 0 && (
            <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
              No se encontraron términos con esos criterios.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Resource Grid */}
          <div className="resource-grid">
            {filtered.map((r, i) => (
              <article className="resource-card" key={i}>
                <span className="resource-type">{typeLabels[r.type]}</span>
                <h3>{r.title}</h3>
                <p>{r.description}</p>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  Consultar recurso <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
              No se encontraron recursos con esos criterios.
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default function BibliotecaPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Cargando biblioteca jurídica…</div>}>
      <BibliotecaContent />
    </Suspense>
  );
}
