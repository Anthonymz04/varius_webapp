'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NosotrosPage() {
  return (
    <section className="faq-page">
      <Link href="/" className="back" aria-label="Volver al inicio"><ArrowLeft size={16} /></Link>
      <p className="eyebrow">SOBRE NOSOTROS</p>
      <h1>Conoce VARIUS</h1>
      <p className="lead" style={{ maxWidth: '600px' }}>
        VARIUS es una plataforma LegalTech creada por estudiantes de Derecho en Ecuador,
        con el objetivo de acercar la justicia a las personas a través de la tecnología.
      </p>

      <div id="mision" className="profile-section" style={{ marginTop: '40px' }}>
        <h2>Misión</h2>
        <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7 }}>
          Crear un espacio donde aprender, ejercer y acceder al Derecho sea más sencillo,
          humano y accesible. Queremos que cualquier persona en Ecuador pueda orientarse
          legalmente sin barreras, conectando con profesionales verificados y recursos
          confiables.
        </p>
      </div>

      <div id="vision" className="profile-section">
        <h2>Visión</h2>
        <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7 }}>
          Inspirar una nueva forma de vivir el Derecho, conectando oportunidades e
          impulsando el talento jurídico. Aspiramos a ser el ecosistema de referencia
          para la comunidad legal ecuatoriana: estudiantes, profesionales y ciudadanos.
        </p>
      </div>

      <div className="profile-section">
        <h2>Creadoras</h2>
        <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7 }}>
          VARIUS fue creado por <strong>Valeska</strong> y <strong>Arianna</strong>,
          estudiantes de la carrera de Derecho, quienes identificaron la necesidad de
          democratizar el acceso a la orientación legal en Ecuador mediante herramientas
          tecnológicas modernas.
        </p>
      </div>

      <div className="profile-section">
        <h2>Contacto</h2>
        <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7 }}>
          📧 <a href="mailto:contacto@varius.legal" style={{ color: 'var(--wine)' }}>contacto@varius.legal</a><br />
          📱 <a href="tel:+593999000000" style={{ color: 'var(--wine)' }}>+593 999 000 000</a><br />
          📍 Quito, Ecuador<br />
          📸 <a href="https://www.instagram.com/VARIUS_LEGAL" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--wine)' }}>@VARIUS_LEGAL</a>
        </p>
      </div>
    </section>
  );
}
