import { tonoDe } from '../niveles';

interface Props {
  calidad?: string;
  ultimaLectura: Date | null;
}

export function CalidadGeneral({ calidad, ultimaLectura }: Props) {
  return (
    <section className={`tarjeta calidad tono-${tonoDe(calidad)}`}>
      <h2 className="titulo-tarjeta">Calidad del aire</h2>
      <p className="calidad-texto">{calidad ?? 'Esperando datos...'}</p>
      <p className="secundario pequeno">
        {ultimaLectura
          ? `Última lectura: ${ultimaLectura.toLocaleTimeString('es-MX')}`
          : 'Aún no se han recibido lecturas'}
      </p>
    </section>
  );
}
