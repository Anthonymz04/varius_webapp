'use client';

import Link from 'next/link';
import { ArrowLeft, Check, MessageCircle, Send } from 'lucide-react';
import { planes } from './planes';

export default function PlanesPage() {
  return (
    <section className="faq-page">
      <Link href="/" className="back" aria-label="Volver al inicio">
        <ArrowLeft size={16} />
      </Link>
      <p className="eyebrow">MEMBRESÍAS VARIUS</p>
      <h1>Planes y precios</h1>
      <p className="lead" style={{ maxWidth: 640 }}>
        VARIUS nace pensada para ser útil desde el primer día. El acceso básico es y seguirá siendo gratuito;
        los planes a continuación son <strong>referenciales</strong> (en el MVP no se cobra todavía) y te
        ayudan a conocer qué obtienes al subir de nivel.
      </p>

      <div className="planes-grid">
        {planes.map((p) => (
          <div className={`plan-card ${p.featured ? 'plan-card-featured' : ''}`} key={p.id}>
            <div className="plan-head">
              <h2>{p.name}</h2>
              <small>{p.subtitle}</small>
            </div>
            <div className="plan-price">
              <span>{p.price}</span>
              <small>{p.priceNote}</small>
            </div>
            <ul className="plan-benefits">
              {p.benefits.map((b) => (
                <li key={b.text}>
                  <b.icon size={16} />
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
            <div className="plan-cta">
              {p.cta === 'auth' ? (
                <Link href="/asistente" className="landing-btn primary compact">
                  Empezar gratis <ArrowLeft size={14} style={{ transform: 'scaleX(-1)' }} />
                </Link>
              ) : (
                <a
                  className="landing-btn compact"
                  href={`https://wa.me/593999000000?text=Hola%20VARIUS%2C%20quiero%20informes%20del%20plan%20${encodeURIComponent(p.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={14} /> Cotizar por WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="plan-comparison">
        <h2>Comparativa</h2>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
          Todas las membresías incluyen el acceso a la biblioteca. Las suscripciones premium estarán
          disponibles pronto con pasareja de pago; por ahora <strong>todo es gratis</strong>. Si eres
          abogado o despacho, escríbenos al <a href="mailto:contacto@varius.legal" style={{ color: 'var(--wine)' }}>contacto@varius.legal</a>.
        </p>
      </div>

      <p style={{ fontSize: 12, color: '#777', marginTop: 24 }}>
        Los precios incluyen IVA. Puedes cancelar cuando quieras. VARIUS no configura cobros automáticos
        en el MVP; nos contactaremos para coordinar el pago del plan que elijas.
      </p>

      <div className="legal-links">
        <Link href="/privacidad">Política de Privacidad</Link> ·{' '}
        <Link href="/terminos">Términos y Condiciones</Link>
      </div>
    </section>
  );
}
