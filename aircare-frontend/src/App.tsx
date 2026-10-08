import { esDeDiaLocal } from './clima';
import { CalidadGeneral } from './components/CalidadGeneral';
import { Cielo } from './components/Cielo';
import { ClimaExterior } from './components/ClimaExterior';
import { Controles } from './components/Controles';
import { Encabezado } from './components/Encabezado';
import { Historial } from './components/Historial';
import { Medidas } from './components/Medidas';
import { UltimaAlerta } from './components/UltimaAlerta';
import { calidadDe } from './tipos';
import { useAirCare } from './useAirCare';
import { useClima } from './useClima';
import { useTema } from './useTema';

function numero(valor: unknown): number | undefined {
  const n = typeof valor === 'string' ? Number(valor) : valor;
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
}

export function App() {
  const s = useAirCare();
  const clima = useClima();
  const [tema, setTema] = useTema();

  return (
    <>
      <Cielo
        condicion={clima.clima?.condicion ?? null}
        esDeDia={clima.clima?.esDeDia ?? esDeDiaLocal()}
      />

      <div className="pagina">
        <Encabezado
          conexion={s.conexion}
          broker={s.broker}
          placa={s.placa}
          tema={tema}
          cambiarTema={setTema}
        />

        <main className="rejilla">
          <div className="area-calidad">
            <CalidadGeneral calidad={calidadDe(s.datos)} ultimaLectura={s.ultimaLectura} />
          </div>
          <div className="area-clima">
            <ClimaExterior
              estado={clima.estado}
              clima={clima.clima}
              lugar={clima.lugar}
              interior={numero(s.datos?.temperatura)}
              reintentar={clima.reintentar}
            />
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
          <div className="area-alerta">
            <UltimaAlerta alerta={s.alerta} />
          </div>
        </main>
      </div>
    </>
  );
}
