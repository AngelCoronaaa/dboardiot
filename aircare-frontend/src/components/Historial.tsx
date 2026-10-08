import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PuntoHistorial } from '../tipos';

const hora = (t: number) =>
  new Date(t).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const SERIES: { campo: keyof Omit<PuntoHistorial, 't'>; titulo: string; unidad: string }[] = [
  { campo: 'temperatura', titulo: 'Temperatura', unidad: '°C' },
  { campo: 'humedad', titulo: 'Humedad', unidad: '%' },
  { campo: 'humo', titulo: 'Humo (MQ2)', unidad: '' },
];

export function Historial({ puntos }: { puntos: PuntoHistorial[] }) {
  return (
    <section className="tarjeta">
      <h2 className="titulo-tarjeta">Historial · últimas {puntos.length} lecturas</h2>
      {puntos.length < 2 ? (
        <p className="secundario">Se necesitan al menos dos lecturas para graficar.</p>
      ) : (
        <div className="graficas">
          {SERIES.map((s) => (
            <figure key={s.campo} className="grafica">
              <figcaption className="secundario pequeno">
                {s.titulo}
                {s.unidad && ` (${s.unidad})`}
              </figcaption>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={puntos} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="var(--linea)" vertical={false} />
                  <XAxis
                    dataKey="t"
                    tickFormatter={hora}
                    stroke="var(--texto-2)"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    minTickGap={48}
                  />
                  <YAxis
                    stroke="var(--texto-2)"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    labelFormatter={(t) => hora(Number(t))}
                    formatter={(v) => [`${v}${s.unidad ? ` ${s.unidad}` : ''}`, s.titulo]}
                    contentStyle={{
                      background: 'var(--vidrio-fuerte)',
                      backdropFilter: 'blur(20px) saturate(170%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(170%)',
                      border: '1px solid var(--vidrio-borde)',
                      borderRadius: 14,
                      boxShadow: '0 8px 24px var(--sombra)',
                      color: 'var(--texto)',
                    }}
                    labelStyle={{ color: 'var(--texto-2)' }}
                    cursor={{ stroke: 'var(--texto-2)', strokeDasharray: '3 3' }}
                  />
                  <Line
                    type="monotone"
                    dataKey={s.campo}
                    stroke="var(--texto)"
                    strokeWidth={1.75}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--texto)', stroke: 'var(--fondo-b)', strokeWidth: 2 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
