import type { Metadata, Viewport } from 'next';
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
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

export const viewport: Viewport = {
  themeColor: '#c2185b',
  colorScheme: 'light',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${manrope.variable} ${jakarta.variable}`}>
      <body>
        <AuthProvider>
          <MobileSplash />
          <Header />
          <main>{children}</main>
          <Footer />
          <BottomNav />
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))`,
          }}
        />
      </body>
    </html>
  );
}
