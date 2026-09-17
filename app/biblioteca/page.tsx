'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Download, ExternalLink, Search, X } from 'lucide-react';

interface Resource {
  title: string;
  type: 'ley' | 'glosario';
  description: string;
  category: string;
  driveId: string;
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
  { term: 'Fondo de reserva', definition: 'Aporte mensual equivalente a una doceava parte de la remuneración, que el empleador deposita a favor del trabajador después del primer año.' },
  { term: 'Hábeas corpus', definition: 'Garantía constitucional para proteger la libertad y la integridad personal de quien sea detenido ilegal o arbitrariamente.' },
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
    driveId: '1j08hDgZlsIhHfWXshhxzhNjcB7_RrQ1q',
    url: 'https://drive.google.com/file/d/1j08hDgZlsIhHfWXshhxzhNjcB7_RrQ1q/view?usp=sharing',
  },
  {
    title: 'Código Orgánico Administrativo',
    type: 'ley',
    description: 'Regula la organización y funcionamiento del sector público ecuatoriano.',
    category: 'Códigos',
    driveId: '1rQEbETJhgU4Prttvwgf98OifPUzFQwT_',
    url: 'https://drive.google.com/file/d/1rQEbETJhgU4Prttvwgf98OifPUzFQwT_/view?usp=sharing',
  },
  {
    title: 'Código Civil',
    type: 'ley',
    description: 'Norma las relaciones civiles entre personas: contratos, propiedad, familia, sucesiones.',
    category: 'Códigos',
    driveId: '1CivtT-U_3w28-RZOUazSJfWH1wD-kll0',
    url: 'https://drive.google.com/file/d/1CivtT-U_3w28-RZOUazSJfWH1wD-kll0/view?usp=sharing',
  },
  {
    title: 'Código de Comercio',
    type: 'ley',
    description: 'Regula la actividad comercial: comerciantes, obligaciones y títulos de crédito.',
    category: 'Códigos',
    driveId: '1w1lrP-5bahyziyJZmTrlWuLkNf1dbwn4',
    url: 'https://drive.google.com/file/d/1w1lrP-5bahyziyJZmTrlWuLkNf1dbwn4/view?usp=sharing',
  },
  {
    title: 'Código de la Niñez y Adolescencia',
    type: 'ley',
    description: 'Regula los derechos, garantías y deberes de niños, niñas y adolescentes en Ecuador.',
    category: 'Códigos',
    driveId: '1qYbbHP24HRI1saiFMeap9ssua2Z6YpGX',
    url: 'https://drive.google.com/file/d/1qYbbHP24HRI1saiFMeap9ssua2Z6YpGX/view?usp=sharing',
  },
  {
    title: 'Código del Trabajo',
    type: 'ley',
    description: 'Regula las relaciones entre empleadores y trabajadores. Contratos, jornadas, despidos y más.',
    category: 'Códigos',
    driveId: '1GJqbEeiUSLRvaud86kknrKIabVb_7ifg',
    url: 'https://drive.google.com/file/d/1GJqbEeiUSLRvaud86kknrKIabVb_7ifg/view?usp=sharing',
  },
  {
    title: 'Código Orgánico de la Función Judicial',
    type: 'ley',
    description: 'Regula la organización, competencias y funcionamiento de la Función Judicial.',
    category: 'Códigos',
    driveId: '175P_jaaABnprF8mc53xe3v9hXl2F5eAi',
    url: 'https://drive.google.com/file/d/175P_jaaABnprF8mc53xe3v9hXl2F5eAi/view?usp=sharing',
  },
  {
    title: 'Código Orgánico del Ambiente',
    type: 'ley',
    description: 'Regula la gestión ambiental, la biodiversidad y los recursos naturales.',
    category: 'Códigos',
    driveId: '1dpgOBaezPUXeJGk8m_neHXhwgFuJsemK',
    url: 'https://drive.google.com/file/d/1dpgOBaezPUXeJGk8m_neHXhwgFuJsemK/view?usp=sharing',
  },
  {
    title: 'Código Orgánico Tributario',
    type: 'ley',
    description: 'Regula las obligaciones tributarias, el SRI y los procedimientos de recaudación.',
    category: 'Códigos',
    driveId: '10arwalPhM4xsTZ_pfVgbKRLxXgyNsQTC',
    url: 'https://drive.google.com/file/d/10arwalPhM4xsTZ_pfVgbKRLxXgyNsQTC/view?usp=sharing',
  },
  {
    title: 'COGEP — Código Orgánico General de Procesos',
    type: 'ley',
    description: 'Regula los procedimientos judiciales en materias no penales en Ecuador.',
    category: 'Códigos',
    driveId: '1Pr6PB6WyoHPSN__Qvvya-_rI_Anqmg8t',
    url: 'https://drive.google.com/file/d/1Pr6PB6WyoHPSN__Qvvya-_rI_Anqmg8t/view?usp=sharing',
  },
  {
    title: 'COIP — Código Orgánico Integral Penal',
    type: 'ley',
    description: 'Regula el poder punitivo del Estado, tipifica infracciones penales y establece procedimientos.',
    category: 'Códigos',
    driveId: '1dMNsqoKp95kzL-hyD_80tH6rDAVqnNTr',
    url: 'https://drive.google.com/file/d/1dMNsqoKp95kzL-hyD_80tH6rDAVqnNTr/view?usp=sharing',
  },
  {
    title: 'Ley de Arbitraje y Mediación',
    type: 'ley',
    description: 'Regula el arbitraje y la mediación como medios alternativos de solución de conflictos.',
    category: 'Leyes',
    driveId: '1M2tI2b4dEzoSH-G1zK4cPilMxg43rqMA',
    url: 'https://drive.google.com/file/d/1M2tI2b4dEzoSH-G1zK4cPilMxg43rqMA/view?usp=sharing',
  },
  {
    title: 'Ley de Compañías',
    type: 'ley',
    description: 'Regula la constitución, funcionamiento y disolución de compañías en Ecuador.',
    category: 'Leyes',
    driveId: '1xpGqzFsFJw7oV3vXyNMstQPOZ7oCYMEx',
    url: 'https://drive.google.com/file/d/1xpGqzFsFJw7oV3vXyNMstQPOZ7oCYMEx/view?usp=sharing',
  },
  {
    title: 'LOEP — Ley Orgánica de Empleo Público',
    type: 'ley',
    description: 'Regula el empleo público, la carrera administrativa y la gestión de personas del Estado.',
    category: 'Leyes',
    driveId: '17XjsE8IOpMZyJ5NG355Mt7gjUlaAZkSM',
    url: 'https://drive.google.com/file/d/17XjsE8IOpMZyJ5NG355Mt7gjUlaAZkSM/view?usp=sharing',
  },
  {
    title: 'LOSEP — Ley Orgánica de Servicio Público',
    type: 'ley',
    description: 'Regula el servicio público, la carrera y el régimen laboral de las servidoras y servidores.',
    category: 'Leyes',
    driveId: '1EjtQ3vU_jTPthkysJFEgDAxqaponmlmN',
    url: 'https://drive.google.com/file/d/1EjtQ3vU_jTPthkysJFEgDAxqaponmlmN/view?usp=sharing',
  },
];

