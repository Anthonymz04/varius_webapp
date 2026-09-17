import { Bot, BookOpen, CalendarDays, MessageCircle, Search, Shield, Users } from 'lucide-react';
import type { ComponentType } from 'react';

export interface PlanBeneficio {
  text: string;
  icon: ComponentType<{ size?: number }>;
}

export interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  priceNote: string;
  featured: boolean;
  benefits: PlanBeneficio[];
  cta: 'whatsapp' | 'contacto' | 'auth';
}

export const planes: Plan[] = [
  {
    id: 'gratis',
    name: 'Explora',
    subtitle: 'Para ciudadanos que empiezan',
    price: 'Gratis',
    priceNote: 'Siempre disponible',
    featured: false,
    benefits: [
      { text: 'Asistente IA con orientación legal básica', icon: Bot },
      { text: 'Biblioteca jurídica de Ecuador', icon: BookOpen },
      { text: 'Acceso a abogados verificados', icon: Search },
      { text: 'Participa en la comunidad', icon: Users },
    ],
    cta: 'auth',
  },
  {
    id: 'estudiante',
    name: 'Estudiante',
    subtitle: 'Aprende y accede con más profundidad',
    price: '$4.99/mes',
    priceNote: 'Facturación anual disponible',
    featured: true,
    benefits: [
      { text: 'Asistente IA ampliada y sin límites', icon: Bot },
      { text: 'Tutorías 1:1 con profesionales', icon: CalendarDays },
      { text: 'Guías y modelos de documentos', icon: BookOpen },
      { text: 'Asesoría prioritaria en marketplace', icon: Users },
    ],
    cta: 'contacto',
  },
  {
    id: 'profesional',
    name: 'Profesional',
    subtitle: 'Para abogados y despachos',
    price: 'Desde $9.99/mes',
    priceNote: 'Incluye verificación de perfil',
    featured: false,
    benefits: [
      { text: 'Perfil destacado en el marketplace', icon: Shield },
      { text: 'Asesorías y chats 1:1 persistentes', icon: MessageCircle },
      { text: 'IA avanzada con historial ilimitado', icon: Bot },
      { text: 'Tutorías abiertas a la comunidad', icon: CalendarDays },
    ],
    cta: 'contacto',
  },
];
