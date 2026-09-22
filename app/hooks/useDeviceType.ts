'use client';
import { useEffect, useState } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Detecta el tipo de dispositivo usando múltiples métodos:
 * 1. Capacitor.isNativePlatform() → app nativa Android/iOS
 * 2. User-Agent móvil/tablet
 * 3. Viewport width (fallback)
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    function detect(): DeviceType {
      // 1) Capacitor: detecta app nativa (Android/iOS)
      const win = window as Window & {
        Capacitor?: { isNativePlatform?: () => boolean };
      };
      if (win.Capacitor?.isNativePlatform?.()) {
        // Estamos dentro de la app Capacitor
        const ua = navigator.userAgent.toLowerCase();
        const isTablet =
          /android/.test(ua) && !/mobile/.test(ua);
        if (isTablet || screen.width >= 768) return 'tablet';
        return 'mobile';
      }

      // 2) User-Agent check
      const ua = navigator.userAgent.toLowerCase();
      const isMobileUA =
        /android/.test(ua) ||
        /iphone|ipad|ipod/.test(ua) ||
        /mobile/.test(ua);

      if (isMobileUA) {
        // Distinguir tablet de móvil por ancho de pantalla
        if (screen.width >= 768 || /tablet|ipad/.test(ua)) return 'tablet';
        return 'mobile';
      }

      // 3) Viewport width (fallback para browsers desktop/otros)
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }

    setDeviceType(detect());

    const handleResize = () => setDeviceType(detect());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}