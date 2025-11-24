import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { apiFetch } from '../Profesor/api';
import { imagenesRandom } from './scripts/fotos'
import { convertirFecha } from './scripts/conversionFecha'

function CursoDetallePageEstudiante() {
    const { id } = useParams();
    const [ asignatura, setAsignatura ] = useState(null)
    const [ tareas, setTareas ] = useState([])

    useEffect(()=>{
        asignatura !== null && setTareas(asignatura?.tareas)
    },[asignatura])

    useEffect(() => {
        apiFetch(`/estudiante/cursos/${id}/`).then(setAsignatura);
    }, [id]);

    if (asignatura === null) return <p>cargando datos...</p>

    return (
        <section className='flex flex-col gap-6 w-full h-full'>{
            asignatura !== null && <article className='h-full w-full p-4 flex items-start justify-center'>
                <div key={asignatura.id} className="flex flex-col md:text-2xl text-sm h-full w-full min-h-[200px] justify-center items-center rounded-md relative">
                    <div className="absolute w-full h-full inset-0 bg-cover bg-center filter opacity-50"
                        style={{ backgroundImage: `URL(${imagenesRandom()})`, backgroundSize: "cover", filter: "blur(4px)" }}
                    ></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-white text-center gap-4 p-2">
                        <p>Asignatura: {asignatura.nombre}</p>
                        <p>Descripción del curso: {asignatura?.descripcion ? asignatura.descripcion : "No hay descripción recurrente"}</p>
                        <p>Profesor: {`${asignatura.nombre_profesor} ${asignatura.apellidos_profesor}`}</p> 
                    </div>
                </div>
            </article>        
        }
            <article className='flex flex-col w-full h-full min-h-[200px] bg-gray-900 rounded-xl'>
                <div className='w-full min-w-full'>
                    <h3 className='h-fit w-fit p-2 m-4'>Tareas asignadas</h3>
                </div>
                <div className='flex flex-wrap justify-center p-4 w-full h-fit gap-4'>{
                    tareas && tareas.length > 0 ? tareas.map((inf) => (
                        <div key={inf.id} className='flex-1 flex flex-col gap-2 border-2 border-violet-300 max-w-[500px] p-3 border-double rounded-2xl'>
                            <p className='h-fit w-full text-center border-dashed border-2 border-sky-950 rounded-2xl p-2'>{inf.titulo}</p>
                            <p className='h-full min-h-[150px] w-full border-dashed border-2 border-sky-950 rounded-2xl p-2' 
                            >Descripcion: {inf.descripcion ? inf.descripcion : "No hay descripción relevante para esta tarea"}</p>
                            <div className='flex flex-row justify-between w-full h-fit'>
                                <button className='p-2 hover:bg-slate-900 bg-sky-950 border-2 border-sky-500 rounded-2xl min-w-24 justify-self-center
                                '>Ver</button>
                                <p className='border-dashed border-2 border-sky-950 rounded-2xl p-2'>Fecha límite: {convertirFecha(inf.fecha_entrega)}</p>
                            </div>
                        </div>
                    )) : <p>No tienes tareas asignadas aún.</p>
                }</div>
            </article>
        </section>
    )
}

export default CursoDetallePageEstudiante
