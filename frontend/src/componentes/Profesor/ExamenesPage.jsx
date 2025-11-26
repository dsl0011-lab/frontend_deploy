import { useEffect, useState } from "react";
import { apiFetch } from "./api";

export default function ExamenesPage() {
  const [cursos, setCursos] = useState([]);

  // Eventos de examen (notificaciones para el calendario)
  const [eventos, setEventos] = useState([]);
  const [evCursoId, setEvCursoId] = useState("");
  const [evTitulo, setEvTitulo] = useState("");
  const [evFecha, setEvFecha] = useState("");
  const [evDescripcion, setEvDescripcion] = useState("");
  const [editEventoId, setEditEventoId] = useState(null);
  const [savingEvento, setSavingEvento] = useState(false);

  // Calificación de exámenes (nota para el alumno)
  const [alumnos, setAlumnos] = useState([]);
  const [gradeCursoId, setGradeCursoId] = useState("");
  const [gradeAlumnoId, setGradeAlumnoId] = useState("");
  const [gradeNombre, setGradeNombre] = useState("");
  const [gradeNota, setGradeNota] = useState("");
  const [gradeFecha, setGradeFecha] = useState("");
  const [gradePorcentaje, setGradePorcentaje] = useState("100");
  const [savingNota, setSavingNota] = useState(false);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // Cargar cursos y eventos
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cs, ev] = await Promise.all([
          apiFetch("/profesor/cursos/").catch(() => []),
          apiFetch("/calificaciones/examenes/").catch(() => []),
        ]);
        if (!alive) return;
        const listCursos = Array.isArray(cs)
          ? cs
          : Array.isArray(cs?.results)
          ? cs.results
          : [];
        setCursos(listCursos);
        setEventos(Array.isArray(ev) ? ev : []);
      } catch (e) {
        if (alive) setErr(e?.message || "No se pudieron cargar los datos");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  function toLocalDateTimeInput(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  }

  async function crearEvento(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!evCursoId || !evTitulo.trim()) {
      setErr("Curso y título son obligatorios para el evento.");
      return;
    }

    const payload = {
      curso: Number(evCursoId),
      titulo: evTitulo.trim(),
      descripcion: evDescripcion.trim(),
      fecha_examen: evFecha || new Date().toISOString(),
      visible_estudiantes: true,
    };

    try {
      setSavingEvento(true);
      let nuevo;
      if (editEventoId) {
        nuevo = await apiFetch(`/calificaciones/examenes/${editEventoId}/`, {
          method: "PATCH",
          body: payload,
        });
        setEventos((prev) =>
          prev.map((ev) => (ev.id === nuevo.id ? nuevo : ev))
        );
        setOk("Evento de examen actualizado correctamente");
      } else {
        nuevo = await apiFetch("/calificaciones/examenes/", {
          method: "POST",
          body: payload,
        });
        setEventos((prev) => [...prev, nuevo]);
        setOk("Evento de examen creado correctamente");
      }
      setEvCursoId("");
      setEvTitulo("");
      setEvDescripcion("");
      setEvFecha("");
      setEditEventoId(null);
    } catch (e2) {
      setErr(e2?.message || "No se pudo guardar el evento de examen");
    } finally {
      setSavingEvento(false);
    }
  }

  function startEditarEvento(ev) {
    setEvCursoId(String(ev.curso));
    setEvTitulo(ev.titulo || "");
    setEvDescripcion(ev.descripcion || "");
    setEvFecha(toLocalDateTimeInput(ev.fecha_examen));
    setEditEventoId(ev.id);
    setErr("");
    setOk("");
  }

  async function borrarEvento(id) {
    if (!id) return;
    setErr("");
    setOk("");
    try {
      await apiFetch(`/calificaciones/examenes/${id}/`, {
        method: "DELETE",
      });
      setEventos((prev) => prev.filter((ev) => ev.id !== id));
      if (editEventoId === id) {
        setEditEventoId(null);
        setEvCursoId("");
        setEvTitulo("");
        setEvDescripcion("");
        setEvFecha("");
      }
      setOk("Evento de examen eliminado");
    } catch (e) {
      setErr(e?.message || "No se pudo eliminar el evento de examen");
    }
  }

  async function onGradeCursoChange(value) {
    setGradeCursoId(value);
    setGradeAlumnoId("");
    setAlumnos([]);
    setErr("");
    if (!value) return;
    try {
      const data = await apiFetch(`/profesor/cursos/${value}/alumnos/`).catch(
        () => []
      );
      setAlumnos(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "No se pudieron cargar los alumnos");
    }
  }

  async function crearNota(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!gradeCursoId || !gradeAlumnoId || !gradeNombre.trim() || !gradeNota) {
      setErr("Curso, alumno, nombre y nota son obligatorios para la nota.");
      return;
    }

    const notaNum = Number(gradeNota);
    const porcentajeNum = Number(gradePorcentaje || "100");
    if (Number.isNaN(notaNum)) {
      setErr("La nota debe ser un número.");
      return;
    }

    try {
      setSavingNota(true);
      await apiFetch("/calificaciones/notas/", {
        method: "POST",
        body: {
          estudiante: Number(gradeAlumnoId),
          curso: Number(gradeCursoId),
          tipo_evaluacion: "EXAMEN",
          nombre_evaluacion: gradeNombre.trim(),
          descripcion: "",
          nota: notaNum,
          porcentaje: porcentajeNum || 100,
          fecha_evaluacion:
            gradeFecha || new Date().toISOString().slice(0, 10),
          visible_estudiante: true,
        },
      });
      setGradeNombre("");
      setGradeNota("");
      setGradeFecha("");
      setGradePorcentaje("100");
      setOk("Nota de examen guardada correctamente");
    } catch (e2) {
      setErr(e2?.message || "No se pudo crear la nota de examen");
    } finally {
      setSavingNota(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Exámenes</h1>
      {err && <div className="text-sm text-red-400">{err}</div>}
      {ok && <div className="text-sm text-emerald-400">{ok}</div>}

      {/* Apartado 1: Eventos de examen (notificación / calendario) */}
      <section className="border border-gray-700 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold">Eventos de examen</h2>
        <p className="text-xs text-gray-400">
          Estos eventos se muestran en el calendario de los alumnos
          matriculados en el curso.
        </p>

        <form
          onSubmit={crearEvento}
          className="grid gap-3 md:grid-cols-2 text-sm max-w-3xl"
        >
          <div>
            <label className="block mb-1">Curso</label>
            <select
              value={evCursoId}
              onChange={(e) => setEvCursoId(e.target.value)}
              className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
              required
            >
              <option value="">Selecciona un curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Título del examen</label>
            <input
              className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
              value={evTitulo}
              onChange={(e) => setEvTitulo(e.target.value)}
              placeholder="Ej. Examen Tema 1"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Fecha y hora</label>
            <input
              type="datetime-local"
              className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
              value={evFecha}
              onChange={(e) => setEvFecha(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Descripción</label>
            <textarea
              className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
              rows={2}
              value={evDescripcion}
              onChange={(e) => setEvDescripcion(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingEvento || !evCursoId || !evTitulo.trim()}
              className="px-3 py-1 rounded border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
            >
              {savingEvento
                ? "Guardando..."
                : editEventoId
                ? "Actualizar evento"
                : "Crear evento"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm">
          <h3 className="font-semibold mb-2">Próximos eventos</h3>
          {eventos.length === 0 ? (
            <p className="text-xs text-gray-400">
              No hay eventos de examen registrados.
            </p>
          ) : (
            <ul className="space-y-1 max-h-44 overflow-auto pr-1 text-xs">
              {eventos.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center justify-between border border-gray-700 rounded px-2 py-1 gap-2"
                >
                  <span>
                    <span className="font-medium">{ev.titulo}</span>{" "}
                    <span className="text-gray-400">
                      ({ev.curso_nombre}) –{" "}
                      {ev.fecha_examen
                        ? new Date(ev.fecha_examen).toLocaleString()
                        : "-"}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEditarEvento(ev)}
                      className="text-xs px-2 py-1 rounded border border-blue-500 text-blue-300 hover:bg-blue-500/10"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => borrarEvento(ev.id)}
                      className="text-xs px-2 py-1 rounded border border-red-500 text-red-300 hover:bg-red-500/10"
                    >
                      Borrar
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Apartado 2: Calificación de exámenes */}
      <section className="border border-gray-700 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold">Calificación de exámenes</h2>
        <p className="text-xs text-gray-400">
          Registra la nota de un examen para un alumno. Estas notas se ven en el
          panel de calificaciones del estudiante y en las estadísticas.
        </p>

        <form
          onSubmit={crearNota}
          className="grid gap-3 md:grid-cols-2 text-sm max-w-3xl"
        >
          <div>
            <label className="block mb-1">Curso</label>
            <select
              value={gradeCursoId}
              onChange={(e) => onGradeCursoChange(e.target.value)}
              className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
              required
            >
              <option value="">Selecciona un curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Alumno</label>
            <select
              value={gradeAlumnoId}
              onChange={(e) => setGradeAlumnoId(e.target.value)}
              className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
              required
              disabled={!gradeCursoId}
            >
              <option value="">Selecciona un alumno</option>
              {alumnos.map((a) => (
                <option key={a.id} value={a.id}>
                  {`${a.first_name || ""} ${a.last_name || ""}`.trim() ||
                    a.username}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Nombre del examen</label>
            <input
              className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
              value={gradeNombre}
              onChange={(e) => setGradeNombre(e.target.value)}
              placeholder="Ej. Examen Tema 1"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Nota (0 - 10)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
              value={gradeNota}
              onChange={(e) => setGradeNota(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Fecha del examen</label>
            <input
              type="date"
              className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
              value={gradeFecha}
              onChange={(e) => setGradeFecha(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">
              Porcentaje en nota final (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
              value={gradePorcentaje}
              onChange={(e) => setGradePorcentaje(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={
                savingNota ||
                !gradeCursoId ||
                !gradeAlumnoId ||
                !gradeNombre.trim() ||
                !gradeNota
              }
              className="px-3 py-1 rounded border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
            >
              {savingNota ? "Guardando..." : "Guardar nota de examen"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

