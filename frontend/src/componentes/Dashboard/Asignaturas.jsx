import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../Profesor/api'
import { ComponenteLoading } from '../PantallaLoading/ComponenteLoading'

function Asignaturas() {
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError("")
        const data = await apiFetch('/usuarios/mis-cursos/')
        if (!cancelled) setCursos(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) setError("No se pudieron cargar las asignaturas")
        console.error(e)
      }
    }
    load()
    setLoading(false)
    return () => { cancelled = true }
  }, [])

  return (
    <section className="text-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-sl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Asignaturas
      </h2>

      {loading && (
        <div className="text-gray-700 dark:text-gray-300">{<ComponenteLoading />}</div>
      )}

      {error && (
        <div className="text-red-600 dark:text-red-400">{error}</div>
      )}

      {!loading && !error && (
        <>
          {cursos.length === 0 ? (
            <div className="text-gray-700 dark:text-gray-300">Sin asignaturas inscritas</div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cursos.map((c) => {
                const prof = c.profesor || {}
                const nombreProfesor = prof.full_name && prof.full_name.trim()
                  ? prof.full_name
                  : `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || prof.username || '—'
                return (
                  <li
                    key={c.id}
                    className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow flex flex-col gap-1"
                  >
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{c.nombre}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Profesor: {nombreProfesor}</span>
                    <Link
                      to={`/asignaturas/${c.id}`}
                      state={{ curso: c }}
                      className="mt-2 inline-block text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Ver tareas
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

export default Asignaturas
