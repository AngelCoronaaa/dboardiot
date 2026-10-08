import type { ConexionBackend, EstadoPlaca } from '../tipos';
import type { PreferenciaTema } from '../useTema';
import { SelectorTema } from './SelectorTema';

const TEXTO_CONEXION: Record<ConexionBackend, string> = {
  conectando: 'Conectando...',
  conectado: 'Conectado',
  desconectado: 'Sin conexión al servidor',
  'no-autorizado': 'Token del dashboard inválido',
};

const TONO_CONEXION: Record<ConexionBackend, string> = {
  conectando: 'neutro',
  conectado: 'bueno',
  desconectado: 'malo',
  'no-autorizado': 'malo',
};

interface Props {
  conexion: ConexionBackend;
  broker: boolean | null;
  placa: EstadoPlaca;
  tema: PreferenciaTema;
  cambiarTema: (tema: PreferenciaTema) => void;
}

export function Encabezado({ conexion, broker, placa, tema, cambiarTema }: Props) {
  const textoPlaca =
    placa === 'online' ? 'Conectada' : placa === 'offline' ? 'Desconectada' : 'Sin información';
  const tonoPlaca = placa === 'online' ? 'bueno' : placa === 'offline' ? 'malo' : 'neutro';

  return (
    <header className="encabezado">
      <div>
        <h1>AirCare</h1>
        <p className="secundario">Equipo 5 · Monitoreo de calidad del aire</p>
      </div>
      <div className="indicadores">
        <Indicador etiqueta="Placa" texto={textoPlaca} tono={tonoPlaca} />
        <Indicador
          etiqueta="Servidor"
          texto={TEXTO_CONEXION[conexion]}
          tono={TONO_CONEXION[conexion]}
          nota={conexion === 'conectado' && broker === false ? 'broker MQTT sin conexión' : undefined}
        />
        <SelectorTema tema={tema} cambiar={cambiarTema} />
      </div>
    </header>
  );
}

function Indicador(props: { etiqueta: string; texto: string; tono: string; nota?: string }) {
  return (
    <div className={`indicador tono-${props.tono}`} role="status">
      <span className="punto" aria-hidden />
      <span className="secundario">{props.etiqueta}</span>
      <strong>{props.texto}</strong>
      {props.nota && <span className="nota">· {props.nota}</span>}
    </div>
  );
}
