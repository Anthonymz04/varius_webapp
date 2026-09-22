import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.varius.app',
  appName: 'Varius',
  webDir: 'out',
  server: {
    url: 'https://varius-webapp-one.vercel.app',  // ← Volvemos a la fuente real
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#b45935',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
