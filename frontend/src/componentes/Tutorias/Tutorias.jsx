import { useContext, useEffect, useMemo, useState } from "react";
import { UsuarioContext } from "../useContext/UsuarioContext";
import { apiFetch, createTutoria, getTutorias } from "../Profesor/api";
import TutoriaCard from "./TutoriaCard";
import NuevaTutoriaModal from "./NuevaTutoriaModal";

export default function Tutorias() {
  const { usuario } = useContext(UsuarioContext);
  const [tutorias, setTutorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [cursosDisponibles, setCursosDisponibles] = useState([]);

  const puedeCrear = usuario?.role === "T";

  useEffect(() => {
    let alive = true;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const data = await getTutorias();
        if (!alive) return;
        setTutorias(Array.isArray(data) ? data : []);
      } catch (err) {
        if (alive) setError(err.message || "No se pudieron cargar las tutorias");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!puedeCrear) return;
    let alive = true;
    (async () => {
      try {
        const data = await apiFetch("/profesor/cursos/").catch(() => []);
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
  }, [puedeCrear]);

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
  };

  if (loading) {
    return <p className="text-white text-xl">Cargando tutorias...</p>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 text-white">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">Tutorias</h1>
        {puedeCrear && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-semibold"
          >
            + Nueva tutoria
          </button>
        )}
      </header>

      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="bg-gray-900 border border-gray-700 rounded-2xl p-4 space-y-4">
          <section>
            <h2 className="text-lg font-semibold mb-2">Resumen rapido</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800 rounded-lg p-3">
                <dt className="text-gray-400">Totales</dt>
                <dd className="text-2xl font-bold">{stats.total}</dd>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <dt className="text-gray-400">Pendientes</dt>
                <dd className="text-2xl font-bold text-yellow-300">{stats.pendiente}</dd>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <dt className="text-gray-400">Confirmadas</dt>
                <dd className="text-2xl font-bold text-blue-300">{stats.confirmada}</dd>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <dt className="text-gray-400">Completadas</dt>
                <dd className="text-2xl font-bold text-emerald-300">{stats.completada}</dd>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 col-span-2">
                <dt className="text-gray-400">Canceladas</dt>
                <dd className="text-2xl font-bold text-red-300">{stats.cancelada}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-gray-200 mb-2">Proximas tutorias</h3>
            {proximasTutorias.length === 0 ? (
              <p className="text-xs text-gray-400">Sin tutorias agendadas</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {proximasTutorias.map((t) => (
                  <li key={t.id} className="bg-gray-800 rounded-lg p-2">
                    <div className="font-medium">{t.asignatura}</div>
                    <div className="text-xs text-gray-400">
                      {t._date.toLocaleDateString()} - {t._date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="text-xs text-gray-400">
                      Alumno: {t.alumno_nombre || t.alumno_username}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <section className="bg-gray-900/40 border border-gray-700 rounded-2xl p-4">
          {tutorias.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-600 p-6 text-center text-sm text-gray-300">
              Todavia no hay tutorias registradas.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tutorias.map((tutoria) => (
                <TutoriaCard key={tutoria.id} tutoria={tutoria} />
              ))}
            </div>
          )}
        </section>
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
