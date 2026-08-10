'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPin, Search } from 'lucide-react';
import LawyerCard from '@/app/components/LawyerCard';
import type { LawyerData } from '@/app/components/LawyerCard';

const fallbackLawyers: LawyerData[] = [
  { name: 'Valentina Mena', role: 'Derecho de familia', city: 'Quito, Ecuador', rating: '4.9', reviews: '124 reseñas', price: '$45 / consulta', color: '#d8ad96', initials: 'VM' },
  { name: 'Santiago Rivas', role: 'Derecho laboral', city: 'Guayaquil, Ecuador', rating: '4.8', reviews: '98 reseñas', price: '$38 / consulta', color: '#7e907d', initials: 'SR' },
  { name: 'Elena Paredes', role: 'Propiedad intelectual', city: 'Atención virtual', rating: '5.0', reviews: '76 reseñas', price: '$55 / consulta', color: '#9f7f8c', initials: 'EP' },
  { name: 'Carlos Mendoza', role: 'Derecho penal', city: 'Cuenca, Ecuador', rating: '4.7', reviews: '63 reseñas', price: '$50 / consulta', color: '#8b7d9b', initials: 'CM' },
  { name: 'María Fernández', role: 'Derecho tributario', city: 'Quito, Ecuador', rating: '4.9', reviews: '112 reseñas', price: '$60 / consulta', color: '#d89696', initials: 'MF' },
  { name: 'Andrés López', role: 'Derecho constitucional', city: 'Guayaquil, Ecuador', rating: '4.6', reviews: '45 reseñas', price: '$42 / consulta', color: '#7d8e90', initials: 'AL' },
];

const specialties = ['Todos', 'Derecho de familia', 'Derecho laboral', 'Propiedad intelectual', 'Derecho penal', 'Derecho tributario', 'Derecho constitucional'];
const cities = ['Todas', 'Quito, Ecuador', 'Guayaquil, Ecuador', 'Cuenca, Ecuador', 'Atención virtual'];

export default function AbogadosPage() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('Todos');
  const [city, setCity] = useState('Todas');

  const filtered = fallbackLawyers.filter((l) => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.role.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = specialty === 'Todos' || l.role === specialty;
    const matchCity = city === 'Todas' || l.city === city;
    return matchSearch && matchSpecialty && matchCity;
  });

  return (
    <section className="marketplace">
      <Link href="/" className="back">← Volver al inicio</Link>
      <p className="eyebrow">MARKETPLACE JURÍDICO</p>
      <h1>Encuentra a tu abogado ideal</h1>
      <p className="lead">Profesionales verificados, listos para orientarte.</p>

      <div className="filters">
        <div style={{ position: 'relative' }}>
          <button style={{ minWidth: '265px', color: '#777' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="¿Qué necesitas resolver?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                font: 'inherit',
                color: '#333',
                flex: 1,
                width: '100%',
              }}
            />
          </button>
        </div>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            border: '1px solid var(--line)',
            borderRadius: '10px',
            padding: '11px 13px',
            fontSize: '12px',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          {cities.map((c) => (
            <option key={c} value={c}>{c === 'Todas' ? '📍 Ciudad' : c}</option>
          ))}
        </select>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          style={{
            border: '1px solid var(--line)',
            borderRadius: '10px',
            padding: '11px 13px',
            fontSize: '12px',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          {specialties.map((s) => (
            <option key={s} value={s}>{s === 'Todos' ? 'Especialidad' : s}</option>
          ))}
        </select>
      </div>

      <p className="results">{filtered.length} abogados disponibles</p>

      <div className="market-grid">
        {filtered.map((l) => (
          <LawyerCard lawyer={l} key={l.name} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
          No se encontraron abogados con esos criterios. Prueba ajustando los filtros.
        </p>
      )}
    </section>
  );
}
