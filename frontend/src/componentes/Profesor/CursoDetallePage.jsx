import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { apiFetch } from "./api"

export default function CursoDetallePage() {
  const { id } = useParams()
  const [curso, setCurso] = useState(null)
  const [tareas, setTareas] = useState([])
  const [titulo, setTitulo] = useState("")
  const [fechaEntrega, setFechaEntrega] = useState("")
  const [alumnoId, setAlumnoId] = useState("")

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const [cursoData, tareasData] = await Promise.all([
          apiFetch(`/profesor/cursos/${id}/`),
          apiFetch(`/profesor/tareas/`),
        ])
        if (!alive) return
        setCurso(cursoData)
        const list = Array.isArray(tareasData)
          ? tareasData
          : Array.isArray(tareasData?.results)
          ? tareasData.results
          : []
        setTareas(list.filter((t) => String(t.curso) === String(id)))
      } catch (e) {
        if (alive) console.error(e)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [id])

  const crearTarea = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) return
    const payload = {
      curso: Number(id),
      titulo: titulo.trim(),
      publicado: true,
    }
    if (fechaEntrega) {
      try {
        payload.fecha_entrega = new Date(fechaEntrega).toISOString()
      } catch (e) {
        console.error(e)
        /* noop */
      }
    }
    const t = await apiFetch(`/profesor/tareas/`, { method: "POST", body: payload })
    setTareas((prev) => [t, ...prev])
    setTitulo("")
    setFechaEntrega("")
  }

  const matricular = async (e) => {
    e.preventDefault()
    if (!alumnoId) return
    await apiFetch(`/profesor/cursos/${id}/matricular/`, {
      method: "POST",
      body: { alumno: Number(alumnoId) },
    })
    setAlumnoId("")
    alert("Alumno matriculado")
  }

  if (!curso) return <div>Cargando...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{curso.nombre}</h1>
      <section className="space-y-3">
        <h2 className="font-semibold">Tareas</h2>
        <form onSubmit={crearTarea} className="grid gap-2 md:grid-cols-[2fr,1fr,auto]">
          <input
            className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full h-auto p-1.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            placeholder="Título de la tarea"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full h-auto p-1.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
            placeholder="Fecha de entrega"
          />
          <button className="px-4 py-2 rounded border">Crear</button>
        </form>
        <ul className="space-y-2">
          {tareas.map((t) => (
            <li key={t.id} className="border rounded p-2">
              <div className="font-semibold">{t.titulo}</div>
              {t.fecha_entrega && (
                <div className="text-xs opacity-70 mt-1">
                  Entrega: {new Date(t.fecha_entrega).toLocaleString()}
                </div>
              )}
            </li>
          ))}
          {tareas.length === 0 && (
            <li className="text-sm opacity-70">No hay tareas</li>
          )}
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Matricular alumno (por id)</h2>
        <form onSubmit={matricular} className="flex gap-2">
          <input
            className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 h-auto p-0.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            placeholder="id usuario"
            value={alumnoId}
            onChange={(e) => setAlumnoId(e.target.value)}
          />
          <button className="px-4 py-2 rounded border">Matricular</button>
        </form>
      </section>
    </div>
  )
}

