import { useEffect, useState } from "react";
import { getResumenAlumnos } from "./api";

export default function AsideAlumnos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const json = await getResumenAlumnos();
        if (alive) setData(Array.isArray(json) ? json : []);
      } catch (e) {
        if (alive) setErr(e.message || "Error al cargar");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <aside className="w-full md:w-80 lg:w-96 shrink-0 md:sticky md:top-4 md:h-[calc(100vh-2rem)]
                     md:overflow-auto md:ml-4 bg-gray-900/40 border border-gray-700 rounded-2xl p-4">
      <h3 className="text-base font-semibold mb-3">Alumnos y sus cursos</h3>

      {loading && <div className="text-sm opacity-80">Cargando…</div>}
      {err && !loading && <div className="text-sm text-red-400">⚠ {err}</div>}

      {!loading && !err && (
        <>
          {data.length === 0 ? (
            <div className="text-sm opacity-70">No hay alumnos.</div>
          ) : (
            <ul className="space-y-3">
              {data.map((a) => (
                <li key={a.id} className="rounded-lg border border-gray-700 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-70">#{a.id}</span>
                    <span className="font-medium">{a.username}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    {Array.isArray(a.cursos) && a.cursos.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {a.cursos.map((c) => (
                          <span key={`${a.id}-${c.id}`} className="text-xs border border-gray-600 px-2 py-0.5 rounded">
                            {c.nombre}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs opacity-60">Sin asignaturas</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </aside>
  );
}
