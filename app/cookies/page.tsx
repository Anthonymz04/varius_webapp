import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiesPage() {
  return (
    <section className="faq-page">
      <Link href="/" className="back" aria-label="Volver al inicio">
        <ArrowLeft size={16} />
      </Link>
      <p className="eyebrow">LEGAL</p>
      <h1>Política de Cookies</h1>
      <p className="lead" style={{ maxWidth: 640 }}>
        VARIUS no utiliza cookies de Publicidad ni analíticas de terceros. Usamos tecnologías de funcionamiento
        estrictamente necesarias para la operación de la plataforma y el almacenamiento local de preferencias.
      </p>

      <div className="profile-section"><h2> Cookies y tecnologías que usamos </h2>
        <ul>
          <li>
            <strong>Autenticación</strong>: cookies de sesión gestionadas por Firebase Authentication para
            mantener tu sesión activa. Estrictamente necesaria.
          </li>
          <li>
            <strong>Preferencias</strong>: <code>localStorage</code> (clave <code>varius.onboarded</code>) para
            no mostrar el splash de bienvenida en cada carga y recordar ajustes básicos.
          </li>
          <li>
            <strong>Service Worker / caché PWA</strong>: <code>public/sw.js</code> almacena en caché assets
            estáticos (<code>/icons/*</code>, manifest, fuentes) para funcionar offline.
          </li>
          <li>
            <strong>Analítica</strong>: actualmente NO se usan analizadores de tráfico. Si en el futuro los
            incorporamos, pediremos consentimiento expreso antes de activarlos.
          </li>
        </ul>
      </div>

      <div className="profile-section"><h2> Base legal </h2>
        <p>Las tecnologías estrictamente necesarias se fundamentan en la ejecución del contrato de uso. Las de
          preferencias y cualquier analítica futura se basarán en tu consentimiento, que puedes revocar limpiando
          el historial de navegación o contactando a contacto@varius.legal.</p>
      </div>

      <div className="profile-section"><h2> Deshabilitar </h2>
        <p>Desde tu navegador puedes borrar cookies y localizar <code>varius.onboarded</code> en almacenamiento
          local. Ten en cuenta que deshabilitar las cookies de sesión impedirá iniciar sesión.</p>
      </div>

      <p style={{ fontSize: 12, color: '#777', marginTop: 24 }}>
        Última actualización: [dd/mm/aaaa].
      </p>
      <div className="legal-links">
        <Link href="/privacidad">Política de Privacidad</Link> ·{' '}
        <Link href="/terminos">Términos y Condiciones</Link> ·{' '}
        <Link href="/aviso-legal">Aviso Legal</Link>
      </div>
    </section>
  );
}
