import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "./api";
export default function CursoDetallePage() {
  const { id } = useParams();
  // const token = localStorage.getItem("token");
  const [curso, setCurso] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [alumnoId, setAlumnoId] = useState("");
  useEffect(() => {
    apiFetch(`/api/profesor/cursos/${id}/`, /*{ token }*/).then(setCurso);
    apiFetch(`/api/profesor/tareas/`, /*{ token }*/).then(ts => setTareas(ts.filter(t => String(t.curso) === String(id))));
  }, [id/*, token*/]);
  const crearTarea = async (e) => {
    e.preventDefault();
    const t = await apiFetch(`/api/profesor/tareas/`, { method:"POST", body:{ curso:Number(id), titulo }, /*token */});
    setTareas([t, ...tareas]); setTitulo("");
  };
  const matricular = async (e) => {
    e.preventDefault();
    if (!alumnoId) return;
    await apiFetch(`/api/profesor/cursos/${id}/matricular/`, { method:"POST", body:{ alumno:Number(alumnoId) },/* token*/ });
    setAlumnoId(""); alert("Alumno matriculado");
  };
  if (!curso) return <div>Cargando…</div>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{curso.nombre}</h1>
      <section className="space-y-3">
        <h2 className="font-semibold">Tareas</h2>
        <form onSubmit={crearTarea} className="flex gap-2">
          <input className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 h-auto p-0.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          placeholder="Título de la tarea" value={titulo} onChange={e=>setTitulo(e.target.value)} />
          <button className="px-4 py-2 rounded border">Crear</button>
        </form>
        <ul className="space-y-2">{tareas.map(t => (<li key={t.id} className="border rounded p-2">{t.titulo}</li>))}</ul>
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Matricular alumno (por id)</h2>
        <form onSubmit={matricular} className="flex gap-2">
          <input className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 h-auto p-0.5 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          placeholder="id usuario" value={alumnoId} onChange={e=>setAlumnoId(e.target.value)} />
          <button className="px-4 py-2 rounded border">Matricular</button>
        </form>
      </section>
    </div>
  );
}
