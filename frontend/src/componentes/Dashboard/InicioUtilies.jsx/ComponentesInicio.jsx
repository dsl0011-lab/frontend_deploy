import React, { useMemo } from 'react';
import { Link } from "react-router-dom";

export default function ComponentesInicio({ tareas, cursos, loading, usuario }) {

    // Memo para próximas 5 tareas (alumno)
    const proximasTareas = useMemo(() => {
        const withDate = tareas.map((t) => ({
            ...t,
            _date: t.fecha_entrega ? new Date(t.fecha_entrega) : null,
        }));
        withDate.sort((a, b) => {
            const ad = a._date ? a._date.getTime() : Infinity;
            const bd = b._date ? b._date.getTime() : Infinity;
            return ad - bd;
        });
        return withDate.slice(0, 5);
    }, [tareas]);

    // Mini componente: Asignaturas
    const AsignaturasCard = ({ cursos }) => (
        <div className="p-4 rounded-lg bg-gray-800 text-white">
            <div className="text-sm opacity-70">Asignaturas inscritas</div>
            <div className="text-3xl font-bold">{cursos.length}</div>
            <Link
                to="/asignaturas"
                className="text-blue-400 hover:underline mt-2 inline-block"
            >
                Ver asignaturas
            </Link>
        </div>
    );

    // Mini componente: cada tarea
    const TareaItem = ({ tarea, curso }) => (
        <li key={tarea.id} className="bg-gray-900 rounded p-3">
            <div className="flex items-center justify-between">
                <span className="font-medium">{tarea.titulo}</span>
                <span className="text-xs opacity-80">
                    {tarea.fecha_entrega ? new Date(tarea.fecha_entrega).toLocaleString() : "Sin fecha"}
                </span>
            </div>
            {curso && (
                <div className="text-xs opacity-70 mt-1">Asignatura: {curso.nombre}</div>
            )}
        </li>
    );

    // Mini componente: Próximas tareas
    const ProximasTareasCard = ({ tareas, cursos }) => (
        <div className="p-4 rounded-lg bg-gray-800 text-white md:col-span-2">
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm opacity-70">Próximas tareas</div>
                <Link to="/asignaturas" className="text-blue-400 hover:underline">
                    Ver todas
                </Link>
            </div>
            {tareas.length === 0 ? (
                <div className="text-sm opacity-70">No hay tareas cercanas</div>
            ) : (
                <ul className="space-y-2">
                    {tareas.map((t) => {
                        const c = cursos.find((x) => String(x.id) === String(t.curso));
                        return <TareaItem key={t.id} tarea={t} curso={c} />;
                    })}
                </ul>
            )}
        </div>
    );

    // Contenedor alumno
    const ResumenAlumno = () => {
        if (!(usuario?.role === "S" && !loading)) return null;

        return (
            <div className="grid gap-4 md:grid-cols-3 items-start">
                <AsignaturasCard cursos={cursos} />
                <ProximasTareasCard tareas={proximasTareas} cursos={cursos} />
            </div>
        )}

        // Render principal del componente 
    return (
        <>
            {!loading && usuario?.role === "S" && <ResumenAlumno />}
        </>
    );
};