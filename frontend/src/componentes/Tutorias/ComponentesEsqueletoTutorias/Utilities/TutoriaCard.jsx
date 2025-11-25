import { useContext } from 'react';
import { acepta_rechaza_tutoria, eliminarTutoria } from '../../scriptsTutorias'
import { UsuarioContext } from '../../../useContext/UsuarioContext';

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


export default function TutoriaCard({ tutoria, setRefrescarTutorias }) {
  const { label, className } = formatEstado(tutoria.estado || tutoria.estado_display || "");
  const alumno = tutoria.alumno_nombre || tutoria.alumno_username || "Alumno";
  const profesor = tutoria.profesor_nombre || tutoria.profesor_username || "Profesor";
  const { usuario } = useContext(UsuarioContext)
  let solicitudTutoria = {
    id: "",
    estado: ""
  }


  // aqui se maneja el eliminar, aceptar o cancelar una tutoria pendiente
  const funtEstado = (estadoTutoria, idTutoria)=>{
    solicitudTutoria = {
      "id": idTutoria,
      "estado": estadoTutoria,
    }
    if(usuario?.role === "T"){
      solicitudTutoria = {
        "id": idTutoria,
        "estado": estadoTutoria,
        "alumno": tutoria?.alumno,
        "username": tutoria?.alumno_username
      }
    }
    acepta_rechaza_tutoria(solicitudTutoria, idTutoria, usuario?.role)
    setRefrescarTutorias(true)
  }


  // aqui se maneja el aceptar o cancelar una tutoria pendiente
  const funcEliminar = (idTutoria)=>{
    let datosEliminar = {"id": idTutoria}
    //solo el profesor necesita mandar el payload con id_alumno o username
    if(usuario?.role === "T"){
      datosEliminar = {
        "id": idTutoria,
        "alumno": tutoria?.alumno,
        "username": tutoria?.alumno_username
      }
    }
    eliminarTutoria(idTutoria, usuario?.role, datosEliminar)
    setRefrescarTutorias(true)
  }


  return (
    <article className="bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-lg flex flex-col gap-2">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{tutoria.asignatura}</h2>
        <span className={`text-sm font-bold ${className}`}>{label}</span>
        {/* <span className={`text-sm font-bold`}>{tutoria.estado}</span> */}
      </header>
      <p className="text-sm text-gray-300">Profesor: {profesor}</p>
      <p className="text-sm text-gray-300">Alumno: {alumno}</p>
      <p className="text-sm text-gray-400">{formatFecha(tutoria.fecha)}</p>
      {/* aceptar o cancelar una tutoria */}
      {tutoria.estado === "pendiente" && usuario?.role === "T"  &&
      <div className="w-full h-fit p-2 flex justify-evenly items-end">
        <button className="bg-green-800 w-fit min-w-24 h-fit p-1 rounded-xl" onClick={()=>funtEstado("confirmada", tutoria.id)}>Aceptar</button>
        <button className="bg-red-800 w-fit min-w-24 h-fit p-1 rounded-xl" onClick={()=>funtEstado("cancelada", tutoria.id)}>Cancelar</button>
      </div>}
      {/* cancelar tutorias previamente confirmadas */}
      {tutoria.estado === "confirmada" &&
      <div className="w-full h-fit p-2 flex items-end justify-end">
        <button className="bg-red-800 w-fit min-w-24 h-fit p-1 rounded-xl" onClick={()=>funtEstado("cancelada", tutoria.id)}>Cancelar</button>
      </div>}
      {/* eliminar la tutoria (solo si esta cancelada) */}
      {tutoria.estado === "cancelada" &&
      <div className="w-full h-fit p-2 flex items-end justify-end">
        <button className="bg-red-800 w-fit min-w-24 h-fit p-1 rounded-xl" onClick={()=>funcEliminar(tutoria.id)} >Eliminar</button>
      </div>}
      {tutoria.notas && <p className="text-xs text-gray-400 border-t border-gray-700 pt-2">{tutoria.notas}</p>}
    </article>
  );
}
