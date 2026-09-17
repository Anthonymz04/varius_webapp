'use client';

import { X } from 'lucide-react';

const sections: { title: string; body: string }[] = [
  {
    title: '1. Servicio',
    body: 'VARIUS es una plataforma LegalTech para Ecuador: asistente de IA con orientación jurídica, directorio de abogados verificados, biblioteca legal, tutorías y comunidad. La información es orientativa y no sustituye la relación abogado-cliente ni la asesoría profesional.',
  },
  {
    title: '2. Cuenta de usuario',
    body: 'Para usar las funcionalidades interactivas creas una cuenta con correo y contraseña. Eres responsable de mantener la confidencialidad de tus credenciales. Está prohibida la cesión de la cuenta o el acceso no autorizado.',
  },
  {
    title: '3. Registro de abogados y verificación',
    body: 'Los abogados pasan un proceso de verificación (cédula y título profesional en PDF). VARIUS revisa los datos declarados; el rol de abogado se activa solo tras la aprobación del administrador.',
  },
  {
    title: '4. Contenido del usuario',
    body: 'No puedes publicar ni compartir contenido ilegal, difamatorio o que vulnere derechos de terceros. VARIUS no se hace responsable del contenido generado por los usuarios ni de las interacciones entre ellos.',
  },
  {
    title: '5. Propiedad intelectual',
    body: 'VARIUS y su logotipo son marcas de sus creadoras. Los textos, software y diseño de la plataforma están protegidos; queda prohibida su reproducción sin autorización expresa.',
  },
  {
    title: '6. Límite de responsabilidad',
    body: 'La IA puede cometer imprecisiones: sus respuestas son orientativas. La responsabilidad de VARIUS se limita al importe pagado si lo hubiere; en el uso gratuito, al máximo permitido por la ley ecuatoriana.',
  },
  {
    title: '7. Ley aplicable y jurisdicción',
    body: 'Estos términos se rigen por las leyes de la República del Ecuador. Cualquier disputa se somete a los juzgados de Quito.',
  },
];

export default function TermsModal({ close }: { close: () => void }) {
  return (
    <div className="dialog-bg" onClick={close}>
      <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={close} aria-label="Cerrar">
          <X size={18} />
        </button>
        <h2>Términos y Condiciones</h2>
        <p className="terms-updated">Última actualización: septiembre 2026</p>
        <div className="terms-scroll">
          {sections.map((s) => (
            <div key={s.title} className="terms-section">
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
          <p className="terms-footer">
            Al crear tu cuenta aceptas estos términos, la Política de Privacidad y la Política de Cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
