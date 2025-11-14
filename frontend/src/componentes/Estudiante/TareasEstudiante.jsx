import React from 'react'
import { useEffect, useState } from "react";
import { apiFetch } from '../Profesor/api';
import { convertirFecha } from './scripts/conversionFecha'

const TareasEstudiante = () => {
const [tareas, setTareas] = useState([]);
    useEffect(() => { apiFetch("/estudiante/tareas/").then(setTareas) }, []);

    return (
        <div className='w-full h-full bg-gray-900 p-4 text-xs md:text-base rounded-2xl'>
            <h3 className="font-bold text-center mb-3">Tareas (todas mis clases)</h3>
            <ul className="flex flex-wrap gap-8 w-full h-fit">
                {tareas.map(t => (
                    <li key={t.id} className="flex-1 flex flex-col gap-2 border-double border-2 border-sky-950 p-4 rounded-3xl md:min-w-[500px] xs:min-w-[250px] min-w-[150px]">
                        <div className="flex-1 flex flex-col gap-2 font-semibold">
                            <p className='rounded-md border-double border-2 border-cyan-950 p-2'>Titulo: {t.titulo}</p>
                            <p className='rounded-md border-double border-2 border-cyan-950 p-2'>Descripción: {t.descripcion}</p>
                            <p className='rounded-md border-double border-2 border-cyan-950 p-2'>Fecha de entrega: {convertirFecha(t.fecha_entrega)}</p>
                            <p className='rounded-md border-double border-2 border-cyan-950 p-2'>Asignatura: {t.curso}</p>
                        </div>
                        <div className='flex-1 flex items-end justify-center'>
                            <button className='p-2 hover:bg-slate-900 bg-sky-950 border-2 border-sky-500 rounded-2xl min-w-24 justify-self-center'
                            >ver</button>
                        </div>
                </li>))}
            </ul>
        </div>
    );
}

export default TareasEstudiante