const categories = ['Todos', 'Constitución', 'Códigos', 'Leyes', 'Glosario'];

const typeLabels: Record<string, string> = {
  ley: 'LEY / CÓDIGO',
  glosario: 'GLOSARIO',
};

function ResourceModal({ resource, close }: { resource: Resource; close: () => void }) {
  return (
    <div className="dialog-bg" onClick={close}>
      <div className="resource-viewer" onClick={(e) => e.stopPropagation()}>
        <div className="resource-viewer-top">
          <div>
            <h2>{resource.title}</h2>
            <small>{typeLabels[resource.type]}</small>
          </div>
          <button className="close-btn" onClick={close} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <iframe
          src={`https://drive.google.com/file/d/${resource.driveId}/preview`}
          title={resource.title}
          allow="autoplay"
          className="resource-viewer-frame"
        />
        <div className="resource-viewer-actions">
          <a
            className="landing-btn compact"
            href={`https://drive.google.com/uc?export=download&id=${resource.driveId}`}
            download
          >
            <Download size={14} /> Descargar
          </a>
          <a className="landing-btn secondary compact" href={resource.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} /> Abrir en Drive
          </a>
        </div>
      </div>
    </div>
  );
}

function BibliotecaContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('category') || '';

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState(initialQuery);
  const [viewer, setViewer] = useState<Resource | null>(null);

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
      <Link href="/" className="back" aria-label="Volver al inicio"><ArrowLeft size={16} /></Link>
      <p className="eyebrow">BIBLIOTECA JURÍDICA</p>
      <h1>Recursos legales de Ecuador</h1>
      <p className="lead">
        Consulta y descarga la normativa ecuatoriana directamente desde la app: códigos, leyes y glosario jurídico.
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
            {filtered.map((r) => (
              <article className="resource-card" key={r.driveId}>
                <span className="resource-type">{typeLabels[r.type]}</span>
                <h3>{r.title}</h3>
                <p>{r.description}</p>
                <button className="resource-open" onClick={() => setViewer(r)}>
                  <BookOpen size={14} /> Leer en la app
                </button>
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

      {viewer && <ResourceModal resource={viewer} close={() => setViewer(null)} />}
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
