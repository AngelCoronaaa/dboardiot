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

/**
 * Cada nube cruza la pantalla de izquierda a derecha en bucle. `fase` reparte las
 * nubes a lo ancho desde el inicio; las grandes van más rápido (parece que están más cerca).
 */
const NUBES = [
  { y: 4, escala: 1.3, duracion: 55, fase: 0.15 },
  { y: 18, escala: 0.8, duracion: 90, fase: 0.6 },
  { y: 30, escala: 1.1, duracion: 65, fase: 0.85 },
  { y: 10, escala: 0.95, duracion: 80, fase: 0.4 },
  { y: 44, escala: 1.2, duracion: 60, fase: 0.3 },
  { y: 58, escala: 0.85, duracion: 95, fase: 0.75 },
  { y: 70, escala: 1, duracion: 75, fase: 0.05 },
];

const CANTIDAD_NUBES: Record<Condicion | 'desconocido', number> = {
  despejado: 0,
  parcial: 3,
  nublado: 7,
  niebla: 0,
  lluvia: 6,
  nieve: 4,
  tormenta: 7,
  desconocido: 2,
};

/** Fondo de toda la app: refleja el clima exterior de forma minimalista. */
export function Cielo({ condicion, esDeDia }: Props) {
  const c = condicion ?? 'desconocido';
  const nubes = CANTIDAD_NUBES[c];
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
          <span className="fugaz" />
          <span className="fugaz" style={vars({ top: '22%', left: '55%', animationDelay: '-9s', animationDuration: '17s' })} />
        </div>
      )}

      {conAstro && <div className={`astro ${esDeDia ? 'sol' : 'luna'}`} />}

      {nubes > 0 && (
        <div className="capa">
          {NUBES.slice(0, nubes).map((n, i) => (
            <span
              key={i}
              className="nube"
              style={vars({
                top: `${n.y}%`,
                '--escala': n.escala,
                animationDuration: `${n.duracion}s`,
                animationDelay: `${-n.fase * n.duracion}s`,
              })}
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
