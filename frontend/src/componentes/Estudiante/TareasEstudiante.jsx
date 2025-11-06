import React from 'react'
import { useEffect, useState } from "react";
import { apiFetch } from '../Profesor/api';

const TareasEstudiante = () => {
const [tareas, setTareas] = useState([]);
    useEffect(() => { apiFetch("/api/estudiante/tareas/").then(setTareas) }, []);
    return (
        <div className='w-full h-full'>
            <h3 className="text-xl font-bold mb-3">Tareas (todas mis clases)</h3>
            <ul className="w-full h-full p-2">
                {tareas.map(t => (<li key={t.id} className="border rounded p-2 flex flex-row w-full mt-4">
                    <div className="font-semibold w-2/4">
                        <p>Titulo: {t.titulo}</p>
                        <p>Descripción: {t.descripcion}</p>
                        <p>Fecha de entrega: {t.fecha_entrega}</p>
                        <p>Asignatura: {t.curso}</p>
                    </div>
                    <div className='flex items-center justify-end w-full h-12/12'>
                        <button className='w-2/4 h-12 max-w-24 min-w-24 bg-slate-900 text-white hover:bg-slate-600 rounded-lg'>Ver</button></div>
                </li>))}
            </ul>
        </div>
    );
}

export default TareasEstudiante