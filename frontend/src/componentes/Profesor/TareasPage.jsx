import { useEffect, useState } from "react";
import { apiFetch } from "./api";

export default function TareasPage() {
  const [tareas, setTareas] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Form crear
  const [openForm, setOpenForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [creating, setCreating] = useState(false);

  // Carga inicial: tareas + cursos
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [tData, cData] = await Promise.all([
          apiFetch("/profesor/tareas/"),
          apiFetch("/profesor/cursos/"),
        ]);
        const listT = Array.isArray(tData)
          ? tData
          : Array.isArray(tData?.results) ? tData.results : [];
        const listC = Array.isArray(cData)
          ? cData
          : Array.isArray(cData?.results) ? cData.results : [];
        if (alive) {
          setTareas(listT);
          setCursos(listC);
        }
      } catch (e) {
        if (alive) setErr(e?.message || "Error al cargar");
      }
    })();
    return () => { alive = false; };
  }, []);

  // Crear tarea (POST /api/profesor/tareas/)
  async function onCreate(e) {
    e?.preventDefault?.();
    if (!titulo.trim() || !cursoId) return;
    try {
      setCreating(true);
      setErr(null);
      const payload = {
        titulo: titulo.trim(),
        curso: Number(cursoId),
        publicado: true,
      };
      if (fechaEntrega) {
        try {
          payload.fecha_entrega = new Date(fechaEntrega).toISOString();
        } catch (e) {
          console.error(e)
          // si no se puede parsear dejamos el campo fuera
        }
      }
      const nueva = await apiFetch("/profesor/tareas/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      setTareas(prev => [nueva, ...prev]);
      setTitulo("");
      setCursoId("");
      setFechaEntrega("");
      setOpenForm(false);
    } catch (e) {
      setErr(e?.message || "No se pudo crear la tarea");
    } finally {
      setCreating(false);
    }
  }

  // Publicar / despublicar tarea
  async function togglePublicado(tarea) {
    try {
      setBusyId(tarea.id);
      setErr(null);
      const updated = await apiFetch(`/profesor/tareas/${tarea.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ publicado: !tarea.publicado }),
      });
      setTareas(prev => prev.map(t => t.id === tarea.id ? updated : t));
    } catch (e) {
      setErr(e?.message || "No se pudo actualizar publicación");
    } finally {
      setBusyId(null);
    }
  }

  // Borrar tarea (DELETE /api/profesor/tareas/:id/)
  async function onDelete(id) {
    if (!window.confirm("¿Seguro que quieres borrar esta tarea?")) return;
    try {
      setBusyId(id);
      setErr(null);
      await apiFetch(`/profesor/tareas/${id}/`, { method: "DELETE" });
      setTareas(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      setErr(e?.message || "No se pudo borrar la tarea");
    } finally {
      setBusyId(null);
    }
  }
  return (
    <div>
      <h1 className="text-xl font-bold mb-3">Tareas (todas mis clases)</h1>

      {err && <div className="text-sm text-red-400 mb-2">{err}</div>}

      {/* Botón para abrir/cerrar form */}
      <div className="mb-3">
        <button
          onClick={() => setOpenForm(v => !v)}
          className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-600/10"
        >
          {openForm ? "Cancelar" : "Nueva tarea"}
        </button>
      </div>

      {/* Formulario creación */}
      {openForm && (
        <form onSubmit={onCreate} className="border rounded p-2 mb-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Título</label>
                <input
                  value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
                placeholder="Ej. Tarea 1"
                required
              />
              </div>
              <div>
                <label className="block text-sm mb-1">Curso</label>
                <select
                  value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
                required
              >
                <option value="">Selecciona un curso</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre || c.titulo || `Curso #${c.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Fecha de entrega</label>
              <input
                type="datetime-local"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={creating || !titulo.trim() || !cursoId}
              className="px-3 py-1 rounded border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
            >
              {creating ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      <ul className="space-y-2">
        {tareas.map((t) => (
          <li key={t.id} className="border rounded p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.titulo}</div>
                {t.fecha_entrega && (
                  <div className="text-xs opacity-70 mt-1">
                    Entrega: {new Date(t.fecha_entrega).toLocaleString()}
                  </div>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded border ${t.publicado ? 'border-emerald-500 text-emerald-400' : 'border-yellow-500 text-yellow-400'}`}>{t.publicado ? 'Publicado' : 'Borrador'}</span>
            </div>
            <div className="mt-2 flex gap-2 justify-end">
              <button
                onClick={() => togglePublicado(t)}
                disabled={busyId === t.id}
                className="px-3 py-1 rounded border border-blue-500 text-blue-400 hover:bg-blue-500/10 disabled:opacity-50"
                title={t.publicado ? "Despublicar" : "Publicar"}
              >
                {t.publicado ? "Despublicar" : "Publicar"}
              </button>
              <button
                onClick={() => onDelete(t.id)}
                disabled={busyId === t.id}
                className="px-3 py-1 rounded border border-red-500 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                title="Eliminar tarea"
              >
                {busyId === t.id ? "Borrando..." : "Eliminar"}
              </button>
            </div>
          </li>
        ))}
        {tareas.length === 0 && (
          <li className="text-sm opacity-70">No hay tareas</li>
        )}
      </ul>
    </div>
  );
}
