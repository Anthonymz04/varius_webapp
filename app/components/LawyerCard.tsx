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

interface LawyerCardProps {
  lawyer: LawyerData;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function LawyerCard({ lawyer, isFavorite, onToggleFavorite }: LawyerCardProps) {
  return (
    <article className="lawyer-card">
      <div className="lawyer-head">
        <div className="avatar" style={{ background: lawyer.color }}>
          {lawyer.initials}
        </div>
        {onToggleFavorite ? (
          <button
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className={isFavorite ? 'fav-btn active' : 'fav-btn'}
            onClick={onToggleFavorite}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        ) : (
          <button aria-label="Agregar a favoritos" className="fav-btn">
            <Heart size={18} />
          </button>
        )}
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
