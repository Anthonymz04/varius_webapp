import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadPage() {
  return (
    <section className="faq-page">
      <Link href="/" className="back" aria-label="Volver al inicio">
        <ArrowLeft size={16} />
      </Link>
      <p className="eyebrow">LEGAL</p>
      <h1>Política de Privacidad</h1>
      <p className="lead" style={{ maxWidth: 640 }}>
        Información sobre cómo recopilamos y protegemos tus datos personales, de acuerdo con la Ley
        Orgánica de Protección de Datos Personales de Ecuador (LOPDP).
      </p>

      <div className="profile-section"><h2> Responsable </h2>
        <p>El responsable del tratamiento es VARIUS, identificado como [Razón Social] con RUC [RUC],
          con domicilio en [Dirección completa], Quito, Ecuador. Contacto: contacto@varius.legal.</p>
      </div>

      <div className="profile-section"><h2> Información que recopilamos </h2>
        <p>Datos de registro (nombre, correo, foto), contenido de tus consultas a la IA (preguntas y respuestas)
          para generar el historial de consultas, interacciones con abogados y redes comunitarias, y
          datos técnicos (IP, logs, tipo de dispositivo) de forma anónima para mejorar la app.</p>
      </div>

      <div className="profile-section"><h2> Finalidades y base legal </h2>
        <ul>
          <li>Prestar el servicio de asistente jurídico y marketplace: ejecución del contrato de suscripción/uso.</li>
          <li>Guardar tu historial de consultas y asesorías: necesidad contractual + consentamiento.</li>
          <li>Comunicaciones institucionales (notificaciones dentro de la app): legítimo interés.</li>
          <li>Mejora y análisis de uso: consentimiento (puedes revocarlo).</li>
          <li>Cumplimiento de obligaciones legales y de seguridad.</li>
        </ul>
      </div>

      <div className="profile-section"><h2> Derechos ARCO y portabilidad </h2>
        <p>Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento, y a la portabilidad de
          tus datos. Ejerce tus derechos enviando una solicitud a contacto@varius.legal con el asunto
          "Ejercicio de derechos ARCO" y adjuntando documento de identidad. Responderemos en el plazo
          legal.</p>
      </div>

      <div className="profile-section"><h2> Compartición y transferencias </h2>
        <p>Los datos pueden procesarse en servidores de proveedores externos (Firebase, OpenAI/B.AI,
          NVIDIA, OpenRouter u otra API de IA que configures) fuera de Ecuador. Nos aseguramos de aplicar
          cláusulas contractuales que garanticen un nivel equivalente de protección. No vendemos tus datos.</p>
      </div>

      <div className="profile-section"><h2> Información sensible y asesoría </h2>
        <p>La aplicación de IA genera orientación jurídica de carácter general. No compartas información sensible
          ni datos de terceros en el chat. Las consultas a la IA no constituyen asesoría legal vinculante; para
          casos concretos te conectamos con abogados verificados.</p>
      </div>

      <div className="profile-section"><h2> Retención y seguridad </h2>
        <p>Conservamos tus datos mientras mantienes la cuenta y por el tiempo necesario para cumplir las
          finalidades descritas. Aplicamos medidas técnicas y organizativas razonables. El cierre de sesión
          no borra tu cuenta; para eliminación completa solicita a contacto@varius.legal.</p>
      </div>

      <div className="profile-section"><h2> Cambios a esta política </h2>
        <p>Nos reservamos el derecho de modificar esta política. Los cambios serán notificados en la app con
          antelación razonable.</p>
      </div>

      <p style={{ fontSize: 12, color: '#777', marginTop: 24 }}>
        Última actualización: [dd/mm/aaaa]. Esta información es una base técnica y no constituye asesoría
        legal; consulta con tu abogado.
      </p>
      <div className="legal-links">
        <Link href="/terminos">Términos y Condiciones</Link> ·{' '}
        <Link href="/cookies">Política de Cookies</Link> ·{' '}
        <Link href="/aviso-legal">Aviso Legal</Link>
      </div>
    </section>
  );
}
