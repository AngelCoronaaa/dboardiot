import { useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import type { PreferenciaTema } from '../useTema';

const OPCIONES: { valor: PreferenciaTema; etiqueta: string; icono: ReactNode }[] = [
  {
    valor: 'sistema',
    etiqueta: 'Automático',
    icono: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
      </>
    ),
  },
  {
    valor: 'claro',
    etiqueta: 'Claro',
    icono: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1 1M17.4 17.4l1 1M5.6 18.4l1-1M17.4 6.6l1-1" />
      </>
    ),
  },
  {
    valor: 'oscuro',
    etiqueta: 'Oscuro',
    icono: <path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z" />,
  },
];

interface Props {
  tema: PreferenciaTema;
  cambiar: (tema: PreferenciaTema) => void;
}

export function SelectorTema({ tema, cambiar }: Props) {
  const indice = OPCIONES.findIndex((o) => o.valor === tema);
  // El ícono solo se anima tras una elección del usuario, no al cargar la página.
  const [tocado, setTocado] = useState(false);

  const elegir = (valor: PreferenciaTema, e: MouseEvent<HTMLButtonElement>) => {
    if (valor === tema) return;
    setTocado(true);
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || sinMovimiento) {
      cambiar(valor);
      return;
    }

    // El tema nuevo se revela en un círculo que crece desde el botón pulsado.
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transicion = document.startViewTransition(() => flushSync(() => cambiar(valor)));
    transicion.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
          {
            duration: 650,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch(() => {});
  };

  return (
    <div
      className={`selector-tema ${tocado ? 'tocado' : ''}`}
      role="group"
      aria-label="Tema"
      style={{ '--i': indice } as CSSProperties}
    >
      <span className="selector-pastilla" aria-hidden />
      {OPCIONES.map((o) => (
        <button
          key={o.valor}
          type="button"
          className={tema === o.valor ? 'activo' : ''}
          aria-pressed={tema === o.valor}
          aria-label={o.etiqueta}
          title={o.etiqueta}
          onClick={(e) => elegir(o.valor, e)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {o.icono}
          </svg>
        </button>
      ))}
    </div>
  );
}
