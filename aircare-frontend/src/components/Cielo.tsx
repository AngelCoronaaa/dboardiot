import type { CSSProperties } from 'react';
import type { Condicion } from '../clima';

interface Props {
  condicion: Condicion | null;
  esDeDia: boolean;
}

/** Pseudoaleatorio determinista para que las partículas no cambien entre renders. */
function azar(i: number, semilla: number): number {
  const x = Math.sin(i * 127.1 + semilla * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const vars = (v: Record<string, string | number>) => v as CSSProperties;

const GOTAS = Array.from({ length: 70 }, (_, i) => ({
  x: azar(i, 1) * 110 - 5,
  retraso: -azar(i, 2) * 2,
  duracion: 0.55 + azar(i, 3) * 0.45,
  largo: 36 + azar(i, 4) * 44,
  opacidad: 0.3 + azar(i, 5) * 0.5,
}));

const COPOS = Array.from({ length: 60 }, (_, i) => ({
  x: azar(i, 6) * 100,
  retraso: -azar(i, 7) * 14,
  duracion: 9 + azar(i, 8) * 9,
  tamano: 3 + azar(i, 9) * 5,
  deriva: (azar(i, 10) - 0.5) * 120,
}));

const ESTRELLAS = Array.from({ length: 40 }, (_, i) => ({
  x: azar(i, 11) * 100,
  y: azar(i, 12) * 60,
  retraso: -azar(i, 13) * 6,
  tamano: 1 + azar(i, 14) * 1.5,
}));

const NUBES = [
  { x: -8, y: 6, escala: 1.25, duracion: 70 },
  { x: 48, y: 2, escala: 1, duracion: 85 },
  { x: 22, y: 26, escala: 0.85, duracion: 60 },
  { x: 70, y: 22, escala: 1.1, duracion: 95 },
  { x: 5, y: 48, escala: 0.9, duracion: 75 },
];

const CANTIDAD_NUBES: Record<Condicion, number> = {
  despejado: 0,
  parcial: 2,
  nublado: 5,
  niebla: 0,
  lluvia: 4,
  nieve: 3,
  tormenta: 5,
};

/** Fondo de toda la app: refleja el clima exterior de forma minimalista. */
export function Cielo({ condicion, esDeDia }: Props) {
  const c = condicion ?? 'desconocido';
  const nubes = condicion ? CANTIDAD_NUBES[condicion] : 0;
  const conAstro = c === 'despejado' || c === 'parcial' || c === 'desconocido';
  const conEstrellas = !esDeDia && (c === 'despejado' || c === 'parcial');

  return (
    <div className={`cielo cielo-${c} ${esDeDia ? 'dia' : 'noche'}`} aria-hidden>
      {conEstrellas && (
        <div className="capa">
          {ESTRELLAS.map((e, i) => (
            <span
              key={i}
              className="estrella"
              style={vars({ left: `${e.x}%`, top: `${e.y}%`, '--tamano': `${e.tamano}px`, animationDelay: `${e.retraso}s` })}
            />
          ))}
        </div>
      )}

      {conAstro && <div className={`astro ${esDeDia ? 'sol' : 'luna'}`} />}

      {nubes > 0 && (
        <div className="capa">
          {NUBES.slice(0, nubes).map((n, i) => (
            <span
              key={i}
              className="nube"
              style={vars({ left: `${n.x}%`, top: `${n.y}%`, '--escala': n.escala, animationDuration: `${n.duracion}s` })}
            />
          ))}
        </div>
      )}

      {c === 'niebla' && (
        <div className="capa">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="banda" style={vars({ '--i': i })} />
          ))}
        </div>
      )}

      {(c === 'lluvia' || c === 'tormenta') && (
        <div className="capa lluvia">
          {GOTAS.map((g, i) => (
            <span
              key={i}
              className="gota"
              style={vars({
                left: `${g.x}%`,
                height: `${g.largo}px`,
                opacity: g.opacidad,
                animationDelay: `${g.retraso}s`,
                animationDuration: `${g.duracion}s`,
              })}
            />
          ))}
        </div>
      )}

      {c === 'nieve' && (
        <div className="capa">
          {COPOS.map((f, i) => (
            <span
              key={i}
              className="copo"
              style={vars({
                left: `${f.x}%`,
                '--tamano': `${f.tamano}px`,
                '--deriva': `${f.deriva}px`,
                animationDelay: `${f.retraso}s`,
                animationDuration: `${f.duracion}s`,
              })}
            />
          ))}
        </div>
      )}

      {c === 'tormenta' && <div className="relampago" />}
    </div>
  );
}
