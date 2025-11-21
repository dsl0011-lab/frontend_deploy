import React from 'react'
import { NavLink, Outlet } from "react-router-dom";

function LayoutEstudiante() {

    return (
        <main className='min-h-screen flex flex-col text-white dark:bg-gray-800 rounded-lg shadow p-4'>
            <h1 className="text-xl font-bold mb-4">Panel Estudiante</h1>
            <aside className="flex items-center justify-center w-full h-fit p-2">
                <span className='w-full h-full flex items-center sm:flex-row flex-col justify-center gap-4'>
                    <nav className="flex flex-row gap-4">
                        <NavLink to="" className='bg-slate-900 hover:bg-sky-950 rounded-2xl p-2 md:p-4'>Cursos</NavLink>
                        <NavLink to="tareas" className='bg-slate-900 hover:bg-sky-950 rounded-2xl p-2 md:p-4'>Tareas</NavLink>
                    </nav>
                    <input className="text-white bg-gray-50 border border-gray-300 rounded-2xl w-full max-w-60 sm:max-w-96 h-auto p-1.5 sm:p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    placeholder='Busca un Curso'/>
                </span>
            </aside>
            <section className="flex-1 p-4 ">
                <Outlet />
            </section>
        </main>
    )
}

export default LayoutEstudiante