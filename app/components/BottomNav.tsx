'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home as HomeIcon, MessageCircle, Plus, Users } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <nav className="bottom-nav">
      <Link href="/" className={pathname === '/' ? 'active' : ''}>
        <HomeIcon />
        <span>Inicio</span>
      </Link>
      <Link href="/abogados" className={pathname === '/abogados' ? 'active' : ''}>
        <Compass />
        <span>Explorar</span>
      </Link>
      <Link href="/asistente" className="create">
        <Plus />
      </Link>
      <Link href="/comunidad" className={pathname === '/comunidad' ? 'active' : ''}>
        <MessageCircle />
        <span>Comunidad</span>
      </Link>
      <Link href="/perfil" className={pathname === '/perfil' ? 'active' : ''}>
        <Users />
        <span>Perfil</span>
      </Link>
    </nav>
  );
}
