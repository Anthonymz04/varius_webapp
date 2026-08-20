'use client';

import { useEffect, useState } from 'react';
import { fetchMyRequests, type ConsultationRequest } from '@/lib/firebase/marketplace';
import { fetchMisReservas, type TutorReserva } from '@/lib/firebase/tutorias';

export function useMisSolicitudes(uid: string | undefined) {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [reservas, setReservas] = useState<TutorReserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setRequests([]);
      setReservas([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchMyRequests(uid),
      fetchMisReservas(uid),
    ])
      .then(([reqs, res]) => {
        if (cancelled) return;
        setRequests(reqs);
        setReservas(res);
      })
      .catch(() => {
        if (cancelled) return;
        setRequests([]);
        setReservas([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return { requests, reservas, loading };
}
