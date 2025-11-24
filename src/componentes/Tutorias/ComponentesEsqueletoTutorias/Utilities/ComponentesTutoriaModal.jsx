import { useEffect, useState } from "react"


function ComponentesTutoriaModal({ onClose, usuario, cursos, form, alumnos, loadingAlumnos, errorAlumnos, estados, handleChange, handleSubmit }) {
    const [ cursoElegido, setCursoElegido ] = useState(null);


    const SelectComponent = ({ form, cursos, handleChange }) => {
        return (
            <select
            name="cursoId"
            className="w-full p-2 rounded bg-zinc-800 text-white"
            value={form.cursoId}
            onChange={handleChange}
            >
                <option value="">Selecciona una asignatura</option>
                {cursos.map((curso, index) => (
                    <option key={index} value={curso.id}>
                        {curso.nombre}
                    </option>
                ))}
            </select>
        )
    }


    useEffect(() => {
        setCursoElegido(cursos.filter(curso => curso.id.toString() === form.cursoId));
    }, [form, cursos])
    


    const SeleccionarProfesor = ({ form, cursoElegido, handleChange }) => {
        return (
            <div className="space-y-2">
                <label className="block text-xs text-gray-400">Profesores</label>
                <select
                    name="profesor"
                    className="w-full p-2 rounded bg-zinc-800 text-white"
                    value={form?.profesor ? form.profesor : ""}
                    onChange={handleChange}
                >
                    <option value="">Selecciona un Profesor</option>
                    {cursoElegido.length > 0 && cursoElegido.map((data) => (
                        // profesor esta definido como profesor_id
                        <option key={data?.profesor} value={data?.profesor}>
                            {data.nombre_profesor || data.apellidos_profesor
                                ? `${data.nombre_profesor} ${data.apellidos_profesor}`.trim()
                                : data.profesor_username}
                        </option>
                    ))}
                </select>
            </div>
        )
    }

    const SeleccionarAlumno = ({ form, alumnos, handleChange }) => {
        return (
            <div className="space-y-2">
                <label className="block text-xs text-gray-400">Alumnos inscritos</label>
                <select
                    name="alumnoId"
                    className="w-full p-2 rounded bg-zinc-800 text-white"
                    value={form.alumnoId}
                    onChange={handleChange}
                    disabled={loadingAlumnos}
                >
                    <option value="">Selecciona un alumno</option>
                    {alumnos.map((alumno) => (
                        <option key={alumno.id} value={alumno.id}>
                            {alumno.first_name || alumno.last_name
                                ? `${alumno.first_name} ${alumno.last_name}`.trim()
                                : alumno.username}
                        </option>
                    ))}
                </select>
                {errorAlumnos && <p className="text-xs text-red-400">{errorAlumnos}</p>}
                {!loadingAlumnos && alumnos.length === 0 && (
                    <p className="text-xs text-gray-400">No hay alumnos inscritos en esta asignatura.</p>
                )}
            </div>
        )
    }

    const SelectAsignaturaManual = () => {
        return (
            <input
                type="text"
                name="asignaturaManual"
                placeholder="Asignatura"
                className="w-full p-2 rounded bg-zinc-800 text-white"
                value={form.asignaturaManual}
                onChange={handleChange}
            />
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {cursos.length > 0 ? (
                <>
                    <SelectComponent form={form} cursos={cursos} handleChange={handleChange} />
                    {usuario?.role === "S" && form.cursoId && (<SeleccionarProfesor form={form} cursoElegido={cursoElegido} handleChange={handleChange} /> )}
                    {usuario?.role === "T" && form.cursoId && (<SeleccionarAlumno form={form} alumnos={alumnos} handleChange={handleChange} /> )}
                </>
            ) : (
                //si no hay cursos, permitir ingresar asignatura manualmente
                <SelectAsignaturaManual />
            )}
            {usuario?.role !== "S" && <input
                                        type="text"
                                        name="alumnoUsername"
                                        placeholder="Username del alumno (opcional)"
                                        className="w-full p-2 rounded bg-zinc-800 text-white"
                                        value={form.alumnoUsername}
                                        onChange={handleChange}
            />}
            <input
                type="datetime-local"
                name="fecha"
                className="w-full p-2 rounded bg-zinc-800 text-white"
                value={form.fecha}
                onChange={handleChange}
            />
            <select
                name="estado"
                className="w-full p-2 rounded bg-zinc-800 text-white"
                value={form.estado}
                onChange={handleChange}
            >
                {estados.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                        {estado.label}
                    </option>
                ))}
            </select>
            <textarea
                name="notas"
                placeholder="Notas adicionales (opcional)"
                className="w-full p-2 rounded bg-zinc-800 text-white min-h-[90px]"
                value={form.notas}
                onChange={handleChange}
            />
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-600 px-3 py-1 rounded">
                    Cancelar
                </button>
                <button type="submit" className="bg-indigo-600 px-3 py-1 rounded">
                    Guardar
                </button>
            </div>
        </form>
    )
}

export default ComponentesTutoriaModal