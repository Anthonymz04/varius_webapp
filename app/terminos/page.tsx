import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TerminosPage() {
  return (
    <section className="faq-page">
      <Link href="/" className="back" aria-label="Volver al inicio">
        <ArrowLeft size={16} />
      </Link>
      <p className="eyebrow">LEGAL</p>
      <h1>Términos y Condiciones</h1>
      <p className="lead" style={{ maxWidth: 640 }}>
        Reglas para usar VARIUS, la plataforma LegalTech para Ecuador. Lee con atención; al acceder aceptas
        estos términos, el Aviso Legal y la Política de Privacidad.
      </p>

      <div className="profile-section"><h2> Servicio </h2>
        <p>VARIUS ofrece acceso a una asistente de IA orientativa en derecho ecuatoriano, directorio de abogados
          verificados, biblioteca jurídica, tutorías y comunidad. El acceso básico es gratuito; las funcionalidades
          o planes con costo se indican expresamente. El servicio es una herramienta de orientación, no sustituye
          la relación abogado-cliente ni la asesoría profesional.</p>
      </div>

      <div className="profile-section"><h2> Cuenta de usuario </h2>
        <p>Para usar funcionalidades interactivas, crea una cuenta con correo y contraseña. Eres responsable
          de mantener la confidencialidad de tu cuenta. Prohibida la cesión, alquiler o acceso no autorizado.</p>
      </div>

      <div className="profile-section"><h2> Registro de abogados y verificación </h2>
        <p>Los abogados deben pasar un proceso de verificación (cédula + título). VARIUS verifica los datos
          declarados, pero no garantiza la vigencia de la cédula ni la titulación. El marketplace no implica
          que VARIUS sea parte de la relación jurídica entre profesional y cliente; ello se formaliza directamente
          entre las partes bajo su propio código de ética.</p>
      </div>

      <div className="profile-section"><h2> Contenido del usuario </h2>
        <p>No puedes publicar, enviar ni compartir contenido ilegal, difamatorio, que vulnere derechos de terceros
          o que facilite actividades prohibidas. VARIUS no se hace responsable del contenido generado por los
          usuarios ni de las interacciones entre ellos.</p>
      </div>

      <div className="profile-section"><h2> Propiedad intelectual </h2>
        <p>VARIUS y su logo son marcas/registros de [Razón Social]. El contenido de la biblioteca y herramientas
          es de uso interno, salvo licencias expresas. No puedes copiar, distribuir o replicar el producto sin
          autorización.</p>
      </div>

      <div className="profile-section"><h2> Límite de responsabilidad </h2>
        <p>La IA genera respuestas en función de tu entrada y puede contener imprecisiones. VARIUS no responde
          por errores de la IA ni por daños indirectos. La responsabilidad total se limita al importe pagado
          (si lo hubiere); en el caso gratuito, a la cantidad máxima permitida por la Ley Orgánica de Defensa del
          Consumidor.</p>
      </div>

      <div className="profile-section"><h2> Terminación </h2>
        <p>Puedes cancelar tu cuenta en cualquier momento. VARIUS puede suspender o cerrar cuentas que incurran
          repetidamente en infracciones.</p>
      </div>

      <div className="profile-section"><h2> Ley aplicable y jurisdicción </h2>
        <p>Estos términos se rigen por las leyes de Ecuador. Cualquier disputa se somete a los juzgados de Quito,
          con renuncia a cualquier otro fuero.</p>
      </div>

      <p style={{ fontSize: 12, color: '#777', marginTop: 24 }}>
        Última actualización: [dd/mm/aaaa].
      </p>
      <div className="legal-links">
        <Link href="/privacidad">Política de Privacidad</Link> ·{' '}
        <Link href="/cookies">Política de Cookies</Link> ·{' '}
        <Link href="/aviso-legal">Aviso Legal</Link>
      </div>
    </section>
  );
}
