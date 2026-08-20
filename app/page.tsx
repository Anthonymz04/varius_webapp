'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Bot,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  MoreHorizontal,
  Scale,
  Search,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import LawyerCard from '@/app/components/LawyerCard';
import AuthDialog from '@/app/components/AuthDialog';
import HeroCarousel from '@/app/components/HeroCarousel';
import type { LawyerData } from '@/app/components/LawyerCard';

/* ── Mock data ── */
const lawyers: LawyerData[] = [
  { name: 'Valentina Mena', role: 'Derecho de familia', city: 'Quito, Ecuador', rating: '4.9', reviews: '124 reseñas', price: '$45 / consulta', color: '#d8ad96', initials: 'VM' },
  { name: 'Santiago Rivas', role: 'Derecho laboral', city: 'Guayaquil, Ecuador', rating: '4.8', reviews: '98 reseñas', price: '$38 / consulta', color: '#7e907d', initials: 'SR' },
  { name: 'Elena Paredes', role: 'Propiedad intelectual', city: 'Atención virtual', rating: '5.0', reviews: '76 reseñas', price: '$55 / consulta', color: '#9f7f8c', initials: 'EP' },
];

const actions = [
  { icon: Bot, title: 'Consultar IA', text: 'Aclara una duda legal', tint: '#fae7ef', href: '/asistente' },
  { icon: Search, title: 'Buscar abogado', text: 'Encuentra al ideal para ti', tint: '#f4edda', href: '/abogados' },
  { icon: CalendarDays, title: 'Agendar asesoría', text: 'Reserva en pocos minutos', tint: '#e8f0e8', href: '/abogados' },
];

const actionsByRole: Record<string, typeof actions> = {
  citizen: actions,
  student: [
    { icon: GraduationCap, title: 'Tutorías', text: 'Clases 1:1 con profesionales', tint: '#f4edda', href: '/tutorias' },
    { icon: BookOpen, title: 'Biblioteca legal', text: 'Guías y recursos de estudio', tint: '#e8f0e8', href: '/biblioteca' },
    { icon: Users, title: 'Comunidad', text: 'Debate con otros estudiantes', tint: '#fae7ef', href: '/comunidad' },
    { icon: Bot, title: 'Consultar IA', text: 'Explica conceptos difíciles', tint: '#eef1f6', href: '/asistente' },
  ],
  lawyer: [
    { icon: Briefcase, title: 'Mis solicitudes', text: 'Atiende tus asesorías', tint: '#fae7ef', href: '/perfil' },
    { icon: Users, title: 'Comunidad', text: 'Comparte tu conocimiento', tint: '#e8f0e8', href: '/comunidad' },
    { icon: BookOpen, title: 'Biblioteca legal', text: 'Normativa siempre a mano', tint: '#f4edda', href: '/biblioteca' },
  ],
};

const roleLead: Record<string, string> = {
  citizen: 'Tu espacio para entender, aprender y avanzar con el Derecho.',
  student: 'Fórmate con tutorías, recursos y una comunidad que impulsa tu carrera.',
  lawyer: 'Gestiona tus asesorías, gana visibilidad y comparte tu conocimiento.',
};

/* ── Helpers ── */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function getFormattedDate(): string {
  return new Date()
    .toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^\w/, (c) => c.toUpperCase());
}

/* ══════════════════════════════════════════════════
   MAIN PAGE — switches between Landing & Dashboard
   ══════════════════════════════════════════════════ */
export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#999' }}>Cargando…</p>
      </div>
    );
  }

  if (!user) return <LandingPage />;
  return <Dashboard />;
}

/* ══════════════════════════════════════════════════
   LANDING PAGE — shown when NOT logged in
   ══════════════════════════════════════════════════ */
