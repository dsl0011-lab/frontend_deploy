import { useState } from 'react'
// Imports del calendario
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

function Calendario() {
    const [eventos, setEventos] = useState([
        {
            title: "Clase de Literatura",
            start: new Date(2025, 9, 28, 10, 0),
            end: new Date(2025, 9, 28, 11, 30),
        },
        {
            title: "Estudio de React",
            start: new Date(2025, 9, 29, 15, 0),
            end: new Date(2025, 9, 29, 17, 0),
        },
    ]);

    const locales = { es };
    const localizer = dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales,
    });

    const [nuevoTitulo, setNuevoTitulo] = useState("");
    const [nuevoInicio, setNuevoInicio] = useState("");
    const [nuevoFin, setNuevoFin] = useState("");
    const [fechaActual, setFechaActual] = useState(new Date());
    const [vista, setVista] = useState("month");


    return (
        <>
            <section className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Calendario de clases
                </h2>
                <Calendar
                    localizer={localizer}
                    events={eventos}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    date={fechaActual}
                    view={vista}
                    onNavigate={(nuevaFecha) => setFechaActual(nuevaFecha)}
                    onView={(nuevaVista) => setVista(nuevaVista)}
                    messages={{
                        next: "Siguiente",
                        previous: "Anterior",
                        today: "Hoy",
                        month: "Mes",
                        week: "Semana",
                        day: "Día",
                    }}
                />

                {/* Formulario para añadir eventos */}
                <section className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                        Agregar evento
                    </h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setEventos([
                                ...eventos,
                                {
                                    title: nuevoTitulo,
                                    start: new Date(nuevoInicio),
                                    end: new Date(nuevoFin),
                                },
                            ]);
                            setNuevoTitulo("");
                            setNuevoInicio("");
                            setNuevoFin("");
                        }}
                        className="flex flex-col gap-2"
                    >
                        <input
                            type="text"
                            placeholder="Título del evento"
                            value={nuevoTitulo}
                            onChange={(e) => setNuevoTitulo(e.target.value)}
                            className="p-2 border rounded"
                            required
                        />
                        <input
                            type="datetime-local"
                            value={nuevoInicio}
                            onChange={(e) => setNuevoInicio(e.target.value)}
                            className="p-2 border rounded"
                            required
                        />
                        <input
                            type="datetime-local"
                            value={nuevoFin}
                            onChange={(e) => setNuevoFin(e.target.value)}
                            className="p-2 border rounded"
                            required
                        />
                        <button
                            type="submit"
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Agregar evento
                        </button>
                    </form>
                </section>
            </section>
        </>
    )
}

export default Calendario