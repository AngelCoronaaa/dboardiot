import { useCallback, useEffect, useState } from 'react';
import { obtenerClima, obtenerLugar, type Clima } from './clima';

export type EstadoClima =
  | 'pidiendo'
  | 'cargando'
  | 'listo'
  | 'denegado'
  | 'no-disponible'
  | 'error';

const REFRESCO_MS = 10 * 60 * 1000;

/** Pide la ubicación al abrir la app y mantiene el clima exterior actualizado. */
export function useClima() {
  const [estado, setEstado] = useState<EstadoClima>('pidiendo');
  const [clima, setClima] = useState<Clima | null>(null);
  const [lugar, setLugar] = useState<string>();
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setEstado('no-disponible');
      return;
    }

    let cancelado = false;
    let temporizador: number | undefined;
    const control = new AbortController();

    const cargar = async (lat: number, lon: number) => {
      try {
        const c = await obtenerClima(lat, lon, control.signal);
        if (cancelado) return;
        setClima(c);
        setEstado('listo');
      } catch {
        // Si ya había datos, se conservan hasta el siguiente intento.
        if (!cancelado) setEstado((e) => (e === 'listo' ? e : 'error'));
      }
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (cancelado) return;
        const { latitude: lat, longitude: lon } = coords;
        setEstado((e) => (e === 'listo' ? e : 'cargando'));
        obtenerLugar(lat, lon, control.signal)
          .then((l) => !cancelado && setLugar(l))
          .catch(() => {});
        cargar(lat, lon);
        temporizador = window.setInterval(() => cargar(lat, lon), REFRESCO_MS);
      },
      (err) => {
        if (!cancelado) setEstado(err.code === err.PERMISSION_DENIED ? 'denegado' : 'error');
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: REFRESCO_MS },
    );

    return () => {
      cancelado = true;
      control.abort();
      window.clearInterval(temporizador);
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setEstado('pidiendo');
    setIntento((n) => n + 1);
  }, []);

  return { estado, clima, lugar, reintentar };
}
