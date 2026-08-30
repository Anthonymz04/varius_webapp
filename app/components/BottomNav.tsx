'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home as HomeIcon, MessageCircle, Plus, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (pathname === '/' && !user) return null;

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
      <Link href="/mensajes" className={pathname === '/mensajes' ? 'active' : ''}>
        <MessageCircle />
        <span>Asesorías</span>
      </Link>
      <Link href="/perfil" className={pathname === '/perfil' ? 'active' : ''}>
        <Users />
        <span>Perfil</span>
      </Link>
    </nav>
  );
}
