// src/componentes/Dashboard/Sidebar.jsx
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UsuarioContext } from "../useContext/UsuarioContext";
// import perfil from '../../assets/img-perfil.svg'
// import inicio from '../../assets/img-inicio.svg'
// import tutoria from '../../assets/img-tutoria.svg'
import cursos from '../../assets/img-cursos.svg'

const Sidebar = () => {
  const { usuario } = useContext(UsuarioContext);
  const navigate = useNavigate();
  const ir = (link)=>{
      navigate(link)
  }

  return (
    <aside className={`w-full h-full min-h-screen absolute md:static bg-gray-800 dark:bg-gray-800 text-white p-6 flex flex-col`}>
      <h2 className="text-2xl font-bold mb-8">Aula Virtual</h2>

      <nav className="w-auto h-full flex flex-col gap-4 bg-gray-700 p-4">
        <Link to='/' className="hover:text-gray-400">Inicio</Link>
        <Link to='/perfil' className="hover:text-gray-400">Perfil</Link>
        <Link to='/mensajes' className="hover:text-gray-400">Mensajes</Link>
        <Link to='/tutorias' className="hover:text-gray-400">Tutorias</Link>
        {/* muestra el componente con al rutina dependiendo el role del usuario*/}
      {
        (usuario?.role === "T" ? 
        <button onClick={()=>ir('/profesor')}className="flex-1 bg-slate-900 flex items-center justify-center flex-col p-1 gap-1 hover:bg-sky-950 rounded-2xl">
          <img src={cursos} className="mdh:w-6/12 mdh:h-6/12 w-[45px] h-[45px]" />
          <p className="w-12/12 h-6/12 mdh:w-fit mdh:h-fit">Panel Profesor</p>
        </button>
        : (
          usuario?.role === "S" ? (   
        <button onClick={()=>ir('/estudiante')}className="flex-1 bg-slate-900 flex items-center justify-center flex-col p-1 gap-1 hover:bg-sky-950 rounded-2xl">
          <img src={cursos} className="mdh:w-6/12 mdh:h-6/12 w-[45px] h-[45px]" />
          <p className="w-12/12 h-6/12 mdh:w-fit mdh:h-fit">Panel Estudiante</p>
        </button>
          ) : (
            // aqui se podra colocar la ruta para un componente admin dentro de la app
            <p>Panel Admin</p>
        )))
      }
      </nav>
    </aside>
  );
}

export default Sidebar;
