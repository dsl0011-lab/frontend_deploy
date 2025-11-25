import { useContext, useEffect, useMemo, useState } from "react";
import { UsuarioContext } from "../useContext/UsuarioContext";
import { apiFetch, createTutoria, getTutorias } from "../Profesor/api";
import NuevaTutoriaModal from "./ComponentesEsqueletoTutorias/Utilities/NuevaTutoriaModal";
import Aside from "./ComponentesEsqueletoTutorias/Aside";
import SectionsTutorias from "./ComponentesEsqueletoTutorias/SectionsTutorias";
import Header from "./ComponentesEsqueletoTutorias/Header";
import { createTutoriaEstudiante } from "./scriptsTutorias";

export default function TutoriasEsqueleto() {
  const { usuario } = useContext(UsuarioContext);
  const [tutorias, setTutorias] = useState([]);
  const [ refrescarTutorias, setRefrescarTutorias ] = useState(false)
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const puedeCrear =  usuario?.role === "S";

  useEffect(() => {
    let alive = true;
    (async () => {
      setError("");
      try {
        const data = await getTutorias();
        if (!alive) return;

        //se ordenan las tutorias por estado
        const ordenEstados = {
          pendiente: 1,
          confirmada: 2,
          completada: 3,
          cancelada: 4
        };
        let listaOrdenada = data.sort((a, b) => {
          return ordenEstados[a.estado] - ordenEstados[b.estado]
        })
        
        setTutorias(Array.isArray(listaOrdenada) ? listaOrdenada : []);
      } catch (err) {
        if (alive) setError(err.message || "No se pudieron cargar las tutorias");
      }
    })();
    setRefrescarTutorias(false)
    return () => {
      alive = false;
    };
  }, [refrescarTutorias]);

  useEffect(() => {
    if (!puedeCrear)return;
    let alive = true;
    (async () => {
      try {
        let data = [];
        usuario?.role === "T" && (data = await apiFetch("/profesor/cursos/").catch(() => []));
        usuario?.role === "S" && (data = await apiFetch("/estudiante/cursos/").catch(() => []));
        if (!alive) return;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];
        setCursosDisponibles(list);
      } catch {
        if (alive) setCursosDisponibles([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [puedeCrear, usuario ]);



  const stats = useMemo(() => {
    const base = {
      total: tutorias.length,
      pendiente: 0,
      confirmada: 0,
      completada: 0,
      cancelada: 0,
    };
    tutorias.forEach((t) => {
      const key = (t.estado || "").toLowerCase();
      if (base[key] !== undefined) {
        base[key] += 1;
      }
    });
    return base;
  }, [tutorias]);

  const proximasTutorias = useMemo(() => {
    const copy = tutorias
      .map((t) => ({ ...t, _date: t.fecha ? new Date(t.fecha) : null }))
      .filter((t) => t._date && !Number.isNaN(t._date.getTime()));
    copy.sort((a, b) => a._date - b._date);
    return copy.slice(0, 5);
  }, [tutorias]);


  const handleNuevaTutoria = async (payload) => {
    if(usuario?. role === "T") {
      try {
        setError("");
        const body = {
          asignatura: payload.asignatura,
          fecha: payload.fecha,
          estado: payload.estado,
          notas: payload.notas,
        };
        if (payload.alumnoId) {
          body.alumno = payload.alumnoId;
        } else if (payload.alumnoUsername) {
          body.alumno_username_input = payload.alumnoUsername;
        }
        const nueva = await createTutoria(body);
        setTutorias((prev) => [nueva, ...prev]);
        setShowModal(false);
      } catch (err) {
        setError(err.message || "No se pudo crear la tutoria");
      }

    }else if(usuario?.role === "S"){
            try {
        setError("");
        const body = {
          asignatura: payload.asignatura,
          fecha: payload.fecha,
          estado: payload.estado,
          notas: payload.notas,
        };
        if (payload.profesor) {
          body.profesor = payload.profesor;
        }
        const nueva = await createTutoriaEstudiante(body);
        setTutorias((prev) => [nueva, ...prev]);
        setShowModal(false);
      } catch (err) {
        setError(err.message || "No se pudo crear la tutoria");
      }
    }
  };


  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 text-white">
      <Header puedeCrear={puedeCrear} setShowModal={setShowModal} usuario={usuario} />
      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">

        {/* aqui se muestra un cuadro con las estadisticas y las proximas tutorias */}
        <Aside stats={stats} proximasTutorias={proximasTutorias} />

        {/* aqui se muestra la logica de la tutorias que tiene el usaurio */}
        <SectionsTutorias tutorias={tutorias} setRefrescarTutorias={setRefrescarTutorias}/>
      </div>

      {showModal && (
        <NuevaTutoriaModal
          onSave={handleNuevaTutoria}
          onClose={() => setShowModal(false)}
          cursos={cursosDisponibles}
        />
      )}
    </div>
  );
}
