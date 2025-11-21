import { useEffect, useState } from "react";
import { getAlumnosCurso } from "../Profesor/api";

const estados = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

const initialForm = {
  alumnoUsername: "",
  alumnoId: "",
  cursoId: "",
  asignaturaManual: "",
  fecha: "",
  notas: "",
  estado: "pendiente",
};

export default function NuevaTutoriaModal({ onSave, onClose, cursos = [] }) {
  const [form, setForm] = useState(initialForm);
  const [alumnos, setAlumnos] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [errorAlumnos, setErrorAlumnos] = useState("");

  useEffect(() => {
    if (!form.cursoId) {
      setAlumnos([]);
      setForm((prev) => ({ ...prev, alumnoId: "" }));
      return;
    }
    let alive = true;
    setLoadingAlumnos(true);
    setErrorAlumnos("");
    getAlumnosCurso(form.cursoId)
      .then((data) => {
        if (!alive) return;
        setAlumnos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!alive) return;
        setAlumnos([]);
        setErrorAlumnos(err.message || "No se pudieron cargar los alumnos");
      })
      .finally(() => alive && setLoadingAlumnos(false));

    return () => {
      alive = false;
    };
  }, [form.cursoId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "cursoId") {
      setForm((prev) => ({
        ...prev,
        cursoId: value,
        alumnoId: "",
        alumnoUsername: "",
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const asignaturaSeleccionada =
      cursos.find((c) => String(c.id) === form.cursoId)?.nombre || form.asignaturaManual.trim();
    const alumnoUsernameClean = form.alumnoUsername.trim();
    if ((!form.alumnoId && !alumnoUsernameClean) || !asignaturaSeleccionada || !form.fecha) {
      return;
    }

    const fechaIso = new Date(form.fecha).toISOString();
    onSave({
      alumnoId: form.alumnoId ? Number(form.alumnoId) : undefined,
      alumnoUsername: alumnoUsernameClean,
      asignatura: asignaturaSeleccionada,
      fecha: fechaIso,
      estado: form.estado,
      notas: form.notas.trim(),
    });

    setForm(initialForm);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Nueva tutoria</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {cursos.length > 0 ? (
            <>
              <select
                name="cursoId"
                className="w-full p-2 rounded bg-zinc-800 text-white"
                value={form.cursoId}
                onChange={handleChange}
              >
                <option value="">Selecciona una asignatura</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nombre}
                  </option>
                ))}
              </select>
              {form.cursoId && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-400">Alumnos inscritos</label>
                  <select
                    name="alumnoId"
                    className="w-full p-2 rounded bg-zinc-800 text-white"
                    value={form.alumnoId}
                    onChange={handleChange}
                    disabled={loadingAlumnos}
                  >
                    <option value="">Selecciona un alumno</option>
                    {alumnos.map((alumno) => (
                      <option key={alumno.id} value={alumno.id}>
                        {alumno.first_name || alumno.last_name
                          ? `${alumno.first_name} ${alumno.last_name}`.trim()
                          : alumno.username}
                      </option>
                    ))}
                  </select>
                  {errorAlumnos && <p className="text-xs text-red-400">{errorAlumnos}</p>}
                  {!loadingAlumnos && alumnos.length === 0 && (
                    <p className="text-xs text-gray-400">No hay alumnos inscritos en esta asignatura.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <input
              type="text"
              name="asignaturaManual"
              placeholder="Asignatura"
              className="w-full p-2 rounded bg-zinc-800 text-white"
              value={form.asignaturaManual}
              onChange={handleChange}
            />
          )}
          <input
            type="text"
            name="alumnoUsername"
            placeholder="Username del alumno (opcional)"
            className="w-full p-2 rounded bg-zinc-800 text-white"
            value={form.alumnoUsername}
            onChange={handleChange}
          />
          <input
            type="datetime-local"
            name="fecha"
            className="w-full p-2 rounded bg-zinc-800 text-white"
            value={form.fecha}
            onChange={handleChange}
          />
          <select
            name="estado"
            className="w-full p-2 rounded bg-zinc-800 text-white"
            value={form.estado}
            onChange={handleChange}
          >
            {estados.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
          <textarea
            name="notas"
            placeholder="Notas adicionales (opcional)"
            className="w-full p-2 rounded bg-zinc-800 text-white min-h-[90px]"
            value={form.notas}
            onChange={handleChange}
          />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="bg-gray-600 px-3 py-1 rounded">
              Cancelar
            </button>
            <button type="submit" className="bg-indigo-600 px-3 py-1 rounded">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
