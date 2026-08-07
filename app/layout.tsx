import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'VARIUS | Derecho, más cerca', description: 'El puente entre aprender, ejercer y acceder al Derecho.', manifest: '/manifest.webmanifest', appleWebApp: { capable: true, statusBarStyle: 'default', title: 'VARIUS' }, icons: { icon: '/icon.svg', apple: '/icon.svg' } };
export const viewport: Viewport = { themeColor: '#c2185b', colorScheme: 'light' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}<script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))`}} /></body></html>; }
