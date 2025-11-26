import { useContext, useEffect, useMemo, useState } from "react";
import { UsuarioContext } from "../useContext/UsuarioContext";
import { Link } from "react-router-dom";
import { apiFetch, getTutorias } from "../Profesor/api";
import CalendarioTareas from "./CalendarioTareas";
import { MiniComponenteLoading } from "../PantallaLoading/ComponenteLoading";
import ComponentesInicio from "./InicioUtilies.jsx/ComponentesInicio";

const Inicio = () => {
  const { usuario } = useContext(UsuarioContext);

  const [loading] = useState(false);
  const [err, setErr] = useState("");
  const [requestFinalizada, setRequestFinalizada] = useState(false);

  // Datos para alumno
  const [cursos, setCursos] = useState([]);
  const [tareas, setTareas] = useState([]);
  
  // Datos para profesor/admin
  const [misCursosImpartidos, setMisCursosImpartidos] = useState([]);
  const [misTareas, setMisTareas] = useState([]);
  
  // Agenda común (tutorías + exámenes)
  const [tutoriasAgenda, setTutoriasAgenda] = useState([]);
  const [examenes, setExamenes] = useState([]);
  
  useEffect(() => {
    let alive = true;
    async function load() {
      setErr("");
      try {
        if (usuario?.role === "S") {
          const cs = await apiFetch("/usuarios/mis-cursos/");
          if (!alive) return;
          const listCursos = Array.isArray(cs) ? cs : [];
          setCursos(listCursos);
          
          // cargar tareas publicadas de cada curso
          const tareasPorCurso = await Promise.all(
            listCursos.map((c) =>
              apiFetch(`/alumno/cursos/${c.id}/tareas/`).catch(() => [])
          )
        );
        if (!alive) return;
        const all = tareasPorCurso.flat().filter(Boolean);
        setTareas(all);
        
        // Cargar eventos de exámenes para el calendario
        const eventos = await apiFetch("/calificaciones/examenes/").catch(
          () => []
        );
        if (!alive) return;
        setExamenes(Array.isArray(eventos) ? eventos : []);
      } else if (usuario?.role === "T" || usuario?.role === "A") {
        const [cs, ts, ev] = await Promise.all([
            apiFetch("/profesor/cursos/").catch(() => []),
            apiFetch("/profesor/tareas/").catch(() => []),
            apiFetch("/calificaciones/examenes/").catch(() => []),
          ]);
          if (!alive) return;
          const listCursos = Array.isArray(cs)
          ? cs
          : Array.isArray(cs?.results)
          ? cs.results
          : [];
          const listTareas = Array.isArray(ts)
          ? ts
          : Array.isArray(ts?.results)
          ? ts.results
          : [];
          setMisCursosImpartidos(listCursos);
          setMisTareas(listTareas);
          setExamenes(Array.isArray(ev) ? ev : []);
        }
        
        const tutorias = await getTutorias().catch(() => []);
        if (!alive) return;
        setTutoriasAgenda(Array.isArray(tutorias) ? tutorias : []);
      } catch {
        if (alive) {
          setErr("No se pudo cargar el resumen");
          setRequestFinalizada(true);
        }
      }finally{
        setTimeout(() => setRequestFinalizada(true), 20);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [usuario?.role, requestFinalizada]);
  
  const bienvenida = useMemo(() => {
    const nombre =
    `${usuario.first_name || ""} ${usuario.last_name || ""}`.trim() ||
    usuario.username;
    if (usuario.gender === "F") return `Bienvenida ${nombre}`;
    return `Bienvenido ${nombre}`;
  }, [usuario]);
    

  if(err !== "") return console.log(err)
  
  if(!requestFinalizada)return <><MiniComponenteLoading /></> 

  return (
    <section className="w-full">
      {/* Bienvenida */}
      <div className="text-white text-2xl mb-4">{bienvenida}</div>

      {/* Resumen para Alumno */}
      <ComponentesInicio
        tareas={tareas}
        usuario={usuario}
        loading={loading}
        cursos={cursos}
        />

      {/* Resumen para Profesor/Admin */}
      {(usuario?.role === "T" || usuario?.role === "A") && (
        <div className="grid gap-4 md:grid-cols-3 items-start">
          <div className="p-4 rounded-lg bg-gray-800 text-white">
            <div className="text-sm opacity-70">Cursos impartidos</div>
            <div className="text-3xl font-bold">{misCursosImpartidos.length}</div>
            <Link
              to="/profesor"
              className="text-blue-400 hover:underline mt-2 inline-block"
            >
              Ir al panel
            </Link>
          </div>
          <div className="p-4 rounded-lg bg-gray-800 text-white">
            <div className="text-sm opacity-70">Tareas creadas</div>
            <div className="text-3xl font-bold">{misTareas.length}</div>
            <Link
              to="/profesor/tareas"
              className="text-blue-400 hover:underline mt-2 inline-block"
            >
              Gestionar tareas
            </Link>
          </div>
          <div className="p-4 rounded-lg bg-gray-800 text-white">
            <div className="text-sm opacity-70">Accesos rápidos</div>
            <ul className="text-sm mt-1 space-y-1">
              <li>
                <Link to="/perfil" className="text-blue-400 hover:underline">
                  Mi perfil
                </Link>
              </li>
              <li>
                <Link to="/profesor" className="text-blue-400 hover:underline">
                  Mis asignaturas
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Calendario de tareas */}
      {!loading && (
        <div className="mt-6">
          <CalendarioTareas
            tareas={usuario?.role === "S" ? tareas : misTareas}
            cursos={usuario?.role === "S" ? cursos : misCursosImpartidos}
            tutorias={tutoriasAgenda}
            examenes={examenes}
            usuario={usuario}
          />
        </div>
      )}
    </section>
  );
};

export default Inicio;
