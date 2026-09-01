'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  AppNotification,
  deleteNotification,
  markNotificationsRead,
  subscribeNotifications,
} from '@/lib/firebase/notifications';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Ayer' : `Hace ${days} días`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    const unsub = subscribeNotifications(user.uid, setItems);
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!user) return null;

  const unread = items.filter((n) => !n.read).length;

  const navigateTo = (n: AppNotification) => {
    setOpen(false);
    switch (n.type) {
      case 'asesoria': router.push('/mensajes'); break;
      case 'tutoria': router.push('/perfil'); break;
      default: router.push('/perfil');
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) void markNotificationsRead(items);
  };

  return (
    <div className="notif-wrapper" ref={ref}>
      <button className="icon-btn" onClick={toggle} aria-label="Notificaciones">
        <Bell size={19} />
        {unread > 0 && <span className="notif-dot">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <b>Notificaciones</b>
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              style={{ fontSize: 11, color: 'var(--wine)', fontWeight: 600, textDecoration: 'none' }}
            >
              Ver historial
            </Link>
          </div>
          {items.length === 0 ? (
            <p className="notif-empty">
              Aún no tienes notificaciones. Cuando solicites una asesoría o reserves una tutoría, aparecerán aquí.
            </p>
          ) : (
            <ul>
              {items.map((n) => (
                <li
                  key={n.id}
                  className={n.read ? '' : 'unread'}
                  onClick={() => navigateTo(n)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <b>{n.title}</b>
                    <p>{n.body}</p>
                    <small>{timeAgo(n.createdAt)}</small>
                  </div>
                  <button
                    aria-label="Eliminar notificación"
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteNotification(n.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && (
            <div className="notif-panel-footer">
              <CheckCheck size={13} />
              <span>El historial completo permanece en tu perfil aunque borres notificaciones.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
