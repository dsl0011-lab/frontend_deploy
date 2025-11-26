import { useEffect, useMemo, useState } from "react";

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DOW_ES = ["L", "M", "X", "J", "V", "S", "D"];

function toDateOnlyISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarioTareas({
  tareas = [],
  cursos = [],
  tutorias = [],
  examenes = [],
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(toDateOnlyISO(today));

  const cursosById = useMemo(
    () => Object.fromEntries(cursos.map((c) => [String(c.id), c])),
    [cursos]
  );

  const agendaByDate = useMemo(() => {
    const map = {};
    const ensure = (key) => {
      if (!map[key]) map[key] = { tareas: [], tutorias: [], examenes: [] };
      return map[key];
    };

    for (const tarea of tareas || []) {
      if (!tarea?.fecha_entrega) continue;
      const date = new Date(tarea.fecha_entrega);
      if (Number.isNaN(date.getTime())) continue;
      ensure(toDateOnlyISO(date)).tareas.push(tarea);
    }

    for (const tutoria of tutorias || []) {
      if (!tutoria?.fecha) continue;
      const date = new Date(tutoria.fecha);
      if (Number.isNaN(date.getTime())) continue;
      ensure(toDateOnlyISO(date)).tutorias.push(tutoria);
    }

    for (const examen of examenes || []) {
      const fechaExamen = examen?.fecha_examen || examen?.fecha_evaluacion;
      if (!fechaExamen) continue;
      const date = new Date(fechaExamen);
      if (Number.isNaN(date.getTime())) continue;
      ensure(toDateOnlyISO(date)).examenes.push(examen);
    }

    Object.values(map).forEach(
      ({ tareas: ts, tutorias: tt, examenes: exs }) => {
        ts.sort(
          (a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega)
        );
        tt.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        exs.sort((a, b) => {
          const fa = a.fecha_examen || a.fecha_evaluacion;
          const fb = b.fecha_examen || b.fecha_evaluacion;
          return new Date(fa) - new Date(fb);
        });
      }
    );

    return map;
  }, [tareas, tutorias, examenes]);

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDowMon0 = (firstDay.getDay() + 6) % 7;

  const days = [];
  for (let i = 0; i < firstDowMon0; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const selectedAgenda = agendaByDate[selected] || {
    tareas: [],
    tutorias: [],
    examenes: [],
  };

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function selectDay(day) {
    if (!day) return;
    setSelected(toDateOnlyISO(new Date(year, month, day)));
  }

  useEffect(() => {
    const sel = new Date(selected);
    if (sel.getFullYear() !== year || sel.getMonth() !== month) {
      setSelected(toDateOnlyISO(new Date(year, month, 1)));
    }
  }, [month, year, selected]);

  return (
    <div className="bg-gray-900 rounded p-4 space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="px-2 py-1 rounded border border-gray-700 hover:bg-gray-800"
        >
          {"<"}
        </button>
        <div className="font-semibold text-gray-100">
          {MONTHS_ES[month]} {year}
        </div>
        <button
          onClick={nextMonth}
          className="px-2 py-1 rounded border border-gray-700 hover:bg-gray-800"
        >
          {">"}
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-400/80" />
          <span>Tareas</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-indigo-400/80" />
          <span>Tutorías</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-400/80" />
          <span>Exámenes</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
        {DOW_ES.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const key = day ? toDateOnlyISO(new Date(year, month, day)) : null;
          const entry = key ? agendaByDate[key] : null;
          const hasTasks = entry?.tareas?.length > 0;
          const hasTutorias = entry?.tutorias?.length > 0;
          const hasExamenes = entry?.examenes?.length > 0;
          const isSelected = key === selected;

          return (
            <button
              key={idx}
              onClick={() => selectDay(day)}
              disabled={!day}
              className={`h-16 rounded flex flex-col items-center justify-center border ${
                day ? "border-gray-700" : "border-transparent"
              } ${
                isSelected ? "bg-blue-900/40" : "bg-gray-800"
              } hover:bg-gray-700/60`}
            >
              <div
                className={`text-sm ${
                  day ? "text-gray-100" : "text-transparent"
                }`}
              >
                {day || "-"}
              </div>
              {(hasTasks || hasTutorias || hasExamenes) && (
                <div className="mt-1 flex items-center justify-center gap-1">
                  {hasTasks && (
                    <span className="text-[10px] min-w-[14px] text-center px-1 rounded-full bg-emerald-500/20 text-emerald-200">
                      {entry.tareas.length}
                    </span>
                  )}
                  {hasTutorias && (
                    <span className="text-[10px] min-w-[14px] text-center px-1 rounded-full bg-indigo-500/20 text-indigo-200">
                      {entry.tutorias.length}
                    </span>
                  )}
                  {hasExamenes && (
                    <span className="text-[10px] min-w-[14px] text-center px-1 rounded-full bg-red-500/20 text-red-200">
                      {entry.examenes.length}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <section>
          <div className="text-sm font-semibold text-gray-200 mb-1">
            Tareas
          </div>
          {selectedAgenda.tareas.length === 0 ? (
            <div className="text-xs text-gray-400">
              Sin tareas para este día
            </div>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-auto pr-1">
              {selectedAgenda.tareas.map((tarea) => {
                const curso = cursosById[String(tarea.curso)];
                return (
                  <li
                    key={tarea.id}
                    className="bg-gray-800 rounded p-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-100">
                        {tarea.titulo}
                      </div>
                      {curso && (
                        <div className="text-xs text-gray-400">
                          Curso: {curso.nombre}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-300">
                      {new Date(tarea.fecha_entrega).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <div className="text-sm font-semibold text-gray-200 mb-1">
            Tutorías
          </div>
          {selectedAgenda.tutorias.length === 0 ? (
            <div className="text-xs text-gray-400">
              Sin tutorías para este día
            </div>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-auto pr-1">
              {selectedAgenda.tutorias.map((tutoria) => (
                <li
                  key={tutoria.id}
                  className="bg-gray-800 rounded p-2 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-100">
                      {tutoria.asignatura}
                    </div>
                    <div className="text-xs text-gray-400">
                      Profesor:{" "}
                      {tutoria.profesor_nombre || tutoria.profesor_username} -
                      Alumno: {tutoria.alumno_nombre || tutoria.alumno_username}
                    </div>
                  </div>
                  <div className="text-xs text-gray-300">
                    {new Date(tutoria.fecha).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="text-sm font-semibold text-gray-200 mb-1">
            Exámenes
          </div>
          {selectedAgenda.examenes.length === 0 ? (
            <div className="text-xs text-gray-400">
              Sin exámenes para este día
            </div>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-auto pr-1">
              {selectedAgenda.examenes.map((examen) => {
                const curso = cursosById[String(examen.curso)];
                const nombre =
                  examen.nombre_evaluacion || examen.titulo || "Examen";
                const fecha =
                  examen.fecha_examen || examen.fecha_evaluacion;
                return (
                  <li
                    key={examen.id}
                    className="bg-gray-800 rounded p-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-100">
                        {nombre}
                      </div>
                      {curso && (
                        <div className="text-xs text-gray-400">
                          Curso: {curso.nombre}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-300">
                      {fecha
                        ? new Date(fecha).toLocaleDateString("es-ES")
                        : "-"}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
