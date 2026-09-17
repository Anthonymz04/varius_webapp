'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, CreditCard, Landmark, Lock, Wallet, X } from 'lucide-react';
import { planes } from './planes';

type PayMethod = 'credito' | 'debito' | 'transferencia';

const methodLabels: Record<PayMethod, string> = {
  credito: 'Tarjeta de crédito',
  debito: 'Tarjeta de débito',
  transferencia: 'Transferencia bancaria',
};

function CheckoutModal({ plan, close }: { plan: string; close: () => void }) {
  const [method, setMethod] = useState<PayMethod>('credito');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  return (
    <div className="dialog-bg" onClick={close}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={close} aria-label="Cerrar">
          <X size={18} />
        </button>
        <div className="checkout-head">
          <span className="checkout-plan-badge">{plan}</span>
          <h2>Contratar plan</h2>
          <p className="checkout-sub">Completa tus datos de pago para activar la membresía.</p>
        </div>

        <div className="checkout-methods">
          {(['credito', 'debito', 'transferencia'] as PayMethod[]).map((m) => {
            const Icon = m === 'transferencia' ? Landmark : CreditCard;
            return (
              <button
                key={m}
                className={method === m ? 'active' : ''}
                onClick={() => setMethod(m)}
              >
                <Icon size={16} />
                <span>{methodLabels[m]}</span>
              </button>
            );
          })}
        </div>

        {method === 'transferencia' ? (
          <div className="checkout-fields">
            <p className="checkout-note-bank">
              Coordinaremos los datos de la cuenta bancaria para la transferencia una vez
              disponible la función.
            </p>
          </div>
        ) : (
          <div className="checkout-fields">
            <input
              placeholder="Nombre en la tarjeta"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
            <input
              placeholder="Número de tarjeta (0000 0000 0000 0000)"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, '').slice(0, 19))}
            />
            <div className="checkout-row">
              <input
                placeholder="MM/AA"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
              />
              <input
                placeholder="CVV"
                inputMode="numeric"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </div>
          </div>
        )}

        <button className="checkout-submit" disabled>
          <Lock size={14} /> Pagar y activar
        </button>
        <p className="checkout-demo-note">
          <BadgeCheck size={14} />
          Los pagos no están disponibles en esta demo. Tus datos no se envían ni se almacenan.
        </p>
      </div>
    </div>
  );
}

export default function PlanesPage() {
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);

  return (
    <section className="faq-page">
      <Link href="/" className="back" aria-label="Volver al inicio">
        <ArrowLeft size={16} />
      </Link>
      <p className="eyebrow">MEMBRESÍAS VARIUS</p>
      <h1>Planes y precios</h1>
      <p className="lead" style={{ maxWidth: 640 }}>
        El acceso básico es y seguirá siendo gratuito. Los planes premium son <strong>referenciales</strong>:
        puedes recorrer el flujo de contratación, pero los pagos aún no están disponibles.
      </p>

      <div className="planes-grid">
        {planes.map((p) => (
          <div className={`plan-card ${p.featured ? 'plan-card-featured' : ''}`} key={p.id}>
            <div className="plan-head">
              <h3>{p.name}</h3>
              <small>{p.subtitle}</small>
            </div>
            <div className="plan-price">
              <span>{p.price}</span>
              <small>{p.priceNote}</small>
            </div>
            <ul className="plan-benefits">
              {p.benefits.map((b) => (
                <li key={b.text}>
                  <b.icon size={14} />
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
            <div className="plan-cta">
              {p.cta === 'auth' ? (
                <Link href="/asistente" className="landing-btn primary compact" style={{ justifyContent: 'center' }}>
                  Empezar gratis
                </Link>
              ) : (
                <button
                  className="landing-btn compact"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setCheckoutPlan(p.name)}
                >
                  <Wallet size={14} /> Elegir plan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="plan-comparison">
        <h2>Comparativa</h2>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
          Todas las membresías incluyen el acceso a la biblioteca. Las suscripciones premium estarán
          disponibles pronto con pasarela de pago; por ahora <strong>todo es gratis</strong>. Si eres
          abogado o despacho, escríbenos al{' '}
          <a href="mailto:contacto@varius.legal" style={{ color: 'var(--brand)' }}>contacto@varius.legal</a>.
        </p>
      </div>

      <p style={{ fontSize: 12, color: '#777', marginTop: 24 }}>
        Los precios son de referencia e incluirían IVA. Podrás cancelar cuando quieras una vez
        activa la pasarela de pago.
      </p>

      <div className="legal-links">
        <Link href="/privacidad">Política de Privacidad</Link> ·{' '}
        <Link href="/terminos">Términos y Condiciones</Link>
      </div>

      {checkoutPlan && <CheckoutModal plan={checkoutPlan} close={() => setCheckoutPlan(null)} />}
    </section>
  );
}
