// src/componentes/Dashboard/Sidebar.jsx
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UsuarioContext } from "../useContext/UsuarioContext";
import perfil from '../../assets/img-perfil.svg'
import inicio from '../../assets/img-inicio.svg'
import tutoria from '../../assets/img-tutoria.svg'
import cursos from '../../assets/img-cursos.svg'
import mensajeria from '../../assets/img-mensajeria.svg'

const Sidebar = () => {
  const { usuario } = useContext(UsuarioContext);
  const navigate = useNavigate();
  const ir = (link)=>{
      navigate(link)
  }

  return (
    <aside className={`w-full h-full min-h-screen text-2xl absolute md:static mdh:bg-green-400 bg-gray-800 dark:bg-gray-800 text-white p-6 mdh:p-[1px] flex flex-col`}>
      <nav className="w-auto h-full mdh:text-sm  mdh:overflow-y-auto flex flex-col gap-4 bg-gray-700 p-4">
        <button onClick={()=>ir('/')} className="flex-1 bg-slate-900 flex items-center justify-center flex-col p-1 gap-1 hover:bg-sky-950 rounded-2xl">
          <img src={inicio} className="mdh:w-6/12 mdh:h-6/12 w-[45px] h-[45px]" />
          <p className="w-12/12 h-6/12 mdh:w-fit mdh:h-fit">Inicio</p>
        </button>
        <button onClick={()=>ir('/perfil')} className="flex-1 bg-slate-900 flex items-center justify-center flex-col p-1 gap-1 hover:bg-sky-950 rounded-2xl">
          <img src={perfil} className="mdh:w-6/12 mdh:h-6/12 w-[45px] h-[45px]" />
          <p className="w-12/12 h-6/12 mdh:w-fit mdh:h-fit">Perfil</p>
        </button>
        <button onClick={()=>ir('/mensajes')} className="flex-1 bg-slate-900 flex items-center justify-center flex-col p-1 gap-1 hover:bg-sky-950 rounded-2xl">
          <img src={mensajeria} className="mdh:w-6/12 mdh:h-6/12 w-[45px] h-[45px]" />
          <p className="w-12/12 h-6/12 mdh:w-fit mdh:h-fit">Mensajes</p>
        </button>
        <button onClick={()=>ir('/tutorias')}className="flex-1 bg-slate-900 flex items-center justify-center flex-col p-1 gap-1 hover:bg-sky-950 rounded-2xl">
          <img src={tutoria} className="mdh:w-6/12 mdh:h-6/12 w-[45px] h-[45px]" />
          <p className="w-12/12 h-6/12 mdh:w-fit mdh:h-fit">Tutorias</p>
        </button>
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