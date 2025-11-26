import { useEffect, useState } from "react";
import { apiFetch, getAsistencias, saveAsistencia } from "./api";

export default function AsistenciaAlumnoModal({ alumno, onClose }) {
  const [cursoId, setCursoId] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [presente, setPresente] = useState(true);
  const [justificada, setJustificada] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cursosProfesor, setCursosProfesor] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cs = await apiFetch("/profesor/cursos/").catch(() => []);
        if (!alive) return;
        const list =
          Array.isArray(cs) && !Array.isArray(cs.results)
            ? cs
            : Array.isArray(cs?.results)
            ? cs.results
            : [];
        setCursosProfesor(list);
      } catch {
        if (alive) setCursosProfesor([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!alumno) return;
    if (!cursoId) {
      setAsistencias([]);
      return;
    }
    let alive = true;
    setLoading(true);
    setError("");
    getAsistencias({ estudiante: alumno.id, curso: cursoId })
      .then((data) => {
        if (!alive) return;
        setAsistencias(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || "No se pudo cargar la asistencia");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [alumno, cursoId]);

  if (!alumno) return null;

  const cursosAlumno = Array.isArray(alumno.cursos) ? alumno.cursos : [];
  const cursosProfesorIds = new Set(
    (cursosProfesor || []).map((c) => String(c.id))
  );
  const cursos = cursosAlumno.filter((c) =>
    cursosProfesorIds.has(String(c.id))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cursoId || !fecha) return;
    setError("");
    try {
      const payload = {
        estudiante: alumno.id,
        curso: Number(cursoId),
        fecha,
        presente,
        justificada,
        observaciones: observaciones.trim(),
      };
      const nueva = await saveAsistencia(payload);
      setAsistencias((prev) => [nueva, ...prev]);
      setObservaciones("");
    } catch (e2) {
      setError(e2?.message || "No se pudo guardar la asistencia");
    }
  };

  const marcarPresenteAusente = async (registro, nuevoEstado) => {
    setError("");
    try {
      const actualizado = await saveAsistencia(
        { presente: nuevoEstado, justificada: registro.justificada },
        registro.id
      );
      setAsistencias((prev) =>
        prev.map((a) => (a.id === actualizado.id ? actualizado : a))
      );
    } catch (e) {
      setError(e?.message || "No se pudo actualizar la asistencia");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-4 w-full max-w-lg border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">
            Asistencia de {alumno.username}
          </h2>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded border border-gray-500 text-gray-300 hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Curso
            </label>
            <select
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm text-white"
            >
              <option value="">Selecciona un curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm text-white"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 mt-4">
              <label className="text-xs text-gray-300 flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={presente}
                  onChange={(e) => setPresente(e.target.checked)}
                  className="rounded border-gray-500"
                />
                Presente
              </label>
              <label className="text-xs text-gray-300 flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={justificada}
                  onChange={(e) => setJustificada(e.target.checked)}
                  className="rounded border-gray-500"
                />
                Justificada
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Observaciones
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm text-white"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!cursoId || !fecha}
              className="px-3 py-1 rounded border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 text-sm"
            >
              Guardar asistencia
            </button>
          </div>
        </form>

        {error && (
          <div className="text-xs text-red-400 mb-2">{error}</div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-200 mb-1">
            Registros recientes
          </h3>
          {loading ? (
            <div className="text-xs text-gray-400">Cargando asistencia…</div>
          ) : asistencias.length === 0 ? (
            <div className="text-xs text-gray-400">
              No hay registros para este curso.
            </div>
          ) : (
            <ul className="max-h-40 overflow-auto space-y-1 text-xs">
              {asistencias.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between border border-gray-700 rounded px-2 py-1"
                >
                  <div>
                    <div className="text-gray-200">
                      {new Date(a.fecha).toLocaleDateString("es-ES")}
                    </div>
                    <div className="text-gray-400">
                      {a.presente ? "Presente" : "Ausente"}
                      {a.justificada ? " (Justificada)" : ""}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="px-2 py-0.5 rounded border border-emerald-500 text-emerald-300 text-[11px]"
                      onClick={() => marcarPresenteAusente(a, true)}
                    >
                      Presente
                    </button>
                    <button
                      type="button"
                      className="px-2 py-0.5 rounded border border-red-500 text-red-300 text-[11px]"
                      onClick={() => marcarPresenteAusente(a, false)}
                    >
                      Ausente
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
