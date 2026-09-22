import type { Metadata, Viewport } from 'next';
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import OnlineGuard from '@/app/components/OnlineGuard';
import Header from '@/app/components/Header';
import BottomNav from '@/app/components/BottomNav';
import Footer from '@/app/components/Footer';
import MobileSplash from '@/app/components/MobileSplash';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VARIUS | Derecho, más cerca',
  description: 'El puente entre aprender, ejercer y acceder al Derecho.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'VARIUS' },
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

// Inyectar meta viewport inmediatamente para evitar flash de desktop en WebViews
const viewportMeta = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#b45935',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${manrope.variable} ${jakarta.variable}`}>
      <body>
        <script
          dangerouslySetInnerHTML={{ __html: `
            (function(){
              var m=document.createElement('meta');
              m.name='viewport';
              m.content='${viewportMeta}';
              document.head.appendChild(m);
            })();
            if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'));
          `}}
        />
        <AuthProvider>
          <OnlineGuard>
            <MobileSplash />
            <Header />
            <main>{children}</main>
            <Footer />
            <BottomNav />
          </OnlineGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
