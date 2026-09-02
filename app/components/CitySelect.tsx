'use client';
import { useState, useRef, useEffect } from 'react';
import { filterCities } from '@/lib/ecuador-cities';

interface CitySelectProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export default function CitySelect({ value, onChange, placeholder = 'Tu ciudad', disabled, label }: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setFiltered(filterCities(query));
    }
  }, [query, open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <label style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
      {label && <>{label}<br /></>}
    <div ref={ref} style={{ position: 'relative', marginTop: label ? 4 : 0 }}>
      <input
        className="input-field"
        style={{ paddingRight: 32, cursor: 'default' }}
        value={open ? query : value}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => { setOpen(true); setQuery(''); }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
      />
      <span
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          fontSize: 10, color: '#999', pointerEvents: 'none',
        }}
      >
        ▾
      </span>
      {open && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
            background: '#fff', border: '1px solid var(--line)', borderRadius: 10,
            marginTop: 4, maxHeight: 220, overflowY: 'auto', boxShadow: '0 6px 20px rgba(0,0,0,.12)',
          }}
        >
          {filtered.length === 0 && (
            <div style={{ padding: 12, fontSize: 12, color: '#999' }}>
              {query.trim() ? 'Selecciona un valor para continuar escribiendo…' : 'No hay ciudades disponibles'}
            </div>
          )}
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 14px', fontSize: 12, border: 'none', background: c === value ? '#fdf1f6' : 'transparent',
                color: 'var(--ink)', cursor: 'pointer',
              }}
              onMouseDown={(e) => { e.preventDefault(); onChange(c); setOpen(false); }}
            >
              {c}
            </button>
          ))}
          {query.trim() && !filtered.some((c) => c.toLowerCase() === query.trim().toLowerCase()) && (
            <button
              type="button"
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 14px', fontSize: 12, borderTop: '1px dashed var(--line)',
                background: '#f9f9f9', color: '#888', cursor: 'pointer',
              }}
              onMouseDown={(e) => { e.preventDefault(); onChange(query.trim()); setOpen(false); }}
            >
              Usar &quot;{query.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
    </label>
  );
}