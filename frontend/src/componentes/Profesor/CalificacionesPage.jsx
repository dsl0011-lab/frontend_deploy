import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

export default function CalificacionesPage() {
  const [entregas, setEntregas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [calificacionesTarea, setCalificacionesTarea] = useState([]);
  const [notasTarea, setNotasTarea] = useState({});
  const [editandoTarea, setEditandoTarea] = useState({});

  const [examenes, setExamenes] = useState([]);
  const [notasExamen, setNotasExamen] = useState({});
  const [editandoExamen, setEditandoExamen] = useState({});

  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [ent, cs, calsTareas, notasEx] = await Promise.all([
          apiFetch("/profesor/entregas/"),
          apiFetch("/profesor/cursos/"),
          apiFetch("/profesor/calificaciones/").catch(() => []),
          apiFetch("/calificaciones/notas/").catch(() => []),
        ]);
        if (!alive) return;

        setEntregas(Array.isArray(ent) ? ent : []);

        const listC = Array.isArray(cs)
          ? cs
          : Array.isArray(cs?.results)
          ? cs.results
          : [];
        setCursos(listC);

        setCalificacionesTarea(Array.isArray(calsTareas) ? calsTareas : []);

        const soloExamenes = (Array.isArray(notasEx) ? notasEx : []).filter(
          (n) => n.tipo_evaluacion === "EXAMEN"
        );
        setExamenes(soloExamenes);
      } catch (e) {
        if (alive) setErr(e?.message || "Error al cargar calificaciones");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const cursosById = useMemo(
    () => Object.fromEntries(cursos.map((c) => [String(c.id), c])),
    [cursos]
  );

  const entregasPorCurso = useMemo(() => {
    const map = {};
    for (const e of entregas) {
      const cursoId = e.curso || e.tarea?.curso;
      const key = String(cursoId || "sin_curso");
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, [entregas]);

  const calificacionPorEntrega = useMemo(() => {
    const map = {};
    for (const c of calificacionesTarea) {
      map[String(c.entrega)] = c;
    }
    return map;
  }, [calificacionesTarea]);

  const empezarEditarTarea = (entregaId) => {
    const cal = calificacionPorEntrega[String(entregaId)];
    setEditandoTarea((prev) => ({ ...prev, [entregaId]: true }));
    setNotasTarea((prev) => ({
      ...prev,
      [entregaId]: cal ? String(cal.nota) : "",
    }));
  };

  const guardarNotaTarea = async (entregaId) => {
    const nota = Number(notasTarea[entregaId] || 0);
    if (Number.isNaN(nota)) return;
    try {
      const calExistente = calificacionPorEntrega[String(entregaId)];
      let res;
      if (calExistente) {
        res = await apiFetch(`/profesor/calificaciones/${calExistente.id}/`, {
          method: "PATCH",
          body: { nota },
        });
        setCalificacionesTarea((prev) =>
          prev.map((c) => (c.id === res.id ? res : c))
        );
      } else {
        res = await apiFetch("/profesor/calificaciones/", {
          method: "POST",
          body: { entrega: entregaId, nota },
        });
        setCalificacionesTarea((prev) => [...prev, res]);
      }
      setEditandoTarea((prev) => ({ ...prev, [entregaId]: false }));
      setNotasTarea((prev) => {
        const copy = { ...prev };
        delete copy[entregaId];
        return copy;
      });
    } catch (e) {
      setErr(e?.message || "No se pudo guardar la calificación de la tarea");
    }
  };

  const empezarEditarExamen = (examenId, notaActual) => {
    setEditandoExamen((prev) => ({ ...prev, [examenId]: true }));
    setNotasExamen((prev) => ({ ...prev, [examenId]: String(notaActual) }));
  };

  const guardarNotaExamen = async (examenId) => {
    const nota = Number(notasExamen[examenId] || 0);
    if (Number.isNaN(nota)) return;
    try {
      const res = await apiFetch(`/calificaciones/notas/${examenId}/`, {
        method: "PATCH",
        body: { nota },
      });
      setExamenes((prev) => prev.map((e) => (e.id === res.id ? res : e)));
      setEditandoExamen((prev) => ({ ...prev, [examenId]: false }));
    } catch (e) {
      setErr(e?.message || "No se pudo guardar la calificación del examen");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Calificaciones</h1>
      {err && <div className="text-sm text-red-400 mb-2">{err}</div>}

      {/* Bloque 1: calificaciones de tareas */}
      <section>
        <h2 className="text-lg font-semibold mb-2">
          Calificaciones de tareas entregadas
        </h2>

        {Object.keys(entregasPorCurso).length === 0 && (
          <div className="text-sm opacity-70">No hay entregas pendientes.</div>
        )}

        {Object.entries(entregasPorCurso).map(([cursoId, ents]) => {
          const curso = cursosById[cursoId];
          const nombreCurso =
            curso?.nombre || ents[0]?.curso_nombre || "Sin curso asociado";
          return (
            <section key={cursoId} className="mb-4">
              <h3 className="font-semibold mb-2">{nombreCurso}</h3>
              <ul className="space-y-2">
                {ents.map((e) => {
                  const cal = calificacionPorEntrega[String(e.id)];
                  const estaEditando = !!editandoTarea[e.id];
                  return (
                    <li key={e.id} className="border rounded p-3">
                      <div className="font-semibold mb-1">
                        Entrega #{e.id} —{" "}
                        {e.tarea_titulo || e.tarea?.titulo || "Tarea"}
                      </div>
                      {cal && !estaEditando ? (
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-sm text-gray-200">
                            Nota actual: {cal.nota}
                          </span>
                          <button
                            className="px-3 py-1 rounded border border-blue-500 text-blue-400 hover:bg-blue-500/10 text-xs"
                            onClick={() => empezarEditarTarea(e.id)}
                          >
                            Modificar
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 h-auto p-0.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            placeholder="Nota"
                            value={notasTarea[e.id] ?? ""}
                            onChange={(ev) =>
                              setNotasTarea({
                                ...notasTarea,
                                [e.id]: ev.target.value,
                              })
                            }
                          />
                          <button
                            className="px-3 py-1 rounded border border-blue-500 text-blue-400 hover:bg-blue-500/10"
                            onClick={() => guardarNotaTarea(e.id)}
                          >
                            Guardar
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </section>

      {/* Bloque 2: calificaciones de exámenes */}
      <section>
        <h2 className="text-lg font-semibold mb-2">
          Calificaciones de exámenes
        </h2>
        {examenes.length === 0 ? (
          <div className="text-sm opacity-70">
            No hay calificaciones de exámenes registradas.
          </div>
        ) : (
          <ul className="space-y-2">
            {examenes.map((ex) => {
              const estaEditando = !!editandoExamen[ex.id];
              return (
                <li key={ex.id} className="border rounded p-3">
                  <div className="font-semibold mb-1">
                    {ex.nombre_evaluacion} — {ex.curso_nombre} — Alumno:{" "}
                    {ex.estudiante_nombre}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    Tipo: {ex.tipo_evaluacion} · Fecha:{" "}
                    {ex.fecha_evaluacion
                      ? new Date(ex.fecha_evaluacion).toLocaleDateString(
                          "es-ES"
                        )
                      : "-"}
                  </div>
                  {estaEditando ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-40 h-auto p-0.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        placeholder="Nota"
                        value={notasExamen[ex.id] ?? ""}
                        onChange={(ev) =>
                          setNotasExamen({
                            ...notasExamen,
                            [ex.id]: ev.target.value,
                          })
                        }
                      />
                      <button
                        className="px-3 py-1 rounded border border-blue-500 text-blue-400 hover:bg-blue-500/10 text-xs"
                        onClick={() => guardarNotaExamen(ex.id)}
                      >
                        Guardar
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-sm text-gray-200">
                        Nota actual: {ex.nota}
                      </span>
                      <button
                        className="px-3 py-1 rounded border border-blue-500 text-blue-400 hover:bg-blue-500/10 text-xs"
                        onClick={() => empezarEditarExamen(ex.id, ex.nota)}
                      >
                        Modificar
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

