import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { apiFetch } from "../Profesor/api";
import { imagenesRandom } from './scripts/fotos'

const CursosPageStudent = () => {
  const [ cursos, setCursos ] = useState([])
  const navigate = useNavigate()

  useEffect(()=>{
    apiFetch("/estudiante/cursos/", ).then(setCursos); 
  }, [])

  const verCurso = (id) =>{
    navigate(`/estudiante/cursos/${id}`)
  }

  return (
    <div className="text-xs md:text-base xl:text-2xl flex flex-wrap items-center justify-evenly w-full h-full gap-4">
      {/* si el estudiante no tiene cursos se muestra el siguiente mensaje */}
      {cursos.length === 0 && (<p>No tienes cursos asignados aún</p>)}
      {cursos && cursos !== undefined ? cursos.map((curso ) => (
        <div key={curso.id} className="md:w-96 xs:w-72 w-40 h-44 flex flex-col justify-center items-center rounded-md relative overflow-hidden cursor-pointer hover:scale-90 duration-300"
        onClick={()=>verCurso(curso.id)}>
            <div className="absolute inset-0 bg-cover bg-center filter opacity-50"
            style={{backgroundImage: `URL(${imagenesRandom()})`, backgroundSize: "cover", filter: "blur(3px)"}}
            ></div>
            <div className="relative z-10 flex flex-col items-center justify-center text-white text-center p-2">
              <p className="font-semibold drop-shadow-md">{curso.nombre}</p>
              <p className="opacity-90">{`${curso.nombre_profesor} ${curso.apellidos_profesor}`}</p>
            </div>
        </div>
      ))
      : <p>cargando...</p>
    }
    </div>
  );
}

export default CursosPageStudent
