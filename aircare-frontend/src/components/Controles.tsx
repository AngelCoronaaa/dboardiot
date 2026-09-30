import type { Comandos, OnOff, TipoComando } from '../tipos';

interface Props {
  comandos: Comandos;
  habilitado: boolean;
  error: string | null;
  enviar: <T extends TipoComando>(tipo: T, valor: NonNullable<Comandos[T]>) => void;
}

export function Controles({ comandos, habilitado, error, enviar }: Props) {
  const manual = comandos.modo === 'manual';
  const alternar = (v?: OnOff): OnOff => (v === 'ON' ? 'OFF' : 'ON');

  return (
    <section className="tarjeta controles">
      <h2 className="titulo-tarjeta">Control manual</h2>

      <Switch
        etiqueta="Modo manual"
        activo={manual}
        deshabilitado={!habilitado}
        onClick={() => enviar('modo', manual ? 'auto' : 'manual')}
      />

      <div className={`actuadores ${manual ? '' : 'sin-efecto'}`}>
        <Switch
          etiqueta="Alarma"
          activo={comandos.alarma === 'ON'}
          deshabilitado={!habilitado}
          onClick={() => enviar('alarma', alternar(comandos.alarma))}
        />
        <Switch
          etiqueta="Ventilador"
          activo={comandos.ventilador === 'ON'}
          deshabilitado={!habilitado}
          onClick={() => enviar('ventilador', alternar(comandos.ventilador))}
        />
        {!manual && (
          <p className="secundario pequeno">
            En modo automático la placa decide; estos switches no tienen efecto.
          </p>
        )}
      </div>

      {!habilitado && <p className="secundario pequeno">Sin conexión con el servidor.</p>}
      {error && <p className="error pequeno" role="alert">{error}</p>}
    </section>
  );
}

function Switch(props: {
  etiqueta: string;
  activo: boolean;
  deshabilitado: boolean;
  onClick: () => void;
}) {
  return (
    <div className="fila-switch">
      <span>{props.etiqueta}</span>
      <button
        type="button"
        role="switch"
        aria-checked={props.activo}
        aria-label={props.etiqueta}
        className={`switch ${props.activo ? 'on' : ''}`}
        disabled={props.deshabilitado}
        onClick={props.onClick}
      >
        <span className="perilla" />
      </button>
    </div>
  );
}
