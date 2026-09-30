import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  Alerta,
  Comandos,
  ConexionBackend,
  Datos,
  EstadoPlaca,
  PuntoHistorial,
  TipoComando,
} from './tipos';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';
const TOKEN = import.meta.env.VITE_DASHBOARD_TOKEN ?? '';
const MAX_PUNTOS = 50;

interface RespuestaComando {
  ok: boolean;
  error?: string;
}

function numero(valor: unknown): number | undefined {
  const n = typeof valor === 'string' ? Number(valor) : valor;
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
}

export function useAirCare() {
  const socketRef = useRef<Socket | null>(null);
  const ultimoDatosRef = useRef<string>('');

  const [conexion, setConexion] = useState<ConexionBackend>('conectando');
  const [broker, setBroker] = useState<boolean | null>(null);
  const [placa, setPlaca] = useState<EstadoPlaca>('desconocido');
  const [datos, setDatos] = useState<Datos | null>(null);
  const [ultimaLectura, setUltimaLectura] = useState<Date | null>(null);
  const [historial, setHistorial] = useState<PuntoHistorial[]>([]);
  const [alerta, setAlerta] = useState<{ alerta: Alerta; recibida: Date } | null>(null);
  const [comandos, setComandos] = useState<Comandos>({});
  const [errorComando, setErrorComando] = useState<string | null>(null);

  const comandosRef = useRef(comandos);
  comandosRef.current = comandos;

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      path: '/api/socket.io',
      auth: { token: TOKEN },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConexion('conectado'));
    socket.on('disconnect', (motivo) => {
      setConexion('desconectado');
      setBroker(null);
      // Si el servidor cerró la sesión, Socket.IO no reintenta solo.
      if (motivo === 'io server disconnect') socket.connect();
    });
    socket.on('connect_error', (err) => {
      setConexion(err.message === 'unauthorized' ? 'no-autorizado' : 'desconectado');
    });

    socket.on('broker', (conectado: boolean) => setBroker(conectado));

    socket.on('estado', (estado: unknown) => {
      const e = String(estado).trim().toLowerCase();
      setPlaca(e === 'online' ? 'online' : e === 'offline' ? 'offline' : 'desconocido');
    });

    socket.on('datos', (d: Datos) => {
      if (!d || typeof d !== 'object') return;
      setDatos(d);
      setUltimaLectura(new Date());

      // Al (re)conectar el backend reenvía la última lectura; no duplicarla en la gráfica.
      const firma = JSON.stringify(d);
      if (firma === ultimoDatosRef.current) return;
      ultimoDatosRef.current = firma;

      const punto: PuntoHistorial = {
        t: Date.now(),
        temperatura: numero(d.temperatura),
        humedad: numero(d.humedad),
        humo: numero(d.humo),
      };
      setHistorial((h) => [...h, punto].slice(-MAX_PUNTOS));
    });

    socket.on('alerta', (a: Alerta) => {
      if (a && typeof a === 'object') setAlerta({ alerta: a, recibida: new Date() });
    });

    socket.on('comando', ({ tipo, valor }: { tipo: TipoComando; valor: string }) => {
      setComandos((c) => ({ ...c, [tipo]: valor }));
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const enviar = useCallback(
    <T extends TipoComando>(tipo: T, valor: NonNullable<Comandos[T]>) => {
      const socket = socketRef.current;
      if (!socket?.connected) return;

      const anterior = comandosRef.current[tipo];
      setComandos((c) => ({ ...c, [tipo]: valor }));
      setErrorComando(null);

      socket
        .timeout(5000)
        .emit(`cmd:${tipo}`, valor, (err: Error | null, resp?: RespuestaComando) => {
          if (!err && resp?.ok) return;
          setComandos((c) => ({ ...c, [tipo]: anterior }));
          setErrorComando(
            err ? 'El servidor no respondió al comando' : resp?.error ?? 'Error desconocido',
          );
        });
    },
    [],
  );

  return {
    conexion,
    broker,
    placa,
    datos,
    ultimaLectura,
    historial,
    alerta,
    comandos,
    errorComando,
    enviar,
  };
}
