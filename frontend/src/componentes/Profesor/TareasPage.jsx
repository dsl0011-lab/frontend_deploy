import { useEffect, useState } from "react";
import { apiFetch } from "./api";
export default function TareasPage() {
  // const token = localStorage.getItem("token");
  const [tareas, setTareas] = useState([]);
  useEffect(() => { apiFetch("/api/profesor/tareas/",/* { token }*/).then(setTareas); }, [/*token*/]);
  return (
    <div>
      <h1 className="text-xl font-bold mb-3">Tareas (todas mis clases)</h1>
      <ul className="space-y-2">
        {tareas.map(t => (<li key={t.id} className="border rounded p-2"><div className="font-semibold">{t.titulo}</div></li>))}
      </ul>
    </div>
  );
}

