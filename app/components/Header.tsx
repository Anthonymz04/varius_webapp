'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bot, LogOut, Menu, Scale, Search, Users, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import AuthDialog from './AuthDialog';
import NotificationBell from './NotificationBell';

const popularSearches = [
  { text: 'Despido intempestivo y laboral', category: 'IA', href: '/asistente?prompt=Despido+intempestivo' },
  { text: 'Pensión de alimentos en Ecuador', category: 'IA', href: '/asistente?prompt=Pension+de+alimentos' },
  { text: 'Abogados de Derecho Familiar en Quito', category: 'Abogados', href: '/abogados?search=familia' },
  { text: 'Constitución de la República del Ecuador', category: 'Leyes', href: '/biblioteca' },
  { text: 'Modelo de Contrato de Arriendo', category: 'Guías', href: '/biblioteca' },
  { text: 'Código Orgánico Integral Penal (COIP)', category: 'Códigos', href: '/biblioteca' },
];

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const [menu, setMenu] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const toggleMenu = () => setMenu((m) => !m);
    window.addEventListener('varius:toggle-menu', toggleMenu);
    return () => window.removeEventListener('varius:toggle-menu', toggleMenu);
  }, []);

  const handleLogout = async () => {
    setMenu(false);
    await signOut();
  };

  const navLinks = [
    { href: '/abogados', label: 'Abogados' },
    { href: '/biblioteca', label: 'Biblioteca' },
    { href: '/tutorias', label: 'Tutorías' },
    { href: '/comunidad', label: 'Comunidad' },
    { href: '/mensajes', label: 'Asesorías' },
  ];

  // Close search dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/asistente?prompt=${encodeURIComponent(searchQuery)}`);
  };

  const initials = user?.displayName
    ?.split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  const filteredSearches = searchQuery.trim()
    ? popularSearches.filter((item) =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularSearches;

  // The home route contains its own application header and navigation.
  if (pathname === '/') return null;

  return (
    <>
      <header>
        <Link className="brand" href="/">
          <span>V</span> VARIUS
        </Link>

        {/* Search bar with dropdown (Platzi / Pichincha style) */}
        <div className="header-search-container" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="header-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="¿Qué necesitas resolver?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Search Suggestions Dropdown */}
          {searchOpen && (
            <div className="search-dropdown-popover">
              {/* Quick AI search option */}
              {searchQuery.trim() && (
                <div
                  className="search-dropdown-item ai-highlight"
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(`/asistente?prompt=${encodeURIComponent(searchQuery)}`);
                  }}
                >
                  <Bot size={16} style={{ color: 'var(--wine)' }} />
                  <div>
                    <strong>Consultar a la IA sobre:</strong>
                    <span>"{searchQuery}"</span>
                  </div>
                </div>
              )}

              <div className="search-dropdown-header">
                <span>{searchQuery ? 'Resultados sugeridos' : 'Búsquedas populares'}</span>
              </div>

              <div className="search-dropdown-list">
                {filteredSearches.length > 0 ? (
                  filteredSearches.map((item, idx) => (
                    <div
                      key={idx}
                      className="search-dropdown-item"
                      onClick={() => {
                        setSearchOpen(false);
                        router.push(item.href);
                      }}
                    >
                      <Search size={14} className="item-icon" />
                      <span className="item-text">{item.text}</span>
                      <span className="item-tag">{item.category}</span>
                    </div>
                  ))
                ) : (
                  <div className="search-dropdown-empty">
                    <span>No encontramos resultados exactos.</span>
                    <button
                      type="button"
                      className="search-ai-btn"
                      onClick={() => {
                        setSearchOpen(false);
                        router.push(`/asistente?prompt=${encodeURIComponent(searchQuery)}`);
                      }}
                    >
                      Preguntar al Asistente IA <Bot size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Quick category shortcuts footer */}
              <div className="search-dropdown-footer">
                <Link
                  href="/asistente"
                  onClick={() => setSearchOpen(false)}
                  className="search-shortcut-pill"
                >
                  <Bot size={13} /> Asistente IA
                </Link>
                <Link
                  href="/abogados"
                  onClick={() => setSearchOpen(false)}
                  className="search-shortcut-pill"
                >
                  <Users size={13} /> Abogados
                </Link>
                <Link
                  href="/biblioteca"
                  onClick={() => setSearchOpen(false)}
                  className="search-shortcut-pill"
                >
                  <Scale size={13} /> Leyes
                </Link>
              </div>
            </div>
          )}
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
              <NotificationBell />
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
          {user && (
            <>
              <div className="menu-sep" />
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </>
          )}
        </nav>
      )}

      {authOpen && <AuthDialog user={user} close={() => setAuthOpen(false)} />}
    </>
  );
}
