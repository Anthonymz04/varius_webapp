'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu, Search, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import AuthDialog from './AuthDialog';

export default function Header() {
  const { user, loading } = useAuth();
  const [menu, setMenu] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/abogados', label: 'Abogados' },
    { href: '/biblioteca', label: 'Biblioteca' },
    { href: '/tutorias', label: 'Tutorías' },
    { href: '/comunidad', label: 'Comunidad' },
  ];

  const initials = user?.displayName
    ?.split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <>
      <header>
        <Link className="brand" href="/">
          <span>V</span> VARIUS
        </Link>

        {/* Search bar — always visible */}
        <div className="header-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="¿Qué necesitas resolver?"
            readOnly
            onClick={() => {
              // For now, navigate to abogados (marketplace search)
              window.location.href = '/abogados';
            }}
          />
        </div>

        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {/* Authenticated header: notifications, avatar */}
          {user && (
            <>
              <button className="icon-btn">
                <Bell size={19} />
                <i />
              </button>
              <button
                className="avatar small"
                onClick={() => setAuthOpen(true)}
                title={user.email ?? 'Mi perfil'}
              >
                {initials}
              </button>
            </>
          )}

          {/* Non-authenticated header: "Acceder" button */}
          {!user && !loading && (
            <button
              className="access-btn"
              onClick={() => setAuthOpen(true)}
            >
              Acceder
            </button>
          )}

          <button className="mobile-menu" onClick={() => setMenu(!menu)}>
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {menu && (
        <nav className="mobile-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenu(false)}>
              {link.label}
            </Link>
          ))}
          {!user && (
            <button
              onClick={() => { setMenu(false); setAuthOpen(true); }}
              style={{ color: 'var(--wine)', fontWeight: 600 }}
            >
              Acceder
            </button>
          )}
        </nav>
      )}

      {authOpen && <AuthDialog user={user} close={() => setAuthOpen(false)} />}
    </>
  );
}
