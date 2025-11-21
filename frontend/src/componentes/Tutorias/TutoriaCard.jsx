const estadoConfig = {
  completada: { label: "Completada", className: "text-emerald-300" },
  confirmada: { label: "Confirmada", className: "text-blue-300" },
  pendiente: { label: "Pendiente", className: "text-yellow-300" },
  cancelada: { label: "Cancelada", className: "text-red-300" },
};

const formatEstado = (estado = "") => {
  const key = estado.toLowerCase();
  return estadoConfig[key] || { label: estado || "Desconocido", className: "text-gray-300" };
};

const formatFecha = (fecha) => {
  if (!fecha) return "Sin fecha";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

export default function TutoriaCard({ tutoria }) {
  const { label, className } = formatEstado(tutoria.estado || tutoria.estado_display || "");
  const alumno = tutoria.alumno_nombre || tutoria.alumno_username || "Alumno";
  const profesor = tutoria.profesor_nombre || tutoria.profesor_username || "Profesor";

  return (
    <article className="bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-lg flex flex-col gap-2">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{tutoria.asignatura}</h2>
        <span className={`text-sm font-bold ${className}`}>{label}</span>
      </header>
      <p className="text-sm text-gray-300">Profesor: {profesor}</p>
      <p className="text-sm text-gray-300">Alumno: {alumno}</p>
      <p className="text-sm text-gray-400">{formatFecha(tutoria.fecha)}</p>
      {tutoria.notas && <p className="text-xs text-gray-400 border-t border-gray-700 pt-2">{tutoria.notas}</p>}
    </article>
  );
}
