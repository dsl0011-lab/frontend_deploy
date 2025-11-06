import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { apiFetch } from "../Profesor/api";
import { imagenesRandom } from "./fotos";

const CursosPageStudent = () => {
  const [ cursos, setCursos ] = useState("")
  // const [ imagenes ] = useState([fondo1, fondo2, fondo3, fondo4, fondo5])
  const navigate = useNavigate()

  useEffect(()=>{
    apiFetch(`/api/estudiante/cursos/`).then(setCursos);
  }, [])

  const verCurso = (id) =>{
    navigate(`/estudiante/cursos/${id}`)
  }

  return (
    <div className="flex flex-wrap w-full h-full gap-4">
      {cursos && cursos !== undefined ? cursos.map((curso) => (
        <div key={curso.id} className="w-96 h-44 flex flex-col justify-center items-center rounded-md relative overflow-hidden cursor-pointer hover:scale-90 duration-300"
        onClick={()=>verCurso(curso.id)}>
            <div className="absolute inset-0 bg-cover bg-center filter opacity-50"
            style={{backgroundImage: `URL(${imagenesRandom()})`, backgroundSize: "cover", filter: "blur(3px)"}}
            ></div>
            <div className="relative z-10 flex flex-col items-center justify-center text-white text-center p-2">
              <p className="text-2xl font-semibold drop-shadow-md">{curso.nombre}</p>
              <p className="text-xl opacity-90">{`${curso.nombre_profesor} ${curso.apellidos_profesor}`}</p>
            </div>
        </div>
      ))
      : <p>Cargando cursos...</p>
    }
    </div>
  );
}

export default CursosPageStudent