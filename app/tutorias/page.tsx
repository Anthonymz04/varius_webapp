'use client';

import Link from 'next/link';
import { BookOpen, Clock, Scale, Shield, Users } from 'lucide-react';

const tutorials = [
  {
    icon: Scale,
    label: 'DERECHO LABORAL',
    title: 'Cómo redactar un contrato de trabajo',
    description: 'Aprende los elementos esenciales que debe contener un contrato de trabajo válido según el Código del Trabajo ecuatoriano.',
    level: 'Básico',
    duration: '15 min',
  },
  {
    icon: Shield,
    label: 'DERECHO CIVIL',
    title: 'Paso a paso: contrato de arriendo',
    description: 'Guía práctica para elaborar un contrato de arrendamiento que proteja tanto al arrendador como al arrendatario.',
    level: 'Básico',
    duration: '12 min',
  },
  {
    icon: Users,
    label: 'DERECHO DE FAMILIA',
    title: 'Guía para solicitar pensión alimenticia',
    description: 'Todo lo que necesitas saber para presentar una demanda de alimentos: requisitos, documentos y proceso.',
    level: 'Intermedio',
    duration: '20 min',
  },
  {
    icon: Scale,
    label: 'DERECHO PENAL',
    title: 'Qué hacer si eres víctima de un delito',
    description: 'Pasos a seguir para denunciar un delito ante la Fiscalía General del Estado de Ecuador.',
    level: 'Básico',
    duration: '10 min',
  },
  {
    icon: BookOpen,
    label: 'DERECHO CONSTITUCIONAL',
    title: 'Garantías jurisdiccionales explicadas',
    description: 'Entiende la acción de protección, hábeas corpus, hábeas data y acceso a la información pública.',
    level: 'Intermedio',
    duration: '25 min',
  },
  {
    icon: Shield,
    label: 'DERECHO DEL CONSUMIDOR',
    title: 'Tus derechos como consumidor en Ecuador',
    description: 'Aprende a reclamar ante productos defectuosos, publicidad engañosa y servicios incumplidos.',
    level: 'Básico',
    duration: '15 min',
  },
];

export default function TutoriasPage() {
  return (
    <section className="tutorials-page">
      <Link href="/" className="back">← Volver al inicio</Link>
      <p className="eyebrow">TUTORÍAS Y GUÍAS</p>
      <h1>Aprende Derecho de forma práctica</h1>
      <p className="lead">
        Guías paso a paso creadas por profesionales del Derecho ecuatoriano para que aprendas a resolver situaciones legales comunes.
      </p>

      <div className="tutorial-grid">
        {tutorials.map((t, i) => {
          const Icon = t.icon;
          return (
            <article className="tutorial-card" key={i}>
              <div className="tutorial-visual">
                <Icon size={40} />
              </div>
              <div className="tutorial-body">
                <label>{t.label}</label>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
                <div className="tutorial-meta">
                  <span>📚 {t.level}</span>
                  <span>⏱ {t.duration}</span>
                </div>
                <button className="coming-soon-btn">
                  Próximamente
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
