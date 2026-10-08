import { useEffect, useState } from 'react';

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

export function useTema() {
  const [tema, setTema] = useState<PreferenciaTema>(leer);

  useEffect(() => {
    const raiz = document.documentElement;
    if (tema === 'sistema') delete raiz.dataset.theme;
    else raiz.dataset.theme = tema === 'claro' ? 'light' : 'dark';

    try {
      if (tema === 'sistema') localStorage.removeItem(CLAVE);
      else localStorage.setItem(CLAVE, tema);
    } catch {
      // Sin acceso a localStorage: la preferencia dura solo esta sesión.
    }
  }, [tema]);

  return [tema, setTema] as const;
}
