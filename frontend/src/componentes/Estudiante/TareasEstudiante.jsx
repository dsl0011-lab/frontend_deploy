import { useEffect, useState } from "react";
import { apiFetch } from '../Profesor/api';
import { convertirFecha } from './scripts/conversionFecha'
import { MiniComponenteLoading } from "../PantallaLoading/ComponenteLoading";


const TareasEstudiante = () => {
  const [tareas, setTareas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [texto, setTexto] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [ requestFinalizada, setRequestFinalizada ] = useState(false)
    
    useEffect(() => {
      apiFetch("/estudiante/tareas/")
      .then((data) => setTareas(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error(e);
        setTareas([]);
        setRequestFinalizada(true)})
        .finally(()=>{
        setRequestFinalizada(true)
      })
      .finally(()=>{ setTimeout(() => setRequestFinalizada(true), 20)})
  }, []);


  if(!requestFinalizada) return <><MiniComponenteLoading /></>
  
  return (
    <div className="w-full h-full min-h-64 bg-gray-900 p-4 text-xs md:text-base rounded-2xl">
      <h3 className="font-bold text-center mb-3">
        Tareas (todas mis clases)
      </h3>
      {tareas.length > 0 ? (
        <ul className="flex flex-wrap gap-8 w-full h-fit">
          {tareas.map((t) => {
            const entrega =
              Array.isArray(t.entregas) && t.entregas.length > 0
                ? t.entregas[0]
                : null;
            return (
              <li
                key={t.id}
                className="flex-1 flex flex-col gap-2 border-double border-2 border-sky-950 p-4 rounded-3xl md:min-w-[500px] xs:min-w-[250px] min-w-[150px]"
              >
                <div className="flex-1 flex flex-col gap-2 font-semibold">
                  <p className="rounded-md border-double border-2 border-cyan-950 p-2">
                    Título: {t.titulo}
                  </p>
                  <p className="rounded-md border-double border-2 border-cyan-950 p-2">
                    Descripción: {t.descripcion}
                  </p>
                  <p className="rounded-md border-double border-2 border-cyan-950 p-2">
                    Fecha de entrega: {convertirFecha(t.fecha_entrega)}
                  </p>
                  <p className="rounded-md border-double border-2 border-cyan-950 p-2">
                    Asignatura: {t.curso}
                  </p>
                </div>
                <div className="flex-1 flex items-end justify-center">
                  {entrega ? (
                    <span className="text-[11px] md:text-xs text-emerald-300">
                      Entregado el {convertirFecha(entrega.enviada_en)}
                    </span>
                  ) : (
                    <button
                      className="p-2 hover:bg-slate-900 bg-sky-950 border-2 border-sky-500 rounded-2xl min-w-24 justify-self-center"
                      onClick={() => {
                        setSelected(t);
                        setTexto("");
                        setFile(null);
                        setErr("");
                      }}
                    >
                      Entregar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No tienes tareas asignadas aún</p>
      )}

      {/* Modal entrega */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2 text-white">
              Entregar tarea: {selected.titulo}
            </h3>
            <form
              className="space-y-3 text-sm text-white"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setSending(true);
                  setErr("");
                  const formData = new FormData();
                  formData.append("tarea", selected.id);
                  if (texto.trim()) formData.append("texto", texto.trim());
                  if (file) formData.append("archivo", file);

                  const nuevaEntrega = await apiFetch("/estudiante/entregas/", {
                    method: "POST",
                    body: formData,
                  });

                  setTareas((prev) =>
                    prev.map((t) =>
                      t.id === selected.id
                        ? { ...t, entregas: [nuevaEntrega] }
                        : t
                    )
                  );
                  setSelected(null);
                } catch (e2) {
                  setErr(e2?.message || "No se pudo enviar la entrega");
                } finally {
                  setSending(false);
                }
              }}
            >
              <div>
                <label className="block mb-1">Comentario</label>
                <textarea
                  className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
                  rows={3}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1">Archivo</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              {err && <p className="text-xs text-red-400">{err}</p>}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-3 py-1 rounded border border-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-3 py-1 rounded border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                >
                  {sending ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TareasEstudiante;

