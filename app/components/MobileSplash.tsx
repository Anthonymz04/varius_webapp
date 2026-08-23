'use client';

import { useAuth } from '@/lib/auth-context';
import AuthDialog from '@/app/components/AuthDialog';
import { useEffect, useState } from 'react';
import { ArrowRight, Bot, Scale, Users } from 'lucide-react';
import { App } from '@capacitor/app';

const ONBOARD_KEY = 'varius.onboarded';
let launched = false;

type Phase = 'welcome' | 'splash' | 'none';

function isNative(): boolean {
  return typeof window !== 'undefined' && !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
}

/**
 * Mobile boot experience: first-ever launch shows the welcome screen;
 * later launches show a brief wine splash while auth resolves. On resume
 * from background nothing flashes.
 */
export default function MobileSplash() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [phase, setPhase] = useState<Phase>(() => {
    if (launched) return 'none';
    let onboarded = false;
    try {
      onboarded = localStorage.getItem(ONBOARD_KEY) === '1';
    } catch {}
    return onboarded ? 'splash' : 'welcome';
  });

  useEffect(() => {
    launched = true;
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 700);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (phase !== 'splash') return;
    const t = setTimeout(() => setPhase('none'), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'welcome' || !user) return;
    try {
      localStorage.setItem(ONBOARD_KEY, '1');
    } catch {}
    setPhase('none');
  }, [phase, user]);

  useEffect(() => {
    const forceNone = () => setPhase('none');
    const onVisibility = () => {
      if (document.visibilityState === 'visible') forceNone();
    };
    document.addEventListener('visibilitychange', onVisibility);
    let appListener: { remove: () => void } | undefined;
    if (isNative()) {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) forceNone();
      }).then((l) => {
        appListener = l;
      });
    }
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      appListener?.remove?.();
    };
  }, []);

  if (!isMobile) return null;

  if (phase === 'splash' && loading) {
    return (
      <div className="boot-splash">
        <div className="boot-logo">V</div>
        <h1>VARIUS</h1>
        <p>El puente entre aprender, ejercer y acceder al Derecho</p>
      </div>
    );
  }

  if (phase === 'welcome' && !user) {
    return (
      <>
        <div className="splash-overlay">
          <div className="splash-content">
            <div className="splash-logo">
              <span>V</span>
            </div>
            <h1 className="splash-title">VARIUS</h1>
            <p className="splash-tagline">
              El puente entre aprender, ejercer<br />y acceder al Derecho.
            </p>

            <div className="splash-features">
              <div className="splash-feature">
                <Bot size={22} className="splash-icon" />
                <p>Orientación jurídica con IA</p>
              </div>
              <div className="splash-feature">
                <Users size={22} className="splash-icon" />
                <p>Conecta con abogados verificados</p>
              </div>
              <div className="splash-feature">
                <Scale size={22} className="splash-icon" />
                <p>Biblioteca legal de Ecuador</p>
              </div>
            </div>

            <button
              className="splash-btn primary"
              onClick={() => {
                try {
                  localStorage.setItem(ONBOARD_KEY, '1');
                } catch {}
                setPhase('none');
                setAuthOpen(true);
              }}
            >
              <span>Comenzar ahora</span>
              <ArrowRight size={16} />
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

  return null;
}
