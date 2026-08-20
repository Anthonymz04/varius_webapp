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
  {
    title: 'Glosario jurídico ecuatoriano',
    type: 'glosario',
    description: 'Términos legales comunes explicados en lenguaje sencillo para ciudadanos.',
    category: 'Glosario',
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

      <p className="results">{filtered.length} recursos disponibles</p>

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
