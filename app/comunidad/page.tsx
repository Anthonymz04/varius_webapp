'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import AuthDialog from '@/app/components/AuthDialog';
import {
  Post,
  PostComment,
  addComment,
  createPost,
  fetchComments,
  fetchPosts,
  toggleLike,
} from '@/lib/firebase/comunidad';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hace 1 día';
  return `Hace ${days} días`;
}

export default function ComunidadPage() {
  const { user, role } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftTags, setDraftTags] = useState('');
  const [sending, setSending] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentDraft, setCommentDraft] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await fetchPosts(user?.uid ?? undefined));
    } catch {
      setPosts(await fetchPosts());
    } finally {
      setLoading(false);
    }
  }, [user?.uid ?? null]);

  useEffect(() => {
    void load();
  }, [load]);

  const publicar = async () => {
    if (!user || !draft.trim() || sending) return;
    setSending(true);
    try {
      const tags = draftTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 3);
      await createPost(user.uid, user.displayName || 'Usuario VARIUS', draft.trim(), tags);
      setDraft('');
      setDraftTags('');
      await load();
    } catch {
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  const onLike = async (post: Post) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) }
          : p
      )
    );
    try {
      await toggleLike(post.id, user.uid, post.likedByMe);
    } catch {
      await load();
    }
  };

  const abrirComentarios = async (post: Post) => {
    if (openComments === post.id) {
      setOpenComments(null);
      return;
    }
    setOpenComments(post.id);
    setCommentDraft('');
    try {
      setComments(await fetchComments(post.id));
    } catch {
      setComments([]);
    }
  };

  const enviarComentario = async () => {
    if (!openComments || !commentDraft.trim() || sending) return;
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setSending(true);
    try {
      await addComment(openComments, user.displayName || 'Usuario VARIUS', commentDraft.trim());
      setCommentDraft('');
      setComments(await fetchComments(openComments));
      setPosts((prev) =>
        prev.map((p) => (p.id === openComments ? { ...p, commentCount: p.commentCount + 1 } : p))
      );
    } catch {
      await load();
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="community-page">
      <Link href="/" className="back">← Volver al inicio</Link>
      <p className="eyebrow">COMUNIDAD VARIUS</p>
      <h1>Conecta con la comunidad jurídica</h1>
      <p className="lead">
        Un espacio para debatir, compartir conocimientos y crecer junto a otros estudiantes y profesionales del Derecho.
      </p>

      {user ? (
        <div className="composer" style={{ margin: '30px 0 24px', padding: '18px 22px', border: '1px solid var(--line)', borderRadius: '15px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className="avatar" style={{ background: '#c9a227', width: 36, height: 36, fontSize: 11 }}>
              {(user.displayName || user.email || '?').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="¿Qué quieres compartir con la comunidad?"
                style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: 60, font: 'inherit', fontSize: 13 }}
              />
              <input
                value={draftTags}
                onChange={(e) => setDraftTags(e.target.value)}
                placeholder="Etiquetas separadas por coma (máx. 3)"
                style={{ width: '100%', border: 'none', outline: 'none', borderTop: '1px solid var(--line)', paddingTop: 8, font: 'inherit', fontSize: 12 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#999' }}>Publicando como {role ?? 'usuario'}</span>
            <button className="landing-btn primary compact" disabled={sending || !draft.trim()} onClick={publicar}>
              <Send size={14} /> <span>{sending ? 'Publicando…' : 'Publicar'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ margin: '30px 0 24px', padding: '18px 22px', border: '1px solid var(--line)', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '14px', opacity: 0.8 }}>
          <div className="avatar" style={{ background: '#ccc', width: '36px', height: '36px', fontSize: '11px' }}>?</div>
          <span style={{ color: '#999', fontSize: 13, flex: 1 }}>Inicia sesión para compartir con la comunidad.</span>
          <button className="landing-btn secondary compact" onClick={() => setAuthOpen(true)}>Acceder</button>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>Cargando publicaciones…</p>
      ) : (
        posts.map((post) => (
          <article className="community-post" key={post.id}>
            <div className="community-post-header">
              <div className="avatar" style={{ background: post.color }}>{post.initials}</div>
              <div>
                <b>{post.author}</b>
                <small>{timeAgo(post.createdAt)}</small>
              </div>
            </div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{post.body}</p>
            <div className="community-post-tags">
              {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <div className="community-post-actions">
              <button onClick={() => onLike(post)} style={post.likedByMe ? { color: 'var(--wine)', fontWeight: 600 } : undefined}>
                <Heart size={15} fill={post.likedByMe ? 'currentColor' : 'none'} /> {post.likeCount}
              </button>
              <button onClick={() => abrirComentarios(post)}>
                <MessageCircle size={15} /> {post.commentCount}
              </button>
            </div>

            {openComments === post.id && (
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 12 }}>
                {comments.length === 0 && (
                  <p style={{ fontSize: 12, color: '#999', margin: '0 0 10px' }}>Todavía no hay comentarios. Sé el primero en opinar.</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: '1px dashed #f0edef' }}>
                    <div className="avatar" style={{ background: '#e8e4e5', color: '#666', width: 28, height: 28, fontSize: 10 }}>
                      {(c.author || '?').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <b style={{ fontSize: 12 }}>{c.author}</b>
                      <p style={{ margin: '2px 0 0', fontSize: 12 }}>{c.body}</p>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Escribe un comentario…"
                    className="input-field"
                    onKeyDown={(e) => { if (e.key === 'Enter') enviarComentario(); }}
                  />
                  <button className="landing-btn primary compact" disabled={sending || !commentDraft.trim()} onClick={enviarComentario}>
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </article>
        ))
      )}

      {authOpen && <AuthDialog user={null} close={() => setAuthOpen(false)} />}
    </section>
  );
}
