'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bot,
  BookOpen,
  Briefcase,
  CalendarDays,
  ChevronDown,
  FileText,
  GraduationCap,
  History,
  Info,
  Menu,
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
import { fetchLawyers, fetchMyRequests, type Lawyer } from '@/lib/firebase/marketplace';
import { fetchMisReservas } from '@/lib/firebase/tutorias';
import { fetchConsultations } from '@/lib/firebase/consultations';
import { fetchHistory, type HistoryItem } from '@/lib/firebase/notifications';

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

interface MobileAction {
  icon: typeof Bot;
  title: string;
  href?: string;
  action?: 'menu';
}

const mobileActionsByRole: Record<string, MobileAction[]> = {
  citizen: [
    { icon: Bot, title: 'Consulta IA', href: '/asistente' },
    { icon: Search, title: 'Buscar abogado', href: '/abogados' },
    { icon: CalendarDays, title: 'Agendar asesoría', href: '/abogados' },
    { icon: BookOpen, title: 'Biblioteca', href: '/biblioteca' },
    { icon: GraduationCap, title: 'Tutorías', href: '/tutorias' },
    { icon: Users, title: 'Comunidad', href: '/comunidad' },
    { icon: Info, title: 'Nosotros', href: '/nosotros' },
    { icon: Menu, title: 'Más', action: 'menu' },
  ],
  student: [
    { icon: GraduationCap, title: 'Tutorías', href: '/tutorias' },
    { icon: BookOpen, title: 'Biblioteca', href: '/biblioteca' },
    { icon: Bot, title: 'Consulta IA', href: '/asistente' },
    { icon: Users, title: 'Comunidad', href: '/comunidad' },
    { icon: Search, title: 'Buscar abogado', href: '/abogados' },
    { icon: CalendarDays, title: 'Agendar asesoría', href: '/abogados' },
    { icon: Info, title: 'Nosotros', href: '/nosotros' },
    { icon: Menu, title: 'Más', action: 'menu' },
  ],
  lawyer: [
    { icon: Briefcase, title: 'Mi perfil', href: '/perfil' },
    { icon: Users, title: 'Comunidad', href: '/comunidad' },
    { icon: BookOpen, title: 'Biblioteca', href: '/biblioteca' },
    { icon: Bot, title: 'Consulta IA', href: '/asistente' },
    { icon: Search, title: 'Buscar abogado', href: '/abogados' },
    { icon: CalendarDays, title: 'Agendar asesoría', href: '/abogados' },
    { icon: Info, title: 'Nosotros', href: '/nosotros' },
    { icon: Menu, title: 'Más', action: 'menu' },
  ],
};

const roleLead: Record<string, string> = {
  citizen: 'Tu espacio para entender, aprender y avanzar con el Derecho.',
  student: 'Fórmate con tutorías, recursos y una comunidad que impulsa tu carrera.',
  lawyer: 'Gestiona tus asesorías, gana visibilidad y comparte tu conocimiento.',
};

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