function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const faqs = [
    { q: '¿VARIUS reemplaza a un abogado?', a: 'No. VARIUS ofrece orientación educativa general. Para casos específicos, te conectamos con profesionales verificados.' },
    { q: '¿Qué tipo de consultas puedo hacer a la IA?', a: 'Puedes hacer consultas sobre derecho laboral, civil, penal, familiar y constitucional de Ecuador. La IA te orienta de forma general.' },
    { q: '¿Es gratis?', a: 'Sí. El acceso básico a la plataforma, la IA orientativa y la biblioteca jurídica son gratuitos en el MVP.' },
  ];

  return (
    <>
      {/* Hero Carousel (Full-bleed slider) */}
      <HeroCarousel onOpenAuth={() => setAuthOpen(true)} />

      {/* How it works (White background section + centered container) */}
      <section className="landing-section">
        <div className="landing-container">
          <p className="eyebrow">¿CÓMO FUNCIONA?</p>
          <h2>Tres pasos para acceder al Derecho</h2>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="step-number">1</div>
              <h3>Elige tu perfil</h3>
              <p>Ciudadano, estudiante o abogado. Cada uno tiene una experiencia adaptada.</p>
            </div>
            <div className="landing-step">
              <div className="step-number">2</div>
              <h3>Identifica tu necesidad</h3>
              <p>Consulta la IA, busca un abogado o explora recursos legales de Ecuador.</p>
            </div>
            <div className="landing-step">
              <div className="step-number">3</div>
              <h3>Conecta con la solución</h3>
              <p>Te orientamos hacia el profesional, recurso o herramienta adecuada.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits (Light gray background section + centered container) */}
      <section className="landing-section landing-benefits">
        <div className="landing-container">
          <p className="eyebrow">¿POR QUÉ VARIUS?</p>
          <h2>Un ecosistema jurídico integral</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <Bot size={28} />
              <h3>Asistente IA jurídico</h3>
              <p>Resuelve dudas legales al instante con inteligencia artificial enfocada en legislación ecuatoriana.</p>
            </div>
            <div className="benefit-card">
              <Users size={28} />
              <h3>Abogados verificados</h3>
              <p>Conecta con profesionales reales filtrados por especialidad, ciudad y calificación.</p>
            </div>
            <div className="benefit-card">
              <Scale size={28} />
              <h3>Biblioteca legal</h3>
              <p>Constitución, COIP, Código del Trabajo, guías prácticas y modelos de documentos.</p>
            </div>
            <div className="benefit-card">
              <Shield size={28} />
              <h3>Seguro y confiable</h3>
              <p>Información verificada con disclaimers legales. La IA orienta, los profesionales acompañan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lawyers preview (White background section + centered container) */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-title">
            <div>
              <p className="eyebrow">PROFESIONALES VERIFICADOS</p>
              <h2>Expertos que te acompañan</h2>
            </div>
            <Link href="/abogados" className="link">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="landing-lawyers">
            {lawyers.map((l) => (
              <LawyerCard lawyer={l} key={l.name} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <button className="landing-btn primary compact" onClick={() => setAuthOpen(true)}>
              <span>Acceder para contactar</span> <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Library preview (Light gray background section + centered container) */}
      <section className="landing-section landing-library-preview">
        <div className="landing-container">
          <div className="section-title">
            <div>
              <p className="eyebrow">BIBLIOTECA JURÍDICA</p>
              <h2>Recursos legales de Ecuador</h2>
            </div>
          </div>
          <div className="library-preview-grid">
            {[
              { title: 'Constitución de la República', type: 'LEY', desc: 'Norma suprema vigente desde 2008.' },
              { title: 'Código del Trabajo', type: 'CÓDIGO', desc: 'Relaciones entre empleadores y trabajadores.' },
              { title: 'COIP', type: 'CÓDIGO', desc: 'Código Orgánico Integral Penal.' },
              { title: 'Guía: Contrato de arriendo', type: 'GUÍA', desc: 'Paso a paso para un contrato válido.' },
            ].map((r, i) => (
              <div className="library-preview-card" key={i}>
                <span className="resource-type">{r.type}</span>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link href="/biblioteca" className="landing-btn secondary-dark compact">
              <span>Explorar biblioteca completa</span> <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ (White background section + centered container) */}
      <section className="landing-section">
        <div className="landing-container">
          <p className="eyebrow">PREGUNTAS FRECUENTES</p>
          <h2>¿Tienes dudas sobre VARIUS?</h2>
          <div style={{ maxWidth: '720px', margin: '28px auto 0' }}>
            {faqs.map((faq, i) => (
              <div className={`faq-item ${faqOpen === i ? 'open' : ''}`} key={i}>
                <button className="faq-question" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {faq.q}
                  <ChevronDown size={18} />
                </button>
                {faqOpen === i && (
                  <div className="faq-answer">
                    <p style={{ margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/preguntas-frecuentes" className="link" style={{ justifyContent: 'center' }}>
              Ver todas las preguntas <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {authOpen && <AuthDialog user={null} close={() => setAuthOpen(false)} />}
    </>
  );
}

/* ══════════════════════════════════════════════════
   DASHBOARD — shown when logged in
   ══════════════════════════════════════════════════ */
function Dashboard() {
  const { user, role } = useAuth();
  const displayName = user?.displayName?.split(' ')[0] || 'Usuario';
  const greeting = getGreeting();
  const formattedDate = getFormattedDate();
  const roleActions = role && actionsByRole[role] ? actionsByRole[role] : actions;

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div>
          <p className="eyebrow">{formattedDate.toUpperCase()}</p>
          <h1>
            {greeting}, {displayName} <span>✦</span>
          </h1>
          <p className="lead">{roleLead[role ?? 'citizen']}</p>
        </div>
        <div className="progress-card">
          <div className="progress-top">
            <span>Tu progreso</span>
            <strong>68%</strong>
          </div>
          <div className="progress-bar">
            <i />
          </div>
          <p>Vas muy bien. Sigue así.</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">¿CÓMO PODEMOS AYUDARTE?</p>
            <h2>Tu Derecho, a un clic</h2>
          </div>
          <Link href="/biblioteca" className="link">
            Ver todo <ArrowRight size={16} />
          </Link>
        </div>
        <div className="action-grid">
          {roleActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link className="action-card" key={a.title} href={a.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <span style={{ background: a.tint }}>
                  <Icon size={23} />
                </span>
                <b>{a.title}</b>
                <small>{a.text}</small>
                <ArrowRight className="card-arrow" size={18} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Two Column: Recommended Lawyers + Learning */}
      <section className="two-col">
        <div className="section">
          <div className="section-title">
            <div>
              <p className="eyebrow">RECOMENDADOS PARA TI</p>
              <h2>Expertos que te acompañan</h2>
            </div>
            <Link href="/abogados" className="link">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="lawyer-list">
            {lawyers.slice(0, 2).map((l) => (
              <LawyerCard lawyer={l} key={l.name} />
            ))}
          </div>
        </div>

        <div className="section continue">
          <div className="section-title">
            <div>
              <p className="eyebrow">SIGUE APRENDIENDO</p>
              <h2>Tu ruta de aprendizaje</h2>
            </div>
            <button className="dots">
              <MoreHorizontal />
            </button>
          </div>
          <article className="course">
            <div className="course-visual">
              <Scale />
              <span>01</span>
            </div>
            <div>
              <label>CURSO EN PROGRESO</label>
              <h3>
                Fundamentos del
                <br />
                Derecho laboral
              </h3>
              <div className="course-foot">
                <div className="tiny-progress">
                  <i />
                </div>
                <b>6 de 9 lecciones</b>
              </div>
            </div>
            <ArrowRight size={19} />
          </article>
        </div>
      </section>

      {/* News */}
      <section className="news">
        <div className="section-title">
          <div>
            <p className="eyebrow">ACTUALIDAD</p>
            <h2>El Derecho, hoy</h2>
          </div>
          <Link href="/biblioteca" className="link">
            Ver noticias <ArrowRight size={16} />
          </Link>
        </div>
        <div className="news-grid">
          <article>
            <span className="tag">DERECHO LABORAL</span>
            <h3>Nuevos criterios para los contratos de trabajo</h3>
            <p>Una guía clara para comprender qué cambia y cómo te afecta.</p>
            <small>Hace 2 horas · 5 min lectura</small>
          </article>
          <article className="news-accent">
            <Sparkles />
            <h3>Aprende con propósito</h3>
            <p>
              Accede a contenidos creados por profesionales que ejercen el Derecho
              cada día.
            </p>
            <Link href="/biblioteca" style={{ color: '#fff', textDecoration: 'none', fontSize: '11px', display: 'flex', gap: '5px', alignItems: 'center' }}>
              Explorar biblioteca <ArrowRight size={15} />
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
