'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Laboral',
    question: '¿Cuánto tiempo tengo para reclamar un despido intempestivo en Ecuador?',
    answer: 'Según el Código del Trabajo de Ecuador, el trabajador tiene un plazo de 3 años para reclamar judicialmente los derechos derivados de un despido intempestivo, contados desde la fecha de terminación de la relación laboral. Es recomendable actuar lo antes posible para preservar las pruebas.',
  },
  {
    category: 'Laboral',
    question: '¿Cuáles son mis derechos al ser despedido?',
    answer: 'En caso de despido intempestivo, tienes derecho a: indemnización (equivalente al sueldo de un mes por cada año de servicio, con un mínimo de 3 meses), desahucio (25% de la última remuneración por cada año), proporcional de décimos, vacaciones no gozadas y fondos de reserva pendientes. El monto depende de tu antigüedad y remuneración.',
  },
  {
    category: 'Familia',
    question: '¿Cómo solicitar pensión alimenticia en Ecuador?',
    answer: 'Debes presentar la demanda ante un Juzgado de Familia, Mujer, Niñez y Adolescencia. Necesitas: cédula de identidad, partida de nacimiento del menor, y datos del demandado. La pensión se calcula según la Tabla de Pensiones Alimenticias del Consejo de la Judicatura, considerando los ingresos del alimentante y el número de dependientes.',
  },
  {
    category: 'Familia',
    question: '¿Cuánto es la pensión mínima de alimentos?',
    answer: 'La pensión mínima según la tabla vigente es aproximadamente el 28.12% de un salario básico unificado para un hijo. Este porcentaje varía según el nivel de ingresos del alimentante y el número de hijos. La tabla se actualiza anualmente.',
  },
  {
    category: 'Civil',
    question: '¿Qué necesito para hacer un contrato de arriendo válido?',
    answer: 'Un contrato de arrendamiento en Ecuador debe incluir: identificación de las partes (arrendador y arrendatario), descripción del inmueble, canon de arrendamiento, plazo del contrato, forma de pago, y garantías. Aunque puede ser verbal, se recomienda hacerlo por escrito y registrarlo en la notaría para mayor seguridad jurídica.',
  },
  {
    category: 'Civil',
    question: '¿Cómo puedo recuperar dinero que me deben?',
    answer: 'Primero intenta un arreglo extrajudicial (mediación). Si no funciona, puedes presentar una demanda por vía ejecutiva (si tienes un documento que pruebe la deuda como un pagaré o letra de cambio) o por vía ordinaria. Según el COGEP, el proceso ejecutivo es más rápido. Conserva toda evidencia: contratos, mensajes, transferencias bancarias.',
  },
  {
    category: 'Penal',
    question: '¿Qué hacer si soy víctima de estafa?',
    answer: 'Debes presentar una denuncia ante la Fiscalía General del Estado. Lleva toda la evidencia: mensajes, recibos, contratos, capturas de pantalla. Según el COIP (Art. 186), la estafa se sanciona con prisión de 1 a 5 años dependiendo del monto. También puedes solicitar medidas cautelares para proteger tus bienes.',
  },
  {
    category: 'Penal',
    question: '¿Cuánto tiempo dura un proceso penal en Ecuador?',
    answer: 'Depende del tipo de delito y la complejidad del caso. La instrucción fiscal puede durar entre 30 y 120 días. Luego viene la etapa intermedia y el juicio. En total, un proceso penal puede tomar entre 6 meses y 2 años. Los procesos de flagrancia son más rápidos (máximo 75 días).',
  },
  {
    category: 'Constitucional',
    question: '¿Qué es una acción de protección?',
    answer: 'Es una garantía jurisdiccional (Art. 88 de la Constitución) que permite a cualquier persona reclamar la protección de sus derechos constitucionales cuando son vulnerados por actos u omisiones de autoridades públicas. Se presenta ante un juez y tiene un trámite preferente y sumario. No requiere abogado para presentarla.',
  },
  {
    category: 'Constitucional',
    question: '¿Qué es el hábeas corpus y cuándo aplica?',
    answer: 'El hábeas corpus (Art. 89 de la Constitución) protege la libertad personal. Se puede presentar cuando una persona es privada de libertad de forma ilegal, arbitraria o ilegítima. Se presenta ante cualquier juez y el detenido debe ser presentado ante el juez dentro de las 24 horas.',
  },
];

const categories = ['Todos', 'Laboral', 'Familia', 'Civil', 'Penal', 'Constitucional'];

export default function PreguntasFrecuentesPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter((f) => activeCategory === 'Todos' || f.category === activeCategory);

  return (
    <section className="faq-page">
      <Link href="/" className="back">← Volver al inicio</Link>
      <p className="eyebrow">PREGUNTAS FRECUENTES</p>
      <h1>Dudas legales comunes en Ecuador</h1>
      <p className="lead">
        Respuestas claras a las preguntas más frecuentes sobre temas legales en Ecuador.
      </p>

      {/* Category Filter */}
      <div className="faq-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={activeCategory === cat ? 'active' : ''}
            onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      {filtered.map((faq, i) => (
        <div className={`faq-item ${openIndex === i ? 'open' : ''}`} key={i}>
          <button
            className="faq-question"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {faq.question}
            <ChevronDown size={18} />
          </button>
          {openIndex === i && (
            <div className="faq-answer">
              <p style={{ margin: 0 }}>{faq.answer}</p>
              <p style={{ marginTop: '12px', fontSize: '10px', color: '#aaa' }}>
                Categoría: {faq.category} · Esta información es orientativa.
              </p>
            </div>
          )}
        </div>
      ))}

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
          No hay preguntas en esta categoría aún.
        </p>
      )}

      {/* CTA */}
      <div className="faq-cta">
        <h3>¿No encontraste tu respuesta?</h3>
        <p>Nuestro asistente de inteligencia artificial puede ayudarte con consultas más específicas.</p>
        <Link href="/asistente">
          Consultar asistente IA <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
