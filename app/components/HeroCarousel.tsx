'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
  onOpenAuth: () => void;
}

export default function HeroCarousel({ onOpenAuth }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = [
    {
      id: 'main',
      bgType: 'full-image',
      bgImage: '/hero.png',
      title: (
        <>
          Tu Derecho,<br />más <span>cerca</span>
        </>
      ),
      description:
        'Conectamos personas, estudiantes y profesionales en un ecosistema jurídico inteligente para Ecuador.',
      primaryBtn: { label: 'Comenzar gratis', action: onOpenAuth },
      secondaryBtn: { label: 'Explorar biblioteca', href: '/biblioteca' },
    },
    {
      id: 'ai-assistant',
      bgType: 'gradient-chat',
      bgStyle: 'linear-gradient(135deg, #1e0d16 0%, #341221 50%, #150910 100%)',
      title: (
        <>
          Orientación legal<br />inteligente con <span>IA</span>
        </>
      ),
      description:
        'Resuelve dudas sobre la Constitución, COIP, Código del Trabajo y normativa ecuatoriana al instante.',
      primaryBtn: { label: 'Probar Asistente IA', href: '/asistente' },
      secondaryBtn: { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
    },
    {
      id: 'library',
      bgType: 'full-image',
      bgImage: '/hero-library.png',
      title: (
        <>
          Leyes y Códigos<br />de <span>Ecuador</span>
        </>
      ),
      description:
        'Accede a modelos de contratos, guías de arrendamiento, demandas de alimentos y leyes orgánicas.',
      primaryBtn: { label: 'Explorar Biblioteca', href: '/biblioteca' },
      secondaryBtn: { label: 'Ver guías prácticas', href: '/tutorias' },
    },
    {
      id: 'lawyers',
      bgType: 'full-image',
      bgImage: '/hero-lawyer.png',
      title: (
        <>
          Conecta con<br />abogados <span>expertos</span>
        </>
      ),
      description:
        'Encuentra al profesional ideal en Quito, Guayaquil, Cuenca o atención virtual verificado por especialidad.',
      primaryBtn: { label: 'Buscar Abogado', href: '/abogados' },
      secondaryBtn: { label: 'Acceder para contactar', action: onOpenAuth },
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className="hero-carousel-wrapper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-carousel-container">
        {slides.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <div
              key={slide.id}
              className={`hero-slide ${isActive ? 'active' : ''}`}
              style={
                slide.bgType === 'full-image'
                  ? { backgroundImage: `url(${slide.bgImage})` }
                  : { background: slide.bgStyle }
              }
            >
              {/* Overlay gradient on full-image slides for crisp left text readability */}
              {slide.bgType === 'full-image' && <div className="slide-full-overlay" />}

              <div className="hero-slide-grid">
                {/* Left Column: Text & Buttons */}
                <div className="slide-content">
                  <h1>{slide.title}</h1>
                  <p className="lead">{slide.description}</p>
                  <div className="slide-ctas">
                    {slide.primaryBtn.href ? (
                      <Link href={slide.primaryBtn.href} className="landing-btn primary compact">
                        <span>{slide.primaryBtn.label}</span> <ArrowRight size={15} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={slide.primaryBtn.action}
                        className="landing-btn primary compact"
                      >
                        <span>{slide.primaryBtn.label}</span> <ArrowRight size={15} />
                      </button>
                    )}

                    {slide.secondaryBtn &&
                      (slide.secondaryBtn.href ? (
                        <Link href={slide.secondaryBtn.href} className="landing-btn secondary compact">
                          <span>{slide.secondaryBtn.label}</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={slide.secondaryBtn.action}
                          className="landing-btn secondary compact"
                        >
                          <span>{slide.secondaryBtn.label}</span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Right Column: Chat widget (only for AI assistant slide) */}
                {slide.bgType === 'gradient-chat' && (
                  <div className="slide-visual">
                    <div className="slide-chat-card">
                      <div className="chat-card-header">
                        <div className="chat-ai-icon">
                          <Bot size={17} />
                        </div>
                        <div>
                          <b>Asistente jurídico</b>
                          <span><i /> En línea</span>
                        </div>
                      </div>
                      <div className="chat-card-body">
                        <div className="chat-msg ai">
                          <p>Hola. ¿En qué asunto legal puedo orientarte hoy?</p>
                        </div>
                        <div className="chat-msg user">
                          <p>Me despidieron sin justificación, ¿qué derechos tengo?</p>
                        </div>
                        <div className="chat-msg ai">
                          <p>Según el Código del Trabajo de Ecuador, tienes derecho a indemnización por despido intempestivo…</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button className="carousel-arrow prev" onClick={prevSlide} aria-label="Anterior">
        <ChevronLeft size={22} />
      </button>
      <button className="carousel-arrow next" onClick={nextSlide} aria-label="Siguiente">
        <ChevronRight size={22} />
      </button>

      {/* Indicator Dots */}
      <div className="carousel-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`dot ${idx === current ? 'active' : ''}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Ir al slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
