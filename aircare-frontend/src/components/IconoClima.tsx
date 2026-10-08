import type { Condicion } from '../clima';

const NUBE = 'M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 9.2 4.5 4.5 0 0 0 7 18z';

export function IconoClima({ condicion, esDeDia }: { condicion: Condicion; esDeDia: boolean }) {
  return (
    <svg
      className="icono-clima"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dibujo(condicion, esDeDia)}
    </svg>
  );
}

function dibujo(condicion: Condicion, esDeDia: boolean) {
  switch (condicion) {
    case 'despejado':
      return esDeDia ? <Sol /> : <Luna />;
    case 'parcial':
      return (
        <>
          <g transform="translate(-3 -4) scale(.75)">{esDeDia ? <Sol /> : <Luna />}</g>
          <path d={NUBE} transform="translate(2 2) scale(.9)" />
        </>
      );
    case 'nublado':
      return <path d={NUBE} />;
    case 'niebla':
      return <path d="M4 8h16M3 12h18M5 16h14M8 20h8" />;
    case 'lluvia':
      return (
        <>
          <path d={NUBE} transform="translate(0 -3)" />
          <path d="M8 19l-1 2.5M12 19l-1 2.5M16 19l-1 2.5" />
        </>
      );
    case 'nieve':
      return (
        <>
          <path d={NUBE} transform="translate(0 -3)" />
          <path d="M8 20h.01M12 21h.01M16 20h.01" strokeWidth={2.4} />
        </>
      );
    case 'tormenta':
      return (
        <>
          <path d={NUBE} transform="translate(0 -3)" />
          <path d="M12.5 16l-2 3.5h3l-2 3.5" />
        </>
      );
  }
}

function Sol() {
  return (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  );
}

function Luna() {
  return <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />;
}
