/**
 * Payload del evento "datos" (el mismo JSON que publica el ESP32).
 * Si el firmware usa otros nombres de campo, ajustarlos aquí y en `calidadDe`.
 */
export interface Datos {
  temperatura?: number;
  humedad?: number;
  humo?: number;
  nivel_temperatura?: string;
  nivel_humedad?: string;
  nivel_humo?: string;
  calidad?: string;
  calidad_aire?: string;
  [campo: string]: unknown;
}

/** Payload del evento "alerta". */
export interface Alerta {
  anterior?: string;
  actual?: string;
  [campo: string]: unknown;
}

export type EstadoPlaca = 'online' | 'offline' | 'desconocido';

export type ConexionBackend =
  | 'conectando'
  | 'conectado'
  | 'desconectado'
  | 'no-autorizado';

export type Modo = 'manual' | 'auto';
export type OnOff = 'ON' | 'OFF';

export interface Comandos {
  modo?: Modo;
  alarma?: OnOff;
  ventilador?: OnOff;
}

export type TipoComando = keyof Comandos;

export interface PuntoHistorial {
  t: number;
  temperatura?: number;
  humedad?: number;
  humo?: number;
}

export function calidadDe(datos: Datos | null): string | undefined {
  const valor = datos?.calidad ?? datos?.calidad_aire;
  return typeof valor === 'string' ? valor : undefined;
}
