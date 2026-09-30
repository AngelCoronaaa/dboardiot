export type Tono = 'bueno' | 'medio' | 'malo' | 'neutro';

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Traduce un nivel textual del ESP32 (SALUDABLE, ACEPTABLE, CRÍTICA, ...) a un tono de color. */
export function tonoDe(nivel: unknown): Tono {
  if (typeof nivel !== 'string' || !nivel.trim()) return 'neutro';
  const n = normalizar(nivel);
  if (/critic|peligr|malo|mala/.test(n)) return 'malo';
  if (/aceptable|moderad|medio|media|regular|precaucion|advertencia|alto|alta|bajo|baja/.test(n)) {
    return 'medio';
  }
  if (/saludable|normal|bueno|buena|optimo|optima|ok/.test(n)) return 'bueno';
  return 'neutro';
}
