import { useContext, useState } from "react"
import { UsuarioContext } from "../useContext/UsuarioContext"
import { Outlet, useLocation } from "react-router-dom"
import nvImg from '../../assets/sideBarIcon.svg'
import exit from '../../assets/exit.svg'
import Sidebar from "./Sidebar"
import Inicio from "./Inicio"
import { Logout } from "../Authorization/scripts/Security"

const Dashboard = () => {
    const { setUsuario } = useContext(UsuarioContext)
    const [showNB, setShowNB] = useState(false)
    const location = useLocation();

    return (
        <main className="flex h-full w-full bg-gray-50 dark:bg-gray-900">
            <div
                className={`fixed top-0 left-0 h-12/12 w-64 bg-white shadow-lg 
                transition-transform duration-1000 ease-in-out
                ${showNB ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0 md:static md:w-64 z-50`}
            >
                <Sidebar showNB={showNB} setShowNB={setShowNB} />
                <img src={nvImg} className="w-8 h-8 m-2 pr-1 rounded-r-lg bg-white hover:bg-gray-400 absolute md:static top-60 right-[-40px] md:hidden md:w-0 md:h-0" 
                onClick={()=>(setShowNB((prev) => !prev))}
                />
            </div>
            <section className="flex flex-col w-full h-auto p-4 z-0">
                <article className="relative top-0 w-full h-2/12">
                    <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        Tablero
                    </h3>
                    <button onClick={() => (Logout(), setUsuario(() => ""))} className='bg-white w-12 h-12 hover:bg-gray-400 text-lg rounded-2xl p-2 ml-2 absolute top-0 right-0'>
                        <img src={exit} className="w-fit h-fit" />
                    </button>
                </article>
                <article className="flex-1 p-6">
                    {location.pathname == '/' && <Inicio /> }
                    <Outlet />
                </article>
            </section>
        </main>
    )
}
export default Dashboard
