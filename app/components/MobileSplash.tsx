'use client';
import { useAuth } from '@/lib/auth-context';
import AuthDialog from '@/app/components/AuthDialog';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, Scale, Users } from 'lucide-react';
import { App } from '@capacitor/app';
import { useDeviceType } from '@/app/hooks/useDeviceType';

const ONBOARD_KEY = 'varius.onboarded';
let launched = false;

type Phase = 'welcome' | 'splash' | 'none';

/**
 * Mobile boot experience: first-ever launch shows the welcome screen;
 * later launches show a brief wine splash while auth resolves. On resume
 * from background nothing flashes.
 */
export default function MobileSplash() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const deviceType = useDeviceType();
  const splashStart = useRef(0);

  const [phase, setPhase] = useState<Phase>(() => {
    if (launched) return 'none';
    return 'splash';
  });

  const prevUser = useRef(user);

  useEffect(() => {
    const wasLogged = !!prevUser.current;
    prevUser.current = user;
    if (wasLogged && !user) {
      setPhase('welcome');
    }
  }, [user]);

  useEffect(() => {
    launched = true;
  }, []);

  useEffect(() => {
    (window as unknown as { AndroidApp?: { ready?: () => void } }).AndroidApp?.ready?.();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'splash') return;
    splashStart.current = Date.now();
    const t = setTimeout(() => setPhase('none'), 2400);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'splash' || loading || !user) return;
    const elapsed = Date.now() - splashStart.current;
    const t = setTimeout(() => setPhase('none'), Math.max(0, 2000 - elapsed));
    return () => clearTimeout(t);
  }, [phase, loading, user]);

  useEffect(() => {
    if (phase !== 'splash' || loading || user) return;
    const elapsed = Date.now() - splashStart.current;
    if (elapsed >= 2000) {
      setPhase('welcome');
      return;
    }
    const t = setTimeout(() => setPhase('welcome'), 2000 - elapsed);
    return () => clearTimeout(t);
  }, [phase, loading, user]);

  useEffect(() => {
    if (phase !== 'welcome' || !user) return;
    try {
      localStorage.setItem(ONBOARD_KEY, '1');
    } catch {}
    setPhase('none');
  }, [phase, user]);

  useEffect(() => {
    const forceNone = () => setPhase((p) => (user ? 'none' : p));
    const onVisibility = () => {
      if (document.visibilityState === 'visible') forceNone();
    };
    document.addEventListener('visibilitychange', onVisibility);
    let appListener: { remove: () => void } | undefined;
    if (deviceType !== 'desktop') {
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
  }, [user, deviceType]);

  if (deviceType === 'desktop') return null;

  if (phase === 'splash') {
    return (
      <div className="boot-splash">
        <div className="boot-emblem">
          <img src="/brand/isotipo.svg" alt="VARIUS" className="boot-logo" />
        </div>
        <h1 className="boot-title">VARIUS</h1>
        <p className="boot-tagline">El puente entre aprender, ejercer y acceder al Derecho</p>
        <div className="boot-dots" aria-hidden="true">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  if (phase === 'welcome' && !user) {
    return (
      <>
        <div className="splash-overlay">
          <div className="splash-content">
            <img src="/brand/isotipo.svg" alt="VARIUS" className="splash-logo" />
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
