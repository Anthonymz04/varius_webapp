'use client';

import { useAuth } from '@/lib/auth-context';
import AuthDialog from '@/app/components/AuthDialog';
import { useEffect, useState } from 'react';

/**
 * Mobile Splash Screen — shown when a non-authenticated user
 * opens the app on a mobile device. Gives the feel of a native app.
 */
export default function MobileSplash() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 700);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render if user is logged in or if on desktop screen
  if (user || !isMobile) return null;

  return (
    <>
      <div className="splash-overlay">
        <div className="splash-content">
          {/* Logo */}
          <div className="splash-logo">
            <span>V</span>
          </div>
          <h1 className="splash-title">VARIUS</h1>
          <p className="splash-tagline">
            El puente entre aprender, ejercer<br />y acceder al Derecho.
          </p>

          {/* Features preview */}
          <div className="splash-features">
            <div className="splash-feature">
              <span>⚖️</span>
              <p>Orientación jurídica con IA</p>
            </div>
            <div className="splash-feature">
              <span>👨‍⚖️</span>
              <p>Conecta con abogados</p>
            </div>
            <div className="splash-feature">
              <span>📚</span>
              <p>Biblioteca legal de Ecuador</p>
            </div>
          </div>

          {/* CTA buttons */}
          <button
            className="splash-btn primary"
            onClick={() => setAuthOpen(true)}
          >
            Comenzar ahora
          </button>
          <p className="splash-legal">
            Plataforma jurídica LegalTech para Ecuador
          </p>
        </div>
      </div>

      {authOpen && <AuthDialog user={null} close={() => setAuthOpen(false)} />}
    </>
  );
}
