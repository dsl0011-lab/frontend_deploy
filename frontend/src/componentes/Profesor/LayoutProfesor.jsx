import { NavLink, Outlet } from "react-router-dom";
export default function LayoutProfesor() {
  return (
    <div className="min-h-screen flex text-white dark:bg-gray-800 rounded-lg shadow p-2">
      <aside className="w-64 border-r p-4 space-y-2">
        <h1 className="text-xl font-bold mb-4">Panel Profesor</h1>
        <nav className="flex flex-col gap-2">
          <NavLink to="">Cursos</NavLink>
          <NavLink to="tareas">Tareas</NavLink>
          <NavLink to="calificaciones">Calificaciones</NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-4 ">
        <Outlet />
      </main>
    </div>
  );
}
