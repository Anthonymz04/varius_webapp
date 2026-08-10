'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

const posts = [
  {
    author: 'María González',
    initials: 'MG',
    color: '#d8ad96',
    time: 'Hace 3 horas',
    body: '¿Alguien ha tenido experiencia con acciones de protección por vulneración de derechos laborales? Me despidieron estando embarazada y quiero saber si es viable esta vía además de la demanda laboral.',
    tags: ['Derecho laboral', 'Constitucional'],
    likes: 24,
    comments: 8,
  },
  {
    author: 'Carlos Mendoza',
    initials: 'CM',
    color: '#7e907d',
    time: 'Hace 5 horas',
    body: 'Comparto un resumen que hice del nuevo reglamento de mediación comunitaria. Creo que puede ser muy útil para quienes están viendo mecanismos alternativos de resolución de conflictos. 📄',
    tags: ['Mediación', 'Recursos'],
    likes: 42,
    comments: 15,
  },
  {
    author: 'Lucía Paredes',
    initials: 'LP',
    color: '#9f7f8c',
    time: 'Hace 1 día',
    body: 'Tip para estudiantes: el COGEP tiene muchos plazos y procedimientos que se confunden fácilmente. Les recomiendo hacer un cuadro comparativo entre proceso ordinario, sumario y ejecutivo. ¡Me salvó en el examen!',
    tags: ['Consejos', 'Estudiantes'],
    likes: 67,
    comments: 23,
  },
  {
    author: 'Andrea Ruiz',
    initials: 'AR',
    color: '#8b7d9b',
    time: 'Hace 2 días',
    body: '¿Sabían que según el Art. 169 de la Constitución, el sistema procesal es un medio para la realización de la justicia? Esto significa que las formalidades no deben prevalecer sobre el fondo del derecho. Un principio que muchos jueces olvidan.',
    tags: ['Constitucional', 'Debate'],
    likes: 89,
    comments: 31,
  },
];

export default function ComunidadPage() {
  return (
    <section className="community-page">
      <Link href="/" className="back">← Volver al inicio</Link>
      <p className="eyebrow">COMUNIDAD VARIUS</p>
      <h1>Conecta con la comunidad jurídica</h1>
      <p className="lead">
        Un espacio para debatir, compartir conocimientos y crecer junto a otros estudiantes y profesionales del Derecho.
      </p>

      {/* Create Post (disabled) */}
      <div style={{
        margin: '30px 0 24px',
        padding: '18px 22px',
        border: '1px solid var(--line)',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        opacity: 0.6,
      }}>
        <div className="avatar" style={{ background: '#ccc', width: '36px', height: '36px', fontSize: '11px' }}>?</div>
        <span style={{ color: '#999', fontSize: '13px', flex: 1 }}>¿Qué quieres compartir?</span>
        <span style={{ fontSize: '11px', color: 'var(--wine)', fontWeight: 600 }}>Próximamente</span>
      </div>

      {/* Posts */}
      {posts.map((post, i) => (
        <article className="community-post" key={i}>
          <div className="community-post-header">
            <div className="avatar" style={{ background: post.color }}>
              {post.initials}
            </div>
            <div>
              <b>{post.author}</b>
              <small>{post.time}</small>
            </div>
          </div>
          <p>{post.body}</p>
          <div className="community-post-tags">
            {post.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="community-post-actions">
            <button>
              <Heart size={15} /> {post.likes}
            </button>
            <button>
              <MessageCircle size={15} /> {post.comments}
            </button>
            <button>
              <Share2 size={15} /> Compartir
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
