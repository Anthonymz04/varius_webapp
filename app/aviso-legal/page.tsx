import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AvisoLegalPage() {
  return (
    <section className="faq-page">
      <Link href="/" className="back" aria-label="Volver al inicio">
        <ArrowLeft size={16} />
      </Link>
      <p className="eyebrow">LEGAL</p>
      <h1>Aviso Legal</h1>
      <p className="lead" style={{ maxWidth: 640 }}>
        Identificación del titular, condiciones de uso del sitio y datos de contacto, de conformidad con el
        régimen legal ecuatoriano.
      </p>

      <div className="profile-section"><h2> Titular / responsable del sitio </h2>
        <p>Razón social: [Razón Social]. RUC: [RUC]. Representante legal: [Nombre del representante].
          Domicilio: [Dirección completa], Quito, Pichincha, Ecuador. Correo electrónico de contacto:
          contacto@varius.legal. Teléfono: +593 999 000 000.</p>
      </div>

      <div className="profile-section"><h2> Àmbito de aplicación </h2>
        <p>Este aviso regula el sitio https://varius-webapp-one.vercel.app, sus subdominios y la aplicación
          móvil VARIUS. El acceso no requiere registro, pero el uso de funcionalidades interactivas implica aceptación
          de estos términos, la Política de Privacidad y las Cookies.</p>
      </div>

      <div className="profile-section"><h2> Propiedad intelectual </h2>
        <p>Los contenidos de la biblioteca jurídica son de dominio público o de terceros (cuerpo legislativo del
          Ecuador). Textos, logotipos y software propios de VARIUS están protegidos por derechos de autor; queda
          prohibida su reproducción sin autorización expresa.</p>
      </div>

      <div className="profile-section"><h2> Responsabilidad </h2>
        <p>VARIUS no garantiza la disponibilidad permanente ni la inexistencia de errores de transmisión. No asume
          responsabilidad por enlaces externos (p. ej. lexis.com.ec) cuyo contenido es ajeno. La información
          jurídica es orientativa; para decisiones consulte a un profesional.</p>
      </div>

      <div className="profile-section"><h2> Ley aplicable </h2>
        <p>Este aviso se rige por la legislación ecuatoriana. Cualquier controversia se somete a los juzgados de
          Quito, con renuncia a cualquier otro fuero.</p>
      </div>

      <p style={{ fontSize: 12, color: '#777', marginTop: 24 }}>
        Última actualización: [dd/mm/aaaa].
      </p>
      <div className="legal-links">
        <Link href="/privacidad">Política de Privacidad</Link> ·{' '}
        <Link href="/terminos">Términos y Condiciones</Link> ·{' '}
        <Link href="/cookies">Política de Cookies</Link>
      </div>
    </section>
  );
}
