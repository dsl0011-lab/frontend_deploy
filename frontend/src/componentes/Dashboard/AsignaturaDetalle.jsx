import { useEffect, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { apiFetch } from '../Profesor/api'
import { ComponenteLoading } from '../PantallaLoading/ComponenteLoading'

export default function AsignaturaDetalle() {
  const { id } = useParams()
  const { state } = useLocation()
  const curso = state?.curso

  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    let cancelled = false
    const load = async () => {
      try {
        setError("")
        const data = await apiFetch(`/alumno/cursos/${id}/tareas/`)
        if (!cancelled) setTareas(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) setError("No se pudieron cargar las tareas")
        console.error(e)
      } 
    }
    load()
    setLoading(false)
    return () => { cancelled = true }
  }, [id])

  const titulo = curso?.nombre ? `Asignatura: ${curso.nombre}` : `Asignatura #${id}`

  return (
    <section className="text-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sl font-semibold text-gray-800 dark:text-gray-200">{titulo}</h2>
        <Link to="/asignaturas" className="text-blue-600 dark:text-blue-400 hover:underline">Volver</Link>
      </div>

      {curso?.profesor && (
        <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
          Profesor: {curso.profesor.full_name?.trim() || `${curso.profesor.first_name || ''} ${curso.profesor.last_name || ''}`.trim() || curso.profesor.username}
        </p>
      )}

      {loading && <div className="text-gray-700 dark:text-gray-300">{<ComponenteLoading />}</div>}
      {error && <div className="text-red-600 dark:text-red-400">{error}</div>}

      {!loading && !error && (
        tareas.length === 0 ? (
          <div className="text-gray-700 dark:text-gray-300">Sin tareas publicadas</div>
        ) : (
          <ul className="space-y-3">
            {tareas.map(t => (
              <li key={t.id} className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t.titulo}</h3>
                  {t.fecha_entrega && (
                    <span className="text-xs text-gray-700 dark:text-gray-400">Entrega: {new Date(t.fecha_entrega).toLocaleString()}</span>
                  )}
                </div>
                {t.descripcion && (
                  <p className="mt-1 text-sm text-gray-800 dark:text-gray-300">{t.descripcion}</p>
                )}
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}