function useLawyers(limitCount: number) {
  const [list, setList] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetchLawyers()
      .then((l) => {
        if (active) setList(l.slice(0, limitCount));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [limitCount]);
  return { list, loading };
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
  const { list: lawyers, loading: lawyersLoading } = useLawyers(3);

  const faqs = [
    { q: '¿VARIUS reemplaza a un abogado?', a: 'No. VARIUS ofrece orientación educativa general. Para casos específicos, te conectamos con profesionales verificados.' },
    { q: '¿Qué tipo de consultas puedo hacer a la IA?', a: 'Puedes hacer consultas sobre derecho laboral, civil, penal, familiar y constitucional de Ecuador. La IA te orienta de forma general.' },
    { q: '¿Es gratis?', a: 'Sí. El acceso básico a la plataforma, la IA orientativa y la biblioteca jurídica son gratuitos en el MVP.' },
  ];

  return (
    <>
      <HeroCarousel onOpenAuth={() => setAuthOpen(true)} />
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
          {lawyersLoading ? (
            <p style={{ color: '#999' }}>Cargando profesionales…</p>
          ) : (
            <div className="landing-lawyers">
              {lawyers.map((l) => (
                <LawyerCard lawyer={l} key={l.id} />
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <button className="landing-btn primary compact" onClick={() => setAuthOpen(true)}>
              <span>Acceder para contactar</span> <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
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
   DASHBOARD — shown when logged in (real data only)
   ══════════════════════════════════════════════════ */
function Dashboard() {
  const { user, role } = useAuth();
  const displayName = user?.displayName?.split(' ')[0] || 'Usuario';
  const greeting = getGreeting();
  const formattedDate = getFormattedDate();
  const roleActions = role && actionsByRole[role] ? actionsByRole[role] : actions;
  const mobileActions = (role && mobileActionsByRole[role] ? mobileActionsByRole[role] : mobileActionsByRole.citizen) ?? mobileActionsByRole.citizen;
  const { list: recommended, loading: recLoading } = useLawyers(2);

  const [requests, setRequests] = useState(0);
  const [reservas, setReservas] = useState(0);
  const [consultas, setConsultas] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setStatsLoading(true);
    Promise.all([
      fetchMyRequests(user.uid),
      fetchMisReservas(user.uid),
      fetchConsultations(user.uid),
      fetchHistory(user.uid),
    ])
      .then(([reqs, res, cons, hist]) => {
        if (!active) return;
        setRequests(reqs.length);
        setReservas(res.length);
        setConsultas(cons.length);
        setHistory(hist.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setStatsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.uid]);

  const activityTotal = requests + reservas;
  const allEmpty = activityTotal === 0 && consultas === 0;

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <p className="eyebrow">{formattedDate.toUpperCase()}</p>
            <h1>
              {greeting}, {displayName}
            </h1>
            <p className="lead">{roleLead[role ?? 'citizen']}</p>
            <p className="hero-activity">
              {statsLoading
                ? ''
                : allEmpty
                  ? <Link href="/asistente">Haz tu primera consulta IA →</Link>
                  : `${consultas} consultas IA · ${requests} asesorías · ${reservas} tutorías`}
            </p>
          </div>
          <div className="summary-card">
            <div className="summary-top">
              <span>Tu actividad</span>
              <History size={16} style={{ color: 'var(--wine)' }} />
            </div>
            {statsLoading ? (
              <p style={{ color: '#999', fontSize: 12 }}>Cargando…</p>
            ) : (
              <>
                <div className="summary-stats">
                  <div>
                    <b>{consultas}</b>
                    <span>Consultas IA</span>
                  </div>
                  <div>
                    <b>{requests}</b>
                    <span>Asesorías</span>
                  </div>
                  <div>
                    <b>{reservas}</b>
                    <span>Tutorías</span>
                  </div>
                </div>
                <p>
                  {allEmpty
                    ? 'Empieza haciendo tu primera consulta a la IA.'
                    : `Llevas ${activityTotal} ${activityTotal === 1 ? 'acción' : 'acciones'} registradas.`}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="dash-ai-card">
        <div className="dash-ai-card-top">
          <Sparkles size={20} />
          <h3>Asistente Jurídico IA</h3>
        </div>
        <p>Orientación inicial 24/7 en lenguaje sencillo.</p>
        <Link className="dash-ai-card-cta" href="/asistente">
          Consultar ahora <ArrowRight size={16} />
        </Link>
      </div>

      <section className="section desktop-only">
        <div className="section-title">
          <div>
            <p className="eyebrow">¿CÓMO PODEMOS AYUDARTE?</p>
            <h2>Tu Derecho, a un clic</h2>
          </div>
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

      <section className="section home-actions mobile-only">
        <div className="section-title">
          <div>
            <p className="eyebrow">ACCESOS RÁPIDOS</p>
            <h2>¿Qué necesitas hoy?</h2>
          </div>
        </div>
        <div className="action-grid">
          {mobileActions.map((a) => {
            const Icon = a.icon;
            if (a.action === 'menu') {
              return (
                <button
                  key={a.title}
                  className="action-card action-card-button"
                  aria-label="Abrir menú"
                  onClick={() => window.dispatchEvent(new CustomEvent('varius:toggle-menu'))}
                >
                  <Icon size={20} />
                  <b>{a.title}</b>
                </button>
              );
            }
            return (
              <Link className="action-card" key={a.title} href={a.href ?? '/'} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Icon size={20} />
                <b>{a.title}</b>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="two-col">
        <div className="two-col-inner">
        <div className="section">
          <div className="section-title">
            <div>
              <p className="eyebrow">PROFESIONALES</p>
              <h2>Expertos que te acompañan</h2>
            </div>
            <Link href="/abogados" className="link">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          {recLoading ? (
            <p style={{ color: '#999' }}>Cargando profesionales…</p>
          ) : recommended.length === 0 ? (
            <p style={{ color: '#999' }}>Aún no hay profesionales registrados.</p>
          ) : (
            <div className="lawyer-list">
              {recommended.map((l) => (
                <LawyerCard lawyer={l} key={l.id} />
              ))}
            </div>
          )}
        </div>

        <div className="section continue">
          <div className="section-title">
            <div>
              <p className="eyebrow">TU ACTIVIDAD RECIENTE</p>
              <h2>Últimos movimientos</h2>
            </div>
            <Link href="/perfil" className="link">
              Ver historial <ArrowRight size={16} />
            </Link>
          </div>
          {statsLoading ? (
            <p style={{ color: '#999' }}>Cargando…</p>
          ) : history.length === 0 ? (
            <article className="course">
              <div className="course-visual">
                <Scale />
              </div>
              <div>
                <label>SIN ACTIVIDAD AÚN</label>
                <h3 style={{ marginBottom: 8 }}>
                  Tu historial aparecerá aquí cuando consultes la IA, pidas una asesoría o reserves una tutoría.
                </h3>
              </div>
            </article>
          ) : (
            <ul className="activity-list">
              {history.map((h) => (
                <li key={h.id}>
                  <FileText size={16} style={{ color: 'var(--wine)', flexShrink: 0 }} />
                  <div>
                    <b>{h.title}</b>
                    <small>
                      {new Date(h.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        </div>
      </section>
      <section className="news">
        <div className="section-title">
          <div>
            <p className="eyebrow">SIGUE APRENDIENDO</p>
            <h2>Biblioteca jurídica de Ecuador</h2>
          </div>
          <Link href="/biblioteca" className="link">
            Explorar recursos <ArrowRight size={16} />
          </Link>
        </div>
        <div className="news-grid">
          <article className="news-accent">
            <Sparkles />
            <h3>Aprende con propósito</h3>
            <p>
              Accede a la Constitución, códigos vigentes, guías prácticas y modelos de
              documentos, curados para Ecuador.
            </p>
            <Link href="/biblioteca" style={{ color: '#fff', textDecoration: 'none', fontSize: '11px', display: 'flex', gap: '5px', alignItems: 'center' }}>
              Explorar biblioteca <ArrowRight size={15} />
            </Link>
          </article>
          <article>
            <span className="tag">TUTORÍAS</span>
            <h3>Reserva una sesión 1:1</h3>
            <p>Clases guiadas por profesionales sobre contratos, familia, penal y más.</p>
            <Link href="/tutorias" style={{ color: 'var(--wine)', textDecoration: 'none', fontSize: '11px', display: 'flex', gap: '5px', alignItems: 'center', marginTop: 8 }}>
              Ver tutorías <ArrowRight size={15} />
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
