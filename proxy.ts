// Este archivo va a exisitir si es necesario para configurar quiénes pueden ver la app
// Capacitor maneja el acceso a recursos mediante el build de Android/iOS
// No necesitamos proxies complejos para un PWA simple

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  
  // Headers de seguridad básicos
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), geolocation=(), payment=()');
  
  // IMPORTANTE: La lógica de conexión offline se detecta en Client Component
  // No es necesario especificar rutas protegidas aquí
  
  return response;
}
