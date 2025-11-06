import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { apiFetch } from '../Profesor/api';
import { imagenesRandom } from './fotos';

function CursoDetallePageEstudiante() {
    const { id } = useParams();
    const [asignatura, setAsignatura] = useState(null)

    useEffect(() => {
        apiFetch(`/api/estudiante/cursos/${id}/`).then(setAsignatura);
        // apiFetch(`/api/profesor/tareas/`).then(ts => setTareas(ts.filter(t => String(t.curso) === String(id))));
    }, [id]);

    if (asignatura === null) return <p>cargando datos...</p>

    return (
        <>{
            asignatura !== null && <div className='h-[300px] w-full flex items-start justify-center'>
                <div key={asignatura.id} className="w-full h-full flex flex-col justify-center items-center rounded-md relative">
                    <div className="absolute inset-0 bg-cover bg-center filter opacity-50"
                        style={{ backgroundImage: `URL(${imagenesRandom()})`, backgroundSize: "cover", filter: "blur(6px)" }}
                    ></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-white text-4xl text-center gap-4 p-2">
                        <p>Asignatura: {asignatura.nombre}</p>
                        <p>Descripción del curso: {asignatura.descripcion}</p>
                        <p>Profesor: {`${asignatura.nombre_profesor} ${asignatura.apellidos_profesor}`}</p>
                    </div>
                </div>
            </div>        
        }</>
    )
}

export default CursoDetallePageEstudiante