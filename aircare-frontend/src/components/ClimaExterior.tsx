import type { Clima } from '../clima';
import type { EstadoClima } from '../useClima';
import { IconoClima } from './IconoClima';

interface Props {
  estado: EstadoClima;
  clima: Clima | null;
  lugar?: string;
  interior?: number;
  reintentar: () => void;
}

const MENSAJES: Record<Exclude<EstadoClima, 'listo'>, string> = {
  pidiendo: 'Permite el acceso a tu ubicación para ver el clima exterior.',
  cargando: 'Cargando el clima…',
  denegado:
    'Sin permiso de ubicación. Actívalo en la configuración del navegador para ver el clima exterior.',
  'no-disponible': 'Este navegador no puede obtener la ubicación.',
  error: 'No se pudo obtener el clima exterior.',
};

export function ClimaExterior({ estado, clima, lugar, interior, reintentar }: Props) {
  return (
    <section className="tarjeta clima">
      <div className="fila-titulo">
        <h2 className="titulo-tarjeta">Exterior</h2>
        {lugar && <span className="secundario pequeno">{lugar}</span>}
      </div>

      {clima ? (
        <>
          <div className="clima-principal">
            <IconoClima condicion={clima.condicion} esDeDia={clima.esDeDia} />
            <p className="valor">
              {Math.round(clima.temperatura)}
              <span className="unidad">°C</span>
            </p>
          </div>
          <p className="clima-descripcion">{clima.descripcion}</p>

          <dl className="clima-detalles">
            <Detalle termino="Sensación" valor={`${Math.round(clima.sensacion)}°`} />
            <Detalle termino="Humedad" valor={`${Math.round(clima.humedad)}%`} />
            <Detalle termino="Viento" valor={`${Math.round(clima.viento)} km/h`} />
            {clima.maxima != null && clima.minima != null && (
              <Detalle
                termino="Máx / Mín"
                valor={`${Math.round(clima.maxima)}° / ${Math.round(clima.minima)}°`}
              />
            )}
          </dl>

          {interior != null && (
            <p className="secundario pequeno">{comparar(interior, clima.temperatura)}</p>
          )}
        </>
      ) : (
        <div className="clima-vacio">
          <p className="secundario">{MENSAJES[estado as Exclude<EstadoClima, 'listo'>]}</p>
          {(estado === 'denegado' || estado === 'error') && (
            <button type="button" className="boton" onClick={reintentar}>
              Reintentar
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function Detalle({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div>
      <dt>{termino}</dt>
      <dd>{valor}</dd>
    </div>
  );
}

function comparar(interior: number, exterior: number): string {
  const d = interior - exterior;
  if (Math.abs(d) < 0.5) return 'Adentro y afuera hay casi la misma temperatura.';
  return `Adentro hace ${Math.abs(d).toFixed(1)} °C ${d > 0 ? 'más' : 'menos'} que afuera.`;
}
