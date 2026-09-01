'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, Bot, HelpCircle, Instagram, LogOut, Mail, Menu, MessageCircle, Music2, Scale, Search, Settings, User, Users, X, Youtube } from 'lucide-react';
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

  // The home route for guests has its own landing header; logged-in users
  // still need the global header (brand, bell, account).
  if (pathname === '/' && !user) return null;

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
          <Link className="mn-profile" href="/perfil" onClick={() => setMenu(false)}>
            <span className="mn-avatar">{initials}</span>
            <span>
              <b>{user?.displayName || 'Mi perfil'}</b>
              <small>{user ? (user.email ?? 'Cuenta VARIUS') : 'Inicia sesión para continuar'}</small>
            </span>
          </Link>

          <div className="mn-section">ACTIVIDAD</div>
          <Link className="mn-item" href="/mensajes" onClick={() => setMenu(false)}>
            <MessageCircle size={17} /> Asesorías activas
          </Link>
          <Link className="mn-item" href="/perfil" onClick={() => setMenu(false)}>
            <Settings size={17} /> Configuración de cuenta
          </Link>

          <div className="mn-section">VARIUS</div>
          <Link className="mn-item" href="/nosotros" onClick={() => setMenu(false)}>
            <BookOpen size={17} /> Misión y visión
          </Link>
          <Link className="mn-item" href="/nosotros" onClick={() => setMenu(false)}>
            <Mail size={17} /> Contáctanos
          </Link>

          <div className="mn-section">AYUDA</div>
          <Link className="mn-item" href="/preguntas-frecuentes" onClick={() => setMenu(false)}>
            <HelpCircle size={17} /> Preguntas frecuentes
          </Link>
          <Link className="mn-item" href="/asistente" onClick={() => setMenu(false)}>
            <User size={17} /> Soporte con IA
          </Link>

          <div className="mn-section">SÍGUENOS</div>
          <div className="mn-socials">
            <a href="https://instagram.com/varius_legal" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
            <a href="https://tiktok.com/@varius_legal" target="_blank" rel="noopener noreferrer"><Music2 size={18} /></a>
            <a href="https://youtube.com/@varius_legal" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>
          </div>

          {!user && (
            <div className="mn-sep" />
          )}
          {!user && (
            <button className="mn-logout" onClick={() => { setMenu(false); setAuthOpen(true); }}>
              Acceder
            </button>
          )}
          {user && (
            <>
              <div className="mn-sep" />
              <button className="mn-logout" onClick={handleLogout}>
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
