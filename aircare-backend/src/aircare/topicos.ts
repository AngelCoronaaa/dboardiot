const BASE = 'aircare/equipo5';

/** Tópicos de telemetría que se reemiten tal cual hacia el navegador. */
export const TOPICOS_TELEMETRIA: Record<string, 'datos' | 'estado' | 'alerta'> = {
  [`${BASE}/datos`]: 'datos',
  [`${BASE}/estado`]: 'estado',
  [`${BASE}/alerta`]: 'alerta',
};

/**
 * Tópicos de comando. El backend también se suscribe a ellos (son retenidos)
 * para que los switches del navegador reflejen el estado vigente, incluso si
 * el cambio vino del dashboard de Node-RED.
 */
export const COMANDOS = {
  modo: { topico: `${BASE}/cmd/modo`, valores: ['manual', 'auto'] },
  alarma: { topico: `${BASE}/cmd/alarma`, valores: ['ON', 'OFF'] },
  ventilador: { topico: `${BASE}/cmd/ventilador`, valores: ['ON', 'OFF'] },
} as const;

export type TipoComando = keyof typeof COMANDOS;

export const TOPICO_COMANDOS_WILDCARD = `${BASE}/cmd/+`;

export function tipoComandoDeTopico(topico: string): TipoComando | undefined {
  return (Object.keys(COMANDOS) as TipoComando[]).find(
    (tipo) => COMANDOS[tipo].topico === topico,
  );
}
