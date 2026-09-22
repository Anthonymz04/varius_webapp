'use client';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OfflineScreenProps {
  onRetry?: () => void;
}

export default function OfflineScreen({ onRetry }: OfflineScreenProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <div className="offline-container">
      <div className="offline-content">
        <div className="offline-icon">
          <WifiOff size={64} strokeWidth={1.5} />
        </div>
        <h1 className="offline-title">Sin conexión</h1>
        <p className="offline-message">
          Parece que no estás conectado o existen problemas en la red.
          <br />
          Por favor, verifica tu conexión a internet.
        </p>
        <button
          className="offline-retry-btn"
          onClick={onRetry || handleRetry}
          disabled={isRetrying}
        >
          <RefreshCw size={18} className={isRetrying ? 'spinning' : ''} />
          <span>{isRetrying ? 'Reintentando...' : 'Reintentar'}</span>
        </button>
      </div>
    </div>
  );
}