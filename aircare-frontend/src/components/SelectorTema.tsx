import type { ReactNode } from 'react';
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
  return (
    <div className="selector-tema" role="group" aria-label="Tema">
      {OPCIONES.map((o) => (
        <button
          key={o.valor}
          type="button"
          className={tema === o.valor ? 'activo' : ''}
          aria-pressed={tema === o.valor}
          aria-label={o.etiqueta}
          title={o.etiqueta}
          onClick={() => cambiar(o.valor)}
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
