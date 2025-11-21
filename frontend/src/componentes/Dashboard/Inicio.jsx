import { useContext, useEffect, useMemo, useState } from "react"
import { UsuarioContext } from "../useContext/UsuarioContext"
import { Link } from "react-router-dom"
import { apiFetch, getTutorias } from "../Profesor/api"
import CalendarioTareas from "./CalendarioTareas"

const Inicio = () => {
  const { usuario } = useContext(UsuarioContext)

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  // Datos para alumno
  const [cursos, setCursos] = useState([])
  const [tareas, setTareas] = useState([])

  // Datos para profesor/admin
  const [misCursosImpartidos, setMisCursosImpartidos] = useState([])
  const [misTareas, setMisTareas] = useState([])
  const [tutoriasAgenda, setTutoriasAgenda] = useState([])

  useEffect(() => {
    let alive = true
    async function load() {
      setErr("")
      setLoading(true)
      try {
        if (usuario?.role === "S") {
          const cs = await apiFetch("/usuarios/mis-cursos/")
          if (!alive) return
          const listCursos = Array.isArray(cs) ? cs : []
          setCursos(listCursos)
          // cargar tareas publicadas de cada curso (limit simple)
          const tareasPorCurso = await Promise.all(
            listCursos.map((c) => apiFetch(`/alumno/cursos/${c.id}/tareas/`).catch(() => []))
          )
          if (!alive) return
          const all = tareasPorCurso.flat().filter(Boolean)
          setTareas(all)
        } else if (usuario?.role === "T" || usuario?.role === "A") {
          const [cs, ts] = await Promise.all([
            apiFetch("/profesor/cursos/").catch(() => []),
            apiFetch("/profesor/tareas/").catch(() => []),
          ])
          if (!alive) return
          const listCursos = Array.isArray(cs)
            ? cs
            : Array.isArray(cs?.results)
            ? cs.results
            : []
          const listTareas = Array.isArray(ts)
            ? ts
            : Array.isArray(ts?.results)
            ? ts.results
            : []
          setMisCursosImpartidos(listCursos)
          setMisTareas(listTareas)
        }
        const tutorias = await getTutorias().catch(() => [])
        if (!alive) return
        setTutoriasAgenda(Array.isArray(tutorias) ? tutorias : [])
      } catch (e) {
        if (alive) setErr("No se pudo cargar el resumen")
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [usuario?.role])

  const bienvenida = useMemo(() => {
    const nombre = `${usuario.first_name || ""} ${usuario.last_name || ""}`.trim() || usuario.username
    if (usuario.gender === "F") return `Bienvenida ${nombre}`
    return `Bienvenido ${nombre}`
  }, [usuario])

  // Proximas 5 tareas (alumno)
  const proximasTareas = useMemo(() => {
    const withDate = tareas.map((t) => ({
      ...t,
      _date: t.fecha_entrega ? new Date(t.fecha_entrega) : null,
    }))
    withDate.sort((a, b) => {
      const ad = a._date ? a._date.getTime() : Infinity
      const bd = b._date ? b._date.getTime() : Infinity
      return ad - bd
    })
    return withDate.slice(0, 5)
  }, [tareas])

  return (
    <section className="w-full">
      <div className="text-white text-2xl mb-4">{bienvenida}</div>

      {err && <div className="text-sm text-red-400 mb-3">{err}</div>}

      {loading && <div className="text-gray-300">Cargando...</div>}

      {/* Resumen para Alumno */}
      {usuario?.role === "S" && !loading && (
        <div className="grid gap-4 md:grid-cols-3 items-start">
          <div className="p-4 rounded-lg bg-gray-800 text-white">
            <div className="text-sm opacity-70">Asignaturas inscritas</div>
            <div className="text-3xl font-bold">{cursos.length}</div>
            <Link to="/asignaturas" className="text-blue-400 hover:underline mt-2 inline-block">
              Ver asignaturas
            </Link>
          </div>
          <div className="p-4 rounded-lg bg-gray-800 text-white md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-70">Proximas tareas</div>
              <Link to="/asignaturas" className="text-blue-400 hover:underline">
                Ver todas
              </Link>
            </div>
            {proximasTareas.length === 0 ? (
              <div className="text-sm opacity-70">No hay tareas cercanas</div>
            ) : (
              <ul className="space-y-2">
                {proximasTareas.map((t) => {
                  const c = cursos.find((x) => String(x.id) === String(t.curso))
                  return (
                    <li key={t.id} className="bg-gray-900 rounded p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{t.titulo}</span>
                        <span className="text-xs opacity-80">
                          {t.fecha_entrega ? new Date(t.fecha_entrega).toLocaleString() : "Sin fecha"}
                        </span>
                      </div>
                      {c && <div className="text-xs opacity-70 mt-1">Asignatura: {c.nombre}</div>}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Resumen para Profesor/Admin */}
      {(usuario?.role === "T" || usuario?.role === "A") && !loading && (
        <div className="grid gap-4 md:grid-cols-3 items-start">
          <div className="p-4 rounded-lg bg-gray-800 text-white">
            <div className="text-sm opacity-70">Cursos impartidos</div>
            <div className="text-3xl font-bold">{misCursosImpartidos.length}</div>
            <Link to="/profesor" className="text-blue-400 hover:underline mt-2 inline-block">
              Ir al panel
            </Link>
          </div>
          <div className="p-4 rounded-lg bg-gray-800 text-white">
            <div className="text-sm opacity-70">Tareas creadas</div>
            <div className="text-3xl font-bold">{misTareas.length}</div>
            <Link to="/profesor/tareas" className="text-blue-400 hover:underline mt-2 inline-block">
              Gestionar tareas
            </Link>
          </div>
          <div className="p-4 rounded-lg bg-gray-800 text-white">
            <div className="text-sm opacity-70">Accesos rapidos</div>
            <ul className="text-sm mt-1 space-y-1">
              <li>
                <Link to="/perfil" className="text-blue-400 hover:underline">
                  Mi perfil
                </Link>
              </li>
              <li>
                <Link to="/asignaturas" className="text-blue-400 hover:underline">
                  Mis asignaturas
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
      {!loading && (
        <div className="mt-6">
          <CalendarioTareas
            tareas={usuario?.role === "S" ? tareas : misTareas}
            cursos={usuario?.role === "S" ? cursos : misCursosImpartidos}
            tutorias={tutoriasAgenda}
          />
        </div>
      )}
    </section>
  )
}

export default Inicio
