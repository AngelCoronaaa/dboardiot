import { tonoDe } from '../niveles';
import type { Datos } from '../tipos';

interface Medida {
  titulo: string;
  campo: 'temperatura' | 'humedad' | 'humo';
  nivel: 'nivel_temperatura' | 'nivel_humedad' | 'nivel_humo';
  unidad: string;
  decimales: number;
}

const MEDIDAS: Medida[] = [
  { titulo: 'Temperatura', campo: 'temperatura', nivel: 'nivel_temperatura', unidad: '°C', decimales: 1 },
  { titulo: 'Humedad', campo: 'humedad', nivel: 'nivel_humedad', unidad: '%', decimales: 1 },
  { titulo: 'Humo (MQ2)', campo: 'humo', nivel: 'nivel_humo', unidad: '', decimales: 0 },
];

function formatear(valor: unknown, decimales: number): string {
  const n = typeof valor === 'string' ? Number(valor) : valor;
  return typeof n === 'number' && Number.isFinite(n) ? n.toFixed(decimales) : '--';
}

export function Medidas({ datos }: { datos: Datos | null }) {
  return (
    <section className="medidas" aria-label="Medidas actuales">
      {MEDIDAS.map((m) => {
        const nivel = datos?.[m.nivel];
        return (
          <article key={m.campo} className={`tarjeta medida tono-${tonoDe(nivel)}`}>
            <h2 className="titulo-tarjeta">{m.titulo}</h2>
            <p className="valor">
              {formatear(datos?.[m.campo], m.decimales)}
              {m.unidad && <span className="unidad">{m.unidad}</span>}
            </p>
            <p className="nivel">{typeof nivel === 'string' ? nivel : 'Sin datos'}</p>
          </article>
        );
      })}
    </section>
  );
}
