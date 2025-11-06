// src/componentes/Dashboard/Sidebar.jsx
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UsuarioContext } from "../useContext/UsuarioContext";

const Sidebar = () => {
  const { usuario } = useContext(UsuarioContext);

  return (
    <aside className={`w-full h-full min-h-screen absolute md:static bg-gray-800 dark:bg-gray-800 text-white p-6 flex flex-col`}>
      <h2 className="text-2xl font-bold mb-8">Aula Virtual</h2>

      <nav className="w-auto h-full flex flex-col gap-4 bg-gray-700 p-4">
        <Link to='/' className="hover:text-gray-400">Inicio</Link>
        <Link to='/perfil' className="hover:text-gray-400">Perfil</Link>
        {/* muestra el componente con al rutina dependiendo el role del usuario*/}
      {
        (usuario?.role === "T" ? <Link to='/profesor' className="hover:text-gray-400">Panel Profesor</Link> : (
          usuario?.role === "S" ? <Link to='/estudiante' className="hover:text-gray-400">Panel Estudiante</Link> : (
            // aqui se podra colocar la ruta para un componente admin dentro de la app
            <p>Panel Admin</p>
        )))
      }
      </nav>
    </aside>
  );
}

export default Sidebar;
