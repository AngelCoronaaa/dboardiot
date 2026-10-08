export type Condicion =
  | 'despejado'
  | 'parcial'
  | 'nublado'
  | 'niebla'
  | 'lluvia'
  | 'nieve'
  | 'tormenta';

export interface Clima {
  temperatura: number;
  sensacion: number;
  humedad: number;
  viento: number;
  maxima?: number;
  minima?: number;
  condicion: Condicion;
  descripcion: string;
  esDeDia: boolean;
}

/** Códigos WMO que usa Open-Meteo. */
const DESCRIPCIONES: Record<number, string> = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna',
  55: 'Llovizna intensa',
  56: 'Llovizna helada',
  57: 'Llovizna helada intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia',
  65: 'Lluvia intensa',
  66: 'Lluvia helada',
  67: 'Lluvia helada intensa',
  71: 'Nevada ligera',
  73: 'Nevada',
  75: 'Nevada intensa',
  77: 'Granos de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos',
  82: 'Chubascos fuertes',
  85: 'Chubascos de nieve',
  86: 'Chubascos de nieve fuertes',
  95: 'Tormenta',
  96: 'Tormenta con granizo',
  99: 'Tormenta con granizo fuerte',
};

export function condicionDe(codigo: number): Condicion {
  if (codigo <= 1) return 'despejado';
  if (codigo === 2) return 'parcial';
  if (codigo === 3) return 'nublado';
  if (codigo === 45 || codigo === 48) return 'niebla';
  if ((codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86) return 'nieve';
  if (codigo >= 95) return 'tormenta';
  if (codigo >= 51 && codigo <= 82) return 'lluvia';
  return 'nublado';
}

/** Se usa mientras no hay datos del clima. */
export function esDeDiaLocal(fecha = new Date()): boolean {
  const h = fecha.getHours();
  return h >= 7 && h < 19;
}

export async function obtenerClima(lat: number, lon: number, signal: AbortSignal): Promise<Clima> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '1',
  }).toString();

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
  const json = await res.json();
  const c = json.current;
  const codigo = Number(c.weather_code);

  return {
    temperatura: c.temperature_2m,
    sensacion: c.apparent_temperature,
    humedad: c.relative_humidity_2m,
    viento: c.wind_speed_10m,
    maxima: json.daily?.temperature_2m_max?.[0],
    minima: json.daily?.temperature_2m_min?.[0],
    condicion: condicionDe(codigo),
    descripcion: DESCRIPCIONES[codigo] ?? 'Sin descripción',
    esDeDia: c.is_day === 1,
  };
}

/** Nombre de la ciudad; si falla no pasa nada, solo no se muestra. */
export async function obtenerLugar(
  lat: number,
  lon: number,
  signal: AbortSignal,
): Promise<string | undefined> {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
  url.search = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    localityLanguage: 'es',
  }).toString();

  const res = await fetch(url, { signal });
  if (!res.ok) return undefined;
  const json = await res.json();
  return json.city || json.locality || undefined;
}
