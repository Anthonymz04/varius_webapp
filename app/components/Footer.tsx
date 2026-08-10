'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="site-footer">
      <div className="footer-main">
        {/* Brand column */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span>V</span> VARIUS
          </div>
          <p className="footer-desc">
            El puente entre aprender, ejercer y acceder al Derecho.
            Plataforma jurídica LegalTech para Ecuador.
          </p>
          <div className="footer-social">
            <a href="https://www.instagram.com/VARIUS_LEGAL" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://www.tiktok.com/@varius_legal" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.16 8.16 0 004.76 1.52V6.94a4.85 4.85 0 01-1-.25z"/></svg>
            </a>
            <a href="https://www.youtube.com/@varius_legal" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
          </div>
        </div>

        {/* Plataforma column */}
        <div className="footer-col">
          <h4>Plataforma</h4>
          <Link href="/abogados">Buscar abogados</Link>
          <Link href="/asistente">Asistente IA</Link>
          <Link href="/biblioteca">Biblioteca jurídica</Link>
          <Link href="/tutorias">Tutorías</Link>
          <Link href="/comunidad">Comunidad</Link>
        </div>

        {/* Recursos column */}
        <div className="footer-col">
          <h4>Recursos</h4>
          <Link href="/preguntas-frecuentes">Preguntas frecuentes</Link>
          <Link href="/biblioteca">Leyes de Ecuador</Link>
          <Link href="/tutorias">Guías prácticas</Link>
          <a href="https://www.lexis.com.ec" target="_blank" rel="noopener noreferrer">LEXIS Ecuador</a>
        </div>

        {/* Información column */}
        <div className="footer-col">
          <h4>Información</h4>
          <Link href="/nosotros#mision">Misión</Link>
          <Link href="/nosotros#vision">Visión</Link>
          <Link href="/nosotros">Sobre VARIUS</Link>
          <Link href="/preguntas-frecuentes">Ayuda</Link>
        </div>

        {/* Contacto column */}
        <div className="footer-col">
          <h4>Contacto</h4>
          <a href="mailto:contacto@varius.legal">contacto@varius.legal</a>
          <a href="tel:+593999000000">+593 999 000 000</a>
          <span>Quito, Ecuador 🇪🇨</span>
          <a href="https://www.instagram.com/VARIUS_LEGAL" target="_blank" rel="noopener noreferrer">@VARIUS_LEGAL</a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} VARIUS. Creado por <strong>Valeska & Arianna</strong>. Todos los derechos reservados.</p>
        <p>La información es orientativa y no sustituye asesoría profesional.</p>
      </div>
    </footer>
  );
}
