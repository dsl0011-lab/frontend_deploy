import { useContext } from "react"
import { UsuarioContext } from "../useContext/UsuarioContext"
import Calendario from "./Calendario";

    const Inicio = () => {
    const { usuario } = useContext(UsuarioContext);
        return(
        <section className="flex flex-col items-center justify-center h-full w-full">
            <div className='text-white text-2xl'>
                {usuario.gender === "M"
                    ? `Bienvenido ${usuario.first_name} ${usuario.last_name}`
                    : `Bienvenida ${usuario.first_name} ${usuario.last_name}`}
            </div>
            <Calendario />
        </section>
        )
    }

export default Inicio