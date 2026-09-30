import { CalidadGeneral } from './components/CalidadGeneral';
import { Controles } from './components/Controles';
import { Encabezado } from './components/Encabezado';
import { Historial } from './components/Historial';
import { Medidas } from './components/Medidas';
import { UltimaAlerta } from './components/UltimaAlerta';
import { calidadDe } from './tipos';
import { useAirCare } from './useAirCare';

export function App() {
  const s = useAirCare();

  return (
    <div className="pagina">
      <Encabezado conexion={s.conexion} broker={s.broker} placa={s.placa} />

      <main className="rejilla">
        <div className="area-calidad">
          <CalidadGeneral calidad={calidadDe(s.datos)} ultimaLectura={s.ultimaLectura} />
        </div>
        <div className="area-alerta">
          <UltimaAlerta alerta={s.alerta} />
        </div>
        <div className="area-medidas">
          <Medidas datos={s.datos} />
        </div>
        <div className="area-historial">
          <Historial puntos={s.historial} />
        </div>
        <div className="area-controles">
          <Controles
            comandos={s.comandos}
            habilitado={s.conexion === 'conectado'}
            error={s.errorComando}
            enviar={s.enviar}
          />
        </div>
      </main>
    </div>
  );
}
