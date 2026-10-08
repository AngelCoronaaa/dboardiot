import { useCallback, useEffect, useState } from 'react';

export type PreferenciaTema = 'sistema' | 'claro' | 'oscuro';

// La misma clave la lee el script de index.html para evitar el parpadeo al cargar.
const CLAVE = 'aircare-tema';

function leer(): PreferenciaTema {
  try {
    const v = localStorage.getItem(CLAVE);
    if (v === 'claro' || v === 'oscuro') return v;
  } catch {
    // Sin acceso a localStorage: se usa el tema del sistema.
  }
  return 'sistema';
}

function aplicar(tema: PreferenciaTema) {
  const raiz = document.documentElement;
  if (tema === 'sistema') delete raiz.dataset.theme;
  else raiz.dataset.theme = tema === 'claro' ? 'light' : 'dark';

  try {
    if (tema === 'sistema') localStorage.removeItem(CLAVE);
    else localStorage.setItem(CLAVE, tema);
  } catch {
    // Sin acceso a localStorage: la preferencia dura solo esta sesión.
  }
}

export function useTema() {
  const [tema, setTema] = useState<PreferenciaTema>(leer);

  useEffect(() => aplicar(tema), [tema]);

  // Se aplica al DOM de inmediato (no en el efecto) para que la transición
  // de vista capture el tema nuevo en el mismo instante.
  const cambiar = useCallback((nuevo: PreferenciaTema) => {
    aplicar(nuevo);
    setTema(nuevo);
  }, []);

  return [tema, cambiar] as const;
}
