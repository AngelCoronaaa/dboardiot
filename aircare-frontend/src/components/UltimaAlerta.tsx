import { tonoDe } from '../niveles';
import type { Alerta } from '../tipos';

interface Props {
  alerta: { alerta: Alerta; recibida: Date } | null;
}

export function UltimaAlerta({ alerta }: Props) {
  const anterior = texto(alerta?.alerta.anterior);
  const actual = texto(alerta?.alerta.actual);

  return (
    <section className="tarjeta">
      <h2 className="titulo-tarjeta">Último cambio de estado</h2>
      {alerta ? (
        <>
          <p className="transicion">
            <span className={`tono-${tonoDe(anterior)} texto-tono`}>{anterior}</span>
            <span className="flecha" aria-label="cambió a">→</span>
            <span className={`tono-${tonoDe(actual)} texto-tono`}>{actual}</span>
          </p>
          <p className="secundario pequeno">{alerta.recibida.toLocaleTimeString('es-MX')}</p>
        </>
      ) : (
        <p className="secundario">Sin cambios registrados</p>
      )}
    </section>
  );
}

function texto(valor: unknown): string {
  return typeof valor === 'string' && valor ? valor : '—';
}
