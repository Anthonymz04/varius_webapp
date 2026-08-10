'use client';

import { Heart, MapPin, Star } from 'lucide-react';

export interface LawyerData {
  name: string;
  role: string;
  city: string;
  rating: string;
  reviews: string;
  price: string;
  color: string;
  initials: string;
}

export default function LawyerCard({ lawyer }: { lawyer: LawyerData }) {
  return (
    <article className="lawyer-card">
      <div className="lawyer-head">
        <div className="avatar" style={{ background: lawyer.color }}>
          {lawyer.initials}
        </div>
        <button aria-label="Agregar a favoritos">
          <Heart size={18} />
        </button>
      </div>
      <div>
        <h3>{lawyer.name}</h3>
        <p>{lawyer.role}</p>
        <span className="rating">
          <Star size={14} fill="currentColor" /> {lawyer.rating}{' '}
          <em>({lawyer.reviews})</em>
        </span>
      </div>
      <div className="lawyer-bottom">
        <span>
          <MapPin size={14} />
          {lawyer.city}
        </span>
        <b>{lawyer.price}</b>
      </div>
    </article>
  );
}
