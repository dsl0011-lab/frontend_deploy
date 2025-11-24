import { Link, Outlet } from "react-router-dom";
import ResumenAlumnosPanel from "./ResumenAlumnosPanel";

export default function LayoutProfesor() {
  return (
    // 3 columnas: izquierda (nav), centro (contenido), derecha (resumen)
    <div className="min-h-screen grid grid-cols-[18rem_1fr_26rem] gap-4 p-3
                    text-white dark:bg-gray-800">
      {/* ASIDE IZQUIERDA: navegación */}
      <aside className="h-screen sticky top-0 border-r border-gray-700 p-4 space-y-4 overflow-y-auto rounded-xl">
        <h1 className="text-xl font-bold">Panel Profesor</h1>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to="">Cursos</Link>
          <Link to="tareas">Tareas</Link>
          <Link to="calificaciones">Calificaciones</Link>
        </nav>
      </aside>

      {/* CONTENIDO CENTRAL */}
      <main className="min-h-screen p-4 border border-gray-700 rounded-xl">
        <Outlet />
      </main>

      {/* ASIDE DERECHA: resumen grande */}
      <aside className="h-screen sticky top-0 border-l border-gray-700 p-4 rounded-xl overflow-y-auto">
        <ResumenAlumnosPanel />
      </aside>
    </div>
  );
}
